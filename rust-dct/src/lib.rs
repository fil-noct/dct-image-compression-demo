mod dct_utils;
mod matrix;
use wasm_bindgen::prelude::*;
use serde_wasm_bindgen::from_value;
use serde_wasm_bindgen::to_value;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn dct_js(image: JsValue, width:usize, height:usize ) -> Result<JsValue, JsValue>{

    let image: Vec<Vec<f64>> = from_value(image).map_err(|err| {
        JsValue::from_str(&format!("Failed to deserialize input image: {:?}", err))
    })?;
    let result = dct_utils::dct_compression(image, width, height);

    // Serialize the `CompressionResult` back into `JsValue`
    to_value(&result).map_err(|err| {
        JsValue::from_str(&format!("Failed to serialize result: {:?}", err))
    })
}
