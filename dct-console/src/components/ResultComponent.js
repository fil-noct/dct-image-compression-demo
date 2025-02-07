import DOMUtils from "../utils/DOMUtils.js";
import ImageProcessor from "../utils/ImageProcessor.js";

export default class ResultComponent {

    constructor(img, compression_result) {
        this.zoom = 3;
        this.matrixSize = 160 / this.zoom;


        DOMUtils.setClickEvent("zoom_in", () => this.zoomIn());
        DOMUtils.setClickEvent("zoom_out", () => this.zoomOut());

        this.compression_result = compression_result;

        this.rate = (320 * 320 - this.compression_result.dct_zero_count) /
            (320 * 320 - this.compression_result.compressed_dct_zero_count);

        DOMUtils.setInnerHTML("compression_ratio", this.rate.toFixed(2).toString());
        DOMUtils.setInnerHTML("compression_reduction", ((1 - 1 / this.rate) * 100).toFixed(2).toString() + " %")

        this.img = img;
        this.zoomed_img_canvas = document.getElementById("zoomed_img_canvas");
        this.zoomed_compressed_img_canvas = document.getElementById("zoomed_compressed_img_canvas");
        this.zoom_canvas = document.getElementById("zoom_canvas");
        this.zoom_canvas.width = 160;
        this.zoom_canvas.height = 160;
        // this.render();
    }

    setPosition(x, y) {
        this.x = Math.floor(x / this.matrixSize) * this.matrixSize;
        this.y = Math.floor(y / this.matrixSize) * this.matrixSize;
        this.render();
    }

    zoomIn() {
        this.zoom++;
        this.updateControls();
        this.render();
    }

    zoomOut() {
        this.zoom--;
        this.updateControls();
        this.render();
    }

    async init() {
        this.imageSize = { x: 320, y: 320 };
        this.compImg = await ImageProcessor.imageFromArray(this.compression_result.compressed_image, 320, 320);

        this.zoomImage = await ImageProcessor.resizeImage(this.img, 160, 160);
        this.zoomed_img_canvas.width = this.img.width;
        this.zoomed_compressed_img_canvas.width = this.img.width;

        this.zoomed_img_canvas.height = this.img.height;
        this.zoomed_compressed_img_canvas.height = this.img.height;
        this.x = 0;
        this.y = 0;

        this.render();
        DOMUtils.setInnerHTML("compression_ratio", this.rate.toFixed(2).toString());
        DOMUtils.setInnerHTML("compression_reduction", ((1 - 1 / this.rate) * 100).toFixed(2).toString() + " %")
    }



    render() {
        this.matrixSize = 160 / this.zoom;
        this.x = Math.floor(this.x / this.matrixSize) * this.matrixSize;
        this.y = Math.floor(this.y / this.matrixSize) * this.matrixSize;

        this.renderImage();
    }

    async renderImage() {
        const matrixColor = '#DB5375';
        const ctx = this.zoom_canvas.getContext("2d");
        ctx.clearRect(0, 0, this.zoom_canvas.width, this.zoom_canvas.height);
        ctx.drawImage(this.zoomImage, 0, 0, 160, 160);
        ctx.fillStyle = "#00000000";
        ctx.strokeStyle = matrixColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.matrixSize, this.matrixSize);

        const croppedOriginal = await ImageProcessor.resizeImage(
            await ImageProcessor.cropImage(
                this.img, this.x * 2, this.y * 2, this.matrixSize * 2, this.matrixSize * 2),
            320, 320);

        const ctxOriginal = this.zoomed_img_canvas.getContext("2d");
        ctxOriginal.clearRect(0, 0, this.zoomed_img_canvas.width, this.zoomed_img_canvas.height);
        ctxOriginal.drawImage(croppedOriginal, 0, 0, 320, 320);

        const croppedCompressed = await ImageProcessor.resizeImage(
            await ImageProcessor.cropImage(
                this.compImg, this.x * 2, this.y * 2, this.matrixSize * 2, this.matrixSize * 2),
            320, 320);

        const ctxCompressed = this.zoomed_compressed_img_canvas.getContext("2d");
        ctxCompressed.clearRect(0, 0, this.zoomed_compressed_img_canvas.width, this.zoomed_compressed_img_canvas.height);
        ctxCompressed.drawImage(croppedCompressed, 0, 0, 320, 320);

    }

    updateControls() {
        if (this.zoom <= 1) {
            DOMUtils.disableInput("zoom_out");
        } else {
            DOMUtils.enableInput("zoom_out");
        }

        if (this.zoom >= 10) {
            DOMUtils.disableInput("zoom_in");
        } else {
            DOMUtils.enableInput("zoom_in");
        }

    }

}