use wasm_bindgen::prelude::*;
use serde_wasm_bindgen::{from_value, to_value};
mod dct_compression;
mod matrix_ops;

use crate::dct_compression::CompressionResult;
use crate::matrix_ops::Matrix;

#[derive(Debug)]
pub enum WasmError {
    Deserialization(String),
    Serialization(String),
    Compression(String),
}

// Implementation to convert our custom error into a JavaScript error
impl From<WasmError> for JsValue {
    fn from(error: WasmError) -> JsValue {
        let error_message = match error {
            WasmError::Deserialization(msg) => format!("Failed to parse input data: {}", msg),
            WasmError::Serialization(msg) => format!("Failed to prepare output data: {}", msg),
            WasmError::Compression(msg) => format!("Image compression failed: {}", msg),
        };
        JsValue::from_str(&error_message)
    }
}

// Type alias for our Result type to simplify error handling
type WasmResult<T> = Result<T, WasmError>;

#[wasm_bindgen(start)]
pub fn initialize() {
    // Set up panic hook for better error messages in the browser console
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub struct CompressionOptions {
    width: usize,
    height: usize,
}

#[wasm_bindgen]
impl CompressionOptions {
    #[wasm_bindgen(constructor)]
    pub fn new(width: usize, height: usize) -> Self {
        Self { width, height }
    }
}

#[wasm_bindgen]
pub struct ImageProcessor {
    options: CompressionOptions,
}

#[wasm_bindgen]
impl ImageProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new(options: CompressionOptions) -> Self {
        Self { options }
    }

    // Main compression function that processes the image data
    pub fn compress_image(&self, image_data: JsValue) -> Result<JsValue, JsValue> {
        self.process_compression(image_data)
            .map_err(Into::into)
    }

    // Internal helper function to handle the actual compression logic
    fn process_compression(&self, image_data: JsValue) -> WasmResult<JsValue> {
        // Convert JavaScript array into Rust Matrix type
        let image_matrix: Matrix = from_value(image_data)
            .map_err(|e| WasmError::Deserialization(e.to_string()))?;

        // Validate image dimensions
        self.validate_dimensions(&image_matrix)?;

        // Perform the DCT compression
        let compression_result = dct_compression::compress_image_dct(
            image_matrix,
            self.options.width,
            self.options.height,
        ).map_err(|e| WasmError::Compression(e.to_string()))?;

        // Convert the result back to JavaScript
        self.serialize_result(compression_result)
    }

    // Validation helper to ensure image dimensions are correct
    fn validate_dimensions(&self, image: &Matrix) -> WasmResult<()> {
        let actual_height = image.len();
        let actual_width = image.first()
            .map(|row| row.len())
            .unwrap_or(0);

        if actual_height != self.options.height || actual_width != self.options.width {
            return Err(WasmError::Deserialization(format!(
                "Image dimensions mismatch. Expected {}x{}, got {}x{}",
                self.options.width, self.options.height,
                actual_width, actual_height
            )));
        }
        Ok(())
    }

    // Serialization helper to convert Rust types to JavaScript
    fn serialize_result(&self, result: CompressionResult) -> WasmResult<JsValue> {
        to_value(&result)
            .map_err(|e| WasmError::Serialization(e.to_string()))
    }
}

// JavaScript usage example (in comments for documentation)
/*
// JavaScript code:
import init, { ImageProcessor, CompressionOptions } from './pkg/your_module';

async function compressImage(imageData, width, height) {
    await init();
    
    const options = new CompressionOptions(width, height);
    const processor = new ImageProcessor(options);
    
    try {
        const result = processor.compress_image(imageData);
        console.log('Compression successful:', result);
    } catch (error) {
        console.error('Compression failed:', error);
    }
}
*/