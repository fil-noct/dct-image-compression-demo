pub fn subdivide_matrix(matrix: Vec<Vec<f64>>, sub_size: usize) -> Vec<Vec<Vec<f64>>> {
    let rows = matrix.len();
    let cols = matrix[0].len();
    let mut result = Vec::new();

    for i in (0..rows).step_by(sub_size) {
        if i + sub_size > rows {
            break;
        }

        for j in (0..cols).step_by(sub_size) {
            if j + sub_size > cols {
                break;
            }

            let mut sub = Vec::with_capacity(sub_size);
            for row in i..i + sub_size {
                let mut sub_row = Vec::with_capacity(sub_size);
                for col in j..j + sub_size {
                    sub_row.push(matrix[row][col]);
                }
                sub.push(sub_row);
            }

            result.push(sub);
        }
    }

    result
}

pub fn matrix_multiply(
    a: &Vec<Vec<f64>>,
    b: &Vec<Vec<f64>>,
) -> Result<Vec<Vec<f64>>, &'static str> {
    let m = a.len();
    let n = a[0].len();
    let p = b[0].len();

    if a[0].len() != b.len() {
        return Err("Le matrici non sono compatibili per la moltiplicazione");
    }

    let mut result = vec![vec![0.0; p]; m]; // Matrile risultato m x p

    for i in 0..m {
        for j in 0..p {
            for k in 0..n {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }

    Ok(result)
}

pub fn multiple_matrix_multiply(
    a: &Vec<Vec<f64>>,
    b: &Vec<Vec<f64>>,
    c: &Vec<Vec<f64>>,
) -> Vec<Vec<f64>> {
    matrix_multiply(&matrix_multiply(a, b).unwrap(), c).unwrap()
}

pub fn transpose(matrix: &Vec<Vec<f64>>) -> Vec<Vec<f64>> {
    let rows = matrix.len();
    let cols = matrix[0].len();
    let mut transposed = vec![vec![0.0; rows]; cols];

    for i in 0..rows {
        for j in 0..cols {
            transposed[j][i] = matrix[i][j];
        }
    }

    transposed
}

pub fn print_matrix(matrix: &Vec<Vec<f64>>) {
    for row in matrix {
        for &value in row {
            print!("{:.1} ", value); // Stampa con 1 decimale
        }
        println!(); // Nuova riga dopo ogni riga della matrice
    }
}

pub fn merge_matrix(
    parent_matrix: &mut Vec<Vec<f64>>,
    child_matrix: &Vec<Vec<f64>>,
    index: usize,
    size: usize,
) {
    let sub_matrices = parent_matrix.len() / size;

    let start_x = (index % sub_matrices) * size;
    let start_y = (index / sub_matrices) * size;
    for i in 0..size {
        for j in 0..size {
            parent_matrix[start_y + i][start_x + j] = child_matrix[i][j];
        }
    }
}

pub fn generate_latex_matrix(matrix: Vec<Vec<f64>>) -> String {
    let mut latex = String::from("\\begin{bmatrix}\n");
    for row in &matrix {
        let row_string: Vec<String> = row.iter().map(|&val| format!("{:.2}",val).replace(".00", "")).collect();
        latex.push_str(&row_string.join(" & "));
        latex.push_str(" \\\\\n");
    }
    latex.push_str("\\end{bmatrix}");
    latex
}
