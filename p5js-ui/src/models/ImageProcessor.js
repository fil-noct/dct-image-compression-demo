// import init, { dct_js } from "../../../rust-dct/pkg/rust_dct.js";
import * as rust_dct from "../../../rust-dct/pkg/rust_dct.js";

export default class ImageProcessor {

    static async compressImage(imageData, width, height) {

        await rust_dct.default();

        const options = new rust_dct.CompressionOptions(width, height);
        const processor = new rust_dct.ImageProcessor(options);
        

        try {
            const result = processor.compress_image(imageData);
            console.log('Compression successful:', result);
            return result;
        } catch (error) {
            console.error('Compression failed:', error);
        }
    }
}