use std::f64::consts::PI;
use std::vec;

use crate::matrix;

// struct CalcStep {
//     latex_expression: String,
//     latex_result: String,
//     result: Vec<Vec<f64>>,
// }
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]

pub struct CompressionResult {
    pub image: Vec<Vec<f64>>,
    pub compressed_image: Vec<Vec<f64>>,

    pub dct_matrices: Vec<Vec<Vec<f64>>>,
    pub compressed_dct_matrices: Vec<Vec<Vec<f64>>>,

    pub dct_zeros: i32,
    pub compressed_dct_zeros: i32,

    pub image_matrices: Vec<Vec<Vec<f64>>>, // steps: CalcStep
    pub compressed_image_matrices: Vec<Vec<Vec<f64>>>,

    pub latex_calc_steps: Vec<String>,
}

pub fn dct_compression(image: Vec<Vec<f64>>, width: usize, height: usize) -> CompressionResult {
    let size: usize = 8;
    let c_8: Vec<Vec<f64>> = dct2_coefficients(size);
    let c_8_t: Vec<Vec<f64>> = matrix::transpose(&c_8);

    let mut compressed_image: Vec<Vec<f64>> = vec![vec![0.0; width]; height];

    let mut dct_matrices: Vec<Vec<Vec<f64>>> = vec![];
    let mut compressed_dct_matrices: Vec<Vec<Vec<f64>>> = vec![];

    let dct_zeros: &mut i32 = &mut 0;
    let compressed_dct_zeros: &mut i32 = &mut 0;

    let image_matrices: Vec<Vec<Vec<f64>>> = matrix::subdivide_matrix(image.clone(), size);
    let mut compressed_image_matrices: Vec<Vec<Vec<f64>>> = vec![];

    let mut latex_calc_steps: Vec<String> = vec![];

    let q: Vec<Vec<f64>> = vec![
        vec![16.0, 11.0, 10.0, 16.0, 24.0, 40.0, 51.0, 61.0],
        vec![12.0, 12.0, 14.0, 19.0, 26.0, 58.0, 60.0, 55.0],
        vec![14.0, 13.0, 16.0, 24.0, 40.0, 57.0, 69.0, 56.0],
        vec![14.0, 17.0, 22.0, 29.0, 51.0, 87.0, 80.0, 62.0],
        vec![18.0, 22.0, 37.0, 56.0, 68.0, 109.0, 103.0, 77.0],
        vec![24.0, 35.0, 55.0, 64.0, 81.0, 104.0, 113.0, 92.0],
        vec![49.0, 64.0, 78.0, 87.0, 103.0, 121.0, 120.0, 101.0],
        vec![72.0, 92.0, 95.0, 98.0, 112.0, 100.0, 103.0, 99.0],
    ];

    for i in 0..image_matrices.len() {
        let a = &image_matrices[i];
        let b: Vec<Vec<f64>> = a
            .iter()
            .map(|row| row.iter().map(|&x| x - 127.0).collect())
            .collect();

        //dct matrix
        let d = matrix::multiple_matrix_multiply(&c_8, &b, &c_8_t);

        //compressed dct matrix
        let mut d1: Vec<Vec<f64>> = vec![vec![0.0; size]; size];
        for i in 0..size {
            for j in 0..size {
                d1[i][j] = (d[i][j] / q[i][j]).round() * q[i][j];
            }
        }

        //compressed image
        let mut a1: Vec<Vec<f64>> = matrix::multiple_matrix_multiply(&c_8_t, &d1, &c_8);
        a1 = a1
            .iter()
            .map(|row| row.iter().map(|value| value.round() + 127.0).collect())
            .collect();

        latex_calc_steps.push( write_latex_calcs( a.clone(), b.clone(), d.clone(), d1.clone(), a1.clone()));

        save_result(
            &mut dct_matrices,
            &mut compressed_dct_matrices,
            dct_zeros,
            compressed_dct_zeros,
            &mut compressed_image_matrices,
            d.clone(),
            d1.clone(),
            a1.clone(),
        );

        matrix::merge_matrix(&mut compressed_image, &a1, i, size);
    }

    CompressionResult {
        image,
        compressed_image,
        dct_matrices,
        compressed_dct_matrices,
        dct_zeros: *dct_zeros,
        compressed_dct_zeros: *compressed_dct_zeros,
        compressed_image_matrices,
        image_matrices,
        latex_calc_steps
    }
}

fn write_latex_calcs(
    a: Vec<Vec<f64>>,
    b: Vec<Vec<f64>>,
    d: Vec<Vec<f64>>,
    d1: Vec<Vec<f64>>,
    a1: Vec<Vec<f64>>,
) -> String {
    format!("
        <p>Partendo dalla sotto matrice $A$:</p> \\[ A = {} \\]
        <p>viene convertita nella matrice $B$ normalizzando A tra $-127$ e $+127$:</p> \\[ B = A - 127 \\] \\[ B = {} \\] 
        <p>Definiamo la matrice $C_8$ come:</p> \\[ {} \\]
        <p>Calcoliamo ora la DCTII della matrice $B$ come segue:</p>
        \\[ D = C_8 \\times B \\times C_{{ 8 }}^{{ T }} \\]
        \\[ D = {} \\] 
    ",
        matrix::generate_latex_matrix(a),
        matrix::generate_latex_matrix(b),
        matrix::generate_latex_matrix(dct2_coefficients(8)),
        matrix::generate_latex_matrix(d)
    )
}

fn save_result(
    dct_matrices: &mut Vec<Vec<Vec<f64>>>,
    compressed_dct_matrices: &mut Vec<Vec<Vec<f64>>>,
    dct_zeros: &mut i32,
    compressed_dct_zeros: &mut i32,
    compressed_image_matrices: &mut Vec<Vec<Vec<f64>>>,
    d: Vec<Vec<f64>>,
    d1: Vec<Vec<f64>>,
    a1: Vec<Vec<f64>>,
) {
    dct_matrices.push(d.clone());
    compressed_dct_matrices.push(d1.clone());

    *dct_zeros += count_zeros(&d.clone());
    *compressed_dct_zeros += count_zeros(&d1.clone());

    compressed_image_matrices.push(a1.clone());
}

pub fn count_zeros(matrix: &Vec<Vec<f64>>) -> i32 {
    matrix
        .iter()
        .flat_map(|row| row.iter())
        .filter(|&&value| value.round().abs() == 0.0)
        .count() as i32
}

pub fn dct2_coefficients(size: usize) -> Vec<Vec<f64>> {
    let c: f64 = f64::sqrt(2.0 / size as f64);

    let mut matrix = vec![vec![0.0; size]; size];
    for i in 0..size {
        matrix[0][i] = c * (1.0 / f64::sqrt(2.0));
    }
    for i in 1..size {
        for j in 0..size {
            matrix[i][j] =
                c * f64::cos(((i) as f64 * (2 * (j + 1) - 1) as f64 * PI) / (2 * size) as f64);
        }
    }

    matrix
}
