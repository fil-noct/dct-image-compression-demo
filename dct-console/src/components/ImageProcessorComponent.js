import DOMUtils from "../utils/DOMUtils.js";
import ImageProcessor from "../utils/ImageProcessor.js";


export default class ImageProcessorComponent {
    static controllers = ["prev_step", "next_step", "play", "stop", "speed_up", "slow_down", "show_calcs", "speed_range"];

    static disableControllers() {
        for(let controller of this.controllers){
            DOMUtils.disableInput(controller);
        }
    }

    static enableControllers() {
        for(let controller of this.controllers){
            DOMUtils.enableInput(controller);
        }
    }

    constructor() {
        this.speed = 5;
        this.play = false;
        this.matrixSize = 8;
        this.canvas = document.getElementById("img_canvas");
        this.ctx = this.canvas.getContext("2d");

        DOMUtils.setClickEvent("prev_step", () => this.prevStep());
        DOMUtils.setClickEvent("next_step", () => this.nextStep());

        DOMUtils.setClickEvent("play", () => this.togglePlay(true));
        DOMUtils.setClickEvent("stop", () => this.togglePlay(false));

        DOMUtils.setClickEvent("speed_up", () => this.changeSpeed(1));
        DOMUtils.setClickEvent("slow_down", () => this.changeSpeed(-1));
        DOMUtils.setInnerHTML("speed", this.speed);
    }

    setPosition(x, y){
        console.log("pos",x, y);
        this.x = Math.round(x/this.matrixSize) * this.matrixSize;
        this.y = Math.round(y/this.matrixSize) * this.matrixSize;
        this.render();
    }

    async init(rawImage) {
        this.imageSize = { x: 320, y: 320 };
        this.img = await ImageProcessorComponent.preProcessImage(rawImage, this.imageSize.x, this.imageSize.y);
        this.imageData = ImageProcessorComponent.getImageData(this.img);
        this.canvas.width = this.img.width;
        this.canvas.height = this.img.height;
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
        await new Promise(resolve => newImg.onload = resolve);
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
        this.renderMatrixText();
        this.updateControls();
    }

    renderMatrixText() {
        const dctMatrix = document.getElementById("dct_matrix");
        const dctMatrixCompressed = document.getElementById("dct_matrix_compressed");
        
        let dct_matrix = this.compression_result.dct_matrices[this.index];
        let compressed_dct_matrix = this.compression_result.compressed_dct_matrices[this.index];
        
        let j = 0;
        for (let row of dctMatrix.children) {
            let i=0;
            for (let number of row.children) {
                const data = Math.round( dct_matrix[j][i]);
                number.innerHTML=data;
                i++;
            }
            j++;
        }

        j=0;
        for (let row of dctMatrixCompressed.children) {
            let i=0;
            for (let number of row.children) {
                const data =  Math.round(compressed_dct_matrix[j][i]);
                number.innerHTML=data;
                i++;
            }
            j++;
        }

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
        const matrixColor = '#DB5375';
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
        
        // DOMUtils.setInnerHTML("single_compression_rate", "100%");
        
    }

    togglePlay(state) {
      this.play = state;
      if (this.play) {
        frameRate(1 * this.speed);
      } else {
        frameRate(10);
      }
      updateControls();
    }
    
    updateControls() {
      DOMUtils.disableInput("play", this.play);
      DOMUtils.disableInput("stop", !this.play);
    
      DOMUtils.disableInput("slow_down", this.speed <= 0.25);
      DOMUtils.disableInput("speed_up", this.speed >= 50);
      DOMUtils.setInnerHTML("speed", this.speed);
    }
}