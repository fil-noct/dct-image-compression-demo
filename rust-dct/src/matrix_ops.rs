use std::error::Error;
use std::fmt;

pub type Matrix = Vec<Vec<f64>>;

#[derive(Debug)]
pub enum MatrixError {
    IncompatibleDimensions(String),
    EmptyMatrix,
}

impl fmt::Display for MatrixError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            MatrixError::IncompatibleDimensions(msg) => write!(f, "Incompatible matrix dimensions: {}", msg),
            MatrixError::EmptyMatrix => write!(f, "Operation cannot be performed on empty matrix"),
        }
    }
}

impl Error for MatrixError {}

pub struct MatrixDimensions {
    rows: usize,
    cols: usize,
}

impl MatrixDimensions {
    fn new(matrix: &Matrix) -> Result<Self, MatrixError> {
        if matrix.is_empty() || matrix[0].is_empty() {
            return Err(MatrixError::EmptyMatrix);
        }
        Ok(Self {
            rows: matrix.len(),
            cols: matrix[0].len(),
        })
    }
}

pub struct MatrixView<'a> {
    data: &'a Matrix,
    dimensions: MatrixDimensions,
}

impl<'a> MatrixView<'a> {
    pub fn new(matrix: &'a Matrix) -> Result<Self, MatrixError> {
        Ok(Self {
            data: matrix,
            dimensions: MatrixDimensions::new(matrix)?,
        })
    }
}

pub fn partition_into_blocks(matrix: &Matrix, block_size: usize) -> Result<Vec<Matrix>, MatrixError> {
    let dims = MatrixDimensions::new(matrix)?;
    let mut blocks = Vec::new();

    for i in (0..dims.rows).step_by(block_size) {
        if i + block_size > dims.rows {
            break;
        }

        for j in (0..dims.cols).step_by(block_size) {
            if j + block_size > dims.cols {
                break;
            }

            let block = extract_block(matrix, i, j, block_size);
            blocks.push(block);
        }
    }

    Ok(blocks)
}

fn extract_block(matrix: &Matrix, start_row: usize, start_col: usize, size: usize) -> Matrix {
    let mut block = Vec::with_capacity(size);
    for row in start_row..start_row + size {
        let block_row: Vec<f64> = matrix[row][start_col..start_col + size].to_vec();
        block.push(block_row);
    }
    block
}

pub fn multiply(left: &Matrix, right: &Matrix) -> Result<Matrix, MatrixError> {
    let left_dims = MatrixDimensions::new(left)?;
    let right_dims = MatrixDimensions::new(right)?;

    if left_dims.cols != right_dims.rows {
        return Err(MatrixError::IncompatibleDimensions(format!(
            "Left matrix columns ({}) must match right matrix rows ({})",
            left_dims.cols, right_dims.rows
        )));
    }

    let mut result = vec![vec![0.0; right_dims.cols]; left_dims.rows];
    for i in 0..left_dims.rows {
        for j in 0..right_dims.cols {
            for k in 0..left_dims.cols {
                result[i][j] += left[i][k] * right[k][j];
            }
        }
    }

    Ok(result)
}

pub fn multiply_chain(matrices: &[&Matrix]) -> Result<Matrix, MatrixError> {
    matrices
        .windows(2)
        .try_fold(matrices[0].clone(), |acc, pair| multiply(&acc, pair[1]))
}

pub fn transpose(matrix: &Matrix) -> Result<Matrix, MatrixError> {
    let dims = MatrixDimensions::new(matrix)?;
    let mut transposed = vec![vec![0.0; dims.rows]; dims.cols];

    for i in 0..dims.rows {
        for j in 0..dims.cols {
            transposed[j][i] = matrix[i][j];
        }
    }

    Ok(transposed)
}

pub fn merge_blocks(
    target: &mut Matrix,
    block: &Matrix,
    block_index: usize,
    block_size: usize,
) -> Result<(), MatrixError> {
    let target_dims = MatrixDimensions::new(target)?;
    let blocks_per_row = target_dims.cols / block_size;

    let start_col = (block_index % blocks_per_row) * block_size;
    let start_row = (block_index / blocks_per_row) * block_size;

    for (i, row) in block.iter().enumerate() {
        for (j, &value) in row.iter().enumerate() {
            target[start_row + i][start_col + j] = value;
        }
    }

    Ok(())
}

pub fn to_latex(matrix: &Matrix) -> Result<String, MatrixError> {
    let dims = MatrixDimensions::new(matrix)?;
    let mut latex = String::from("\\begin{bmatrix}\n");
    
    for row in matrix.iter() {
        let formatted_row: Vec<String> = row
            .iter()
            .map(|&val| format!("{:.2}", val).trim_end_matches(".00").to_string())
            .collect();
        latex.push_str(&formatted_row.join(" & "));
        latex.push_str(" \\\\\n");
    }
    latex.push_str("\\end{bmatrix}");
    
    Ok(latex)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_matrix_multiplication() {
        let a = vec![vec![1.0, 2.0], vec![3.0, 4.0]];
        let b = vec![vec![5.0, 6.0], vec![7.0, 8.0]];
        let result = multiply(&a, &b).unwrap();
        assert_eq!(result, vec![vec![19.0, 22.0], vec![43.0, 50.0]]);
    }

    #[test]
    fn test_matrix_transpose() {
        let matrix = vec![vec![1.0, 2.0], vec![3.0, 4.0]];
        let transposed = transpose(&matrix).unwrap();
        assert_eq!(transposed, vec![vec![1.0, 3.0], vec![2.0, 4.0]]);
    }
}