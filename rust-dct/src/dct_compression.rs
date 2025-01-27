use serde::{Deserialize, Serialize};
use std::f64::consts::PI;
use crate::matrix_ops::{self, Matrix, MatrixError};

#[derive(Serialize, Deserialize)]
pub struct CompressionResult {
    pub original_image: Matrix,
    pub compressed_image: Matrix,
    pub dct_matrices: Vec<Matrix>,
    pub compressed_dct_matrices: Vec<Matrix>,
    pub dct_zero_count: i32,
    pub compressed_dct_zero_count: i32,
    pub image_submatrices: Vec<Matrix>,
    pub compressed_image_submatrices: Vec<Matrix>,
    pub latex_calculations: Vec<String>,
}

// Standard JPEG quantization matrix for quality level 50
const QUANTIZATION_MATRIX: [[f64; 8]; 8] = [
    [16.0, 11.0, 10.0, 16.0, 24.0, 40.0, 51.0, 61.0],
    [12.0, 12.0, 14.0, 19.0, 26.0, 58.0, 60.0, 55.0],
    [14.0, 13.0, 16.0, 24.0, 40.0, 57.0, 69.0, 56.0],
    [14.0, 17.0, 22.0, 29.0, 51.0, 87.0, 80.0, 62.0],
    [18.0, 22.0, 37.0, 56.0, 68.0, 109.0, 103.0, 77.0],
    [24.0, 35.0, 55.0, 64.0, 81.0, 104.0, 113.0, 92.0],
    [49.0, 64.0, 78.0, 87.0, 103.0, 121.0, 120.0, 101.0],
    [72.0, 92.0, 95.0, 98.0, 112.0, 100.0, 103.0, 99.0],
];

const BLOCK_SIZE: usize = 8;
const PIXEL_NORMALIZATION_OFFSET: f64 = 127.0;

pub fn compress_image_dct(image: Matrix, width: usize, height: usize) -> Result<CompressionResult, MatrixError> {
    let dct_coefficient_matrix = calculate_dct_coefficients(BLOCK_SIZE)?;
    let dct_coefficient_matrix_transposed = matrix_ops::transpose(&dct_coefficient_matrix)?;
    
    let mut compressed_image = vec![vec![0.0; width]; height];
    let mut dct_matrices = Vec::new();
    let mut compressed_dct_matrices = Vec::new();
    let mut dct_zero_count = 0;
    let mut compressed_dct_zero_count = 0;
    let mut compressed_image_submatrices = Vec::new();
    let mut latex_calculations = Vec::new();

    // Partition the image into 8x8 blocks
    let image_submatrices = matrix_ops::partition_into_blocks(&image, BLOCK_SIZE)?;

    for submatrix in &image_submatrices {
        let normalized_matrix = normalize_pixel_values(submatrix)?;
        
        // Calculate DCT using matrix chain multiplication
        let dct_matrix = matrix_ops::multiply_chain(&[
            &dct_coefficient_matrix,
            &normalized_matrix,
            &dct_coefficient_matrix_transposed,
        ])?;
        
        let quantized_dct = quantize_dct_matrix(&dct_matrix)?;
        let reconstructed_matrix = reconstruct_image_block(
            &quantized_dct,
            &dct_coefficient_matrix_transposed,
            &dct_coefficient_matrix,
        )?;

        latex_calculations.push(generate_latex_documentation(
            submatrix,
            &normalized_matrix,
            &dct_matrix,
            &quantized_dct,
            &reconstructed_matrix,
        )?);

        update_compression_results(
            &mut dct_matrices,
            &mut compressed_dct_matrices,
            &mut dct_zero_count,
            &mut compressed_dct_zero_count,
            &mut compressed_image_submatrices,
            dct_matrix,
            quantized_dct,
            reconstructed_matrix.clone(),
        );

        matrix_ops::merge_blocks(&mut compressed_image, &reconstructed_matrix, dct_matrices.len() - 1, BLOCK_SIZE)?;
    }

    Ok(CompressionResult {
        original_image: image,
        compressed_image,
        dct_matrices,
        compressed_dct_matrices,
        dct_zero_count,
        compressed_dct_zero_count,
        image_submatrices,
        compressed_image_submatrices,
        latex_calculations,
    })
}

fn normalize_pixel_values(matrix: &Matrix) -> Result<Matrix, MatrixError> {
    Ok(matrix
        .iter()
        .map(|row| row.iter().map(|&x| x - PIXEL_NORMALIZATION_OFFSET).collect())
        .collect())
}

fn quantize_dct_matrix(dct_matrix: &Matrix) -> Result<Matrix, MatrixError> {
    if dct_matrix.len() != BLOCK_SIZE || dct_matrix[0].len() != BLOCK_SIZE {
        return Err(MatrixError::IncompatibleDimensions(
            format!("Expected {}x{} matrix for quantization", BLOCK_SIZE, BLOCK_SIZE)
        ));
    }

    let mut quantized = vec![vec![0.0; BLOCK_SIZE]; BLOCK_SIZE];
    for i in 0..BLOCK_SIZE {
        for j in 0..BLOCK_SIZE {
            quantized[i][j] = (dct_matrix[i][j] / QUANTIZATION_MATRIX[i][j]).round() 
                * QUANTIZATION_MATRIX[i][j];
        }
    }
    Ok(quantized)
}

fn reconstruct_image_block(
    quantized_dct: &Matrix,
    dct_transposed: &Matrix,
    dct_matrix: &Matrix,
) -> Result<Matrix, MatrixError> {
    let reconstructed = matrix_ops::multiply_chain(&[
        dct_transposed,
        quantized_dct,
        dct_matrix,
    ])?;
    
    Ok(reconstructed
        .iter()
        .map(|row| row.iter().map(|&value| value.round() + PIXEL_NORMALIZATION_OFFSET).collect())
        .collect())
}

fn calculate_dct_coefficients(size: usize) -> Result<Matrix, MatrixError> {
    let scale_factor = f64::sqrt(2.0 / size as f64);
    let mut coefficients = vec![vec![0.0; size]; size];
    
    for j in 0..size {
        coefficients[0][j] = scale_factor / f64::sqrt(2.0);
    }
    
    for i in 1..size {
        for j in 0..size {
            coefficients[i][j] = scale_factor * f64::cos(
                (i as f64 * (2 * (j + 1) - 1) as f64 * PI) / (2 * size) as f64
            );
        }
    }
    
    Ok(coefficients)
}

fn count_zero_coefficients(matrix: &Matrix) -> i32 {
    matrix
        .iter()
        .flat_map(|row| row.iter())
        .filter(|&&value| value.round().abs() == 0.0)
        .count() as i32
}

fn update_compression_results(
    dct_matrices: &mut Vec<Matrix>,
    compressed_dct_matrices: &mut Vec<Matrix>,
    dct_zero_count: &mut i32,
    compressed_dct_zero_count: &mut i32,
    compressed_image_matrices: &mut Vec<Matrix>,
    dct_matrix: Matrix,
    quantized_dct: Matrix,
    reconstructed_matrix: Matrix,
) {
    dct_matrices.push(dct_matrix.clone());
    compressed_dct_matrices.push(quantized_dct.clone());
    
    *dct_zero_count += count_zero_coefficients(&dct_matrix);
    *compressed_dct_zero_count += count_zero_coefficients(&quantized_dct);
    
    compressed_image_matrices.push(reconstructed_matrix);
}

fn generate_latex_documentation(
    original: &Matrix,
    normalized: &Matrix,
    dct: &Matrix,
    quantized: &Matrix,
    reconstructed: &Matrix,
) -> Result<String, MatrixError> {
    Ok(format!(
        r#"
        <p>Starting with submatrix $A$: \[ A = {} \]</p>
        
        <p>Converting to matrix $B$ by normalizing $A$ between $-127$ and $+127$:
            \[ B = A - 127 \] \[ B = {} \] </p>
        
        <p>Using the DCT coefficient matrix $C_8$: \[ {} \]</p>

        <p>Computing the DCT-II of matrix $B$: 
            \[ D = C_8 \times B \times C_{{ 8 }}^{{ T }} \]
            \[ D = {} \] </p>
        "#,
        matrix_ops::to_latex(original)?,
        matrix_ops::to_latex(normalized)?,
        matrix_ops::to_latex(&calculate_dct_coefficients(8)?)?,
        matrix_ops::to_latex(dct)?
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dct_coefficients_generation() {
        let coefficients = calculate_dct_coefficients(BLOCK_SIZE).unwrap();
        assert_eq!(coefficients.len(), BLOCK_SIZE);
        assert_eq!(coefficients[0].len(), BLOCK_SIZE);
    }

    #[test]
    fn test_quantization() {
        let input = vec![vec![1.0; BLOCK_SIZE]; BLOCK_SIZE];
        let quantized = quantize_dct_matrix(&input).unwrap();
        assert_eq!(quantized.len(), BLOCK_SIZE);
        assert_eq!(quantized[0].len(), BLOCK_SIZE);
    }
}