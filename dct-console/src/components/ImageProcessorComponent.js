import DOMUtils from "../utils/DOMUtils.js";
import ImageProcessor from "../utils/ImageProcessor.js";


export default class ImageProcessorComponent {

    static disableControllers() {
        DOMUtils.disableInput("prev_step");
        DOMUtils.disableInput("next_step");
        DOMUtils.disableInput("play");
        DOMUtils.disableInput("stop");
        DOMUtils.disableInput("speed_up");
        DOMUtils.disableInput("slow_down");
    }

    static enableControllers() {
        DOMUtils.enableInput("prev_step");
        DOMUtils.enableInput("next_step");
        DOMUtils.enableInput("play");
        DOMUtils.enableInput("stop");
        DOMUtils.enableInput("speed_up");
        DOMUtils.enableInput("slow_down");
    }

    constructor() {
        this.speed = 5;
        this.play = false;

        DOMUtils.setClickEvent("prev_step", () => this.prevStep());
        DOMUtils.setClickEvent("next_step", () => this.nextStep());

        DOMUtils.setClickEvent("play", () => this.togglePlay(true));
        DOMUtils.setClickEvent("stop", () => this.togglePlay(false));

        DOMUtils.setClickEvent("speed_up", () => this.changeSpeed(1));
        DOMUtils.setClickEvent("slow_down", () => this.changeSpeed(-1));
        DOMUtils.setInnerHTML("speed", this.speed);

    }

    async init(rawImage) {
        this.matrixSize = 8;
        this.imageSize = { x: 320, y: 320 };
        this.img = await ImageProcessorComponent.preProcessImage(rawImage, this.imageSize.x, this.imageSize.y);
        this.imageData = ImageProcessorComponent.getImageData(this.img);
        this.canvas = document.getElementById("img_canvas");
        this.canvas.width = this.img.width;
        this.canvas.height = this.img.height;
        this.ctx = this.canvas.getContext("2d");
        this.x = 0;
        this.y = 0;

        this.pixelArray = [];

        for (let y = 0; y < this.imageSize.y; y++) {
            let row = [];
            for (let x = 0; x < this.imageSize.x; x++) {
                let index = (x + y * this.imageSize.y) * 4;
                let grayValue = this.imageData[index];
                row.push(grayValue);
            }
            this.pixelArray.push(row);
        }
        this.compression_result = null;
        this.compression_result = await ImageProcessor.compressImage(this.pixelArray, this.imageSize.x, this.imageSize.y);
        console.log(this.pixelArray)
        this.render();
        ImageProcessorComponent.enableControllers();
    }

    static async preProcessImage(rawImage, newWidth, newHeight) {
        let imgElement = new Image();
        imgElement.src = rawImage;
        await new Promise(resolve => imgElement.onload = resolve);

        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.drawImage(imgElement, 0, 0, newWidth, newHeight);

        let imageData = ctx.getImageData(0, 0, newWidth, newHeight);
        let data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = data[i + 1] = data[i + 2] = avg;
        }

        ctx.putImageData(imageData, 0, 0);

        let newImg = new Image();
        newImg.src = canvas.toDataURL();
        newImg.width = newWidth;
        newImg.height = newHeight;
        return newImg;
    }

    static getImageData(image) {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        canvas.width = image.width;
        canvas.height = image.height;

        ctx.drawImage(image, 0, 0);

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return imageData.data;
    }

    showCalcs() {
        if (this.compression_result != null && this.index != null) {
            document.getElementById("paper_dialog_body").innerHTML = this.data.compression_result.latex_calculations[this.index];
            MathJax.typeset();
            document.getElementById("paper_dialog").showModal();
        }
    }

    render() {

        if (this.x >= this.imageSize.x) {
            this.x = 0;
            this.y += this.matrixSize;
        }
        if (this.y >= this.imageSize.y) {
            this.x = this.y = 0;
        }
        
        this.index = (this.x + this.y * 40) / 8;

        this.renderImage();
        this.renderMatrix();
    }

    renderMatrixText() {
        stroke(0);
        fill(0);

        textAlign(LEFT);
        text("original dct matrix", this.matrixOffset.x + this.matrixScale * this.matrixSize + 20, this.matrixZoom.y - 10);
        text("quantizied dct matrix", this.matrixOffset.x + this.matrixScale * this.matrixSize + 20, this.matrixZoom.y - 10 + this.matrixScale * this.matrixSize + 50);

        textFont('Courier New');
        textSize(this.matrixSize * this.ratio);
        let dct_matrix = this.data.compression_result.dct_matrices[this.index];
        let compressed_dct_matrix = this.data.compression_result.compressed_dct_matrices[this.index];
        for (let i = 0; i < compressed_dct_matrix.length; i++) {
            let str = "[";
            let comp_str = "[";
            for (let j = 0; j < compressed_dct_matrix[i].length; j++) {
                str += Math.round(dct_matrix[i][j]).toString().padStart(4, " ") + ", ";
                comp_str += compressed_dct_matrix[i][j].toString().padStart(4, " ") + ", ";
            }
            str = str.slice(0, -2);

            comp_str = comp_str.slice(0, -2);
            str += "]";
            comp_str += "]";

            text(str, this.matrixOffset.x + this.matrixScale * this.matrixSize + 20, this.matrixOffset.y + i * this.baseScale * this.ratio + 20);
            text(comp_str, this.matrixOffset.x + this.matrixScale * this.matrixSize + 20, this.matrixOffset.y + i * this.baseScale * this.ratio + 20 + this.matrixSize * this.baseScale * this.ratio + 50);

        }
        textFont(loadFont("assets/Montserrat-Regular.ttf"));

    }

    nextStep() {
        this.x += this.matrixSize;
        this.render();
    }

    prevStep() {
        this.x -= this.matrixSize;
        if (this.x < 0) {
            this.x = this.imageSize.x - this.matrixSize;
            this.y -= this.matrixSize;
        }
        if (this.y < 0) {
            this.y = 0;
        }
        this.render();
    }

    renderImage() {
        const matrixColor = 'rgb(9, 212, 26)';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.img, 0, 0, 320, 320);
        this.ctx.fillStyle = "#00000000";
        this.ctx.strokeStyle = matrixColor;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(this.x, this.y, this.matrixSize, this.matrixSize);
    }

    renderMatrix() {
        const matrix = document.getElementById("original_matrix");
        let j = 0;
        for (let row of matrix.children) {
            let i=0;
            for (let pixel of row.children) {
                const color = this.pixelArray[this.y + j][this.x + i];
                pixel.style.backgroundColor = "rgb(" + color.toString() + "," + color.toString() + "," + color.toString() + ")";
                i++;
            }
            j++;
        }
        let compressed_matrix_data = this.compression_result.compressed_image_submatrices[this.index];
        const compressedMatrix = document.getElementById("compressed_matrix");
        j = 0;
        for (let row of compressedMatrix.children) {
            let i=0;
            for (let pixel of row.children) {
                const color = compressed_matrix_data[j][i];
                pixel.style.backgroundColor = "rgb(" + color.toString() + "," + color.toString() + "," + color.toString() + ")";
                i++;
            }
            j++;
        }
        
        DOMUtils.setInnerHTML("single_compression_rate", "100%");
        
    }
}