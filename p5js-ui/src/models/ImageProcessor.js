import init, { dct_js } from "../../../rust-dct/pkg/rust_dct.js";

export default class ImageProcessor {
    static async compress(image, width, height) {
        await init();
        let result = dct_js(image, 320, 320);
        return result;
    }
}