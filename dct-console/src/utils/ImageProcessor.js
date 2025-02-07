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


    static async imageFromArray(pixelArray, newWidth, newHeight) {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = newWidth;
        canvas.height = newHeight;

        let imageData = ctx.createImageData(newWidth, newHeight);
        let data = imageData.data;

        for (let i = 0; i < pixelArray.length; i++) {
            for (let j = 0; j < pixelArray[i].length; j++) {
                const index = (i * newWidth + j) * 4;
                const color = pixelArray[i][j];
                data[index] = color;
                data[index + 1] = color;
                data[index + 2] = color;
                data[index + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);

        let newImg = new Image();
        newImg.src = canvas.toDataURL();
        await new Promise(resolve => newImg.onload = resolve);
        newImg.width = newWidth;
        newImg.height = newHeight;
        return newImg;
    }



    static async resizeImage(image, newWidth, newHeight) {
        const canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, newWidth, newHeight);

        // Create a new Image object from the resized canvas
        const resizedImage = new Image();
        resizedImage.src = canvas.toDataURL();
        await new Promise(resolve => resizedImage.onload = resolve);
        return resizedImage;

    }

    static async cropImage(image, x, y, cropWidth, cropHeight) {
        const canvas = document.createElement("canvas");
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(image, x, y, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        const croppedImage = new Image();
        croppedImage.src = canvas.toDataURL();
        await new Promise(resolve => croppedImage.onload = resolve);
        return croppedImage;
    }
}