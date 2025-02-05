import ImageProcessor from "./ImageProcessor.js";

export default class ImageProcessorComponent{
    constructor(img) {
        this.imageSize = createVector(320, 320);

        this.data={
            img: img,
            compression_result: null
        };
        
        this.refreshSize();
        this.x = 0;
        this.y = 0;

        this.data.img.loadPixels();

        let pixelArray = [];
        for (let y = 0; y < this.data.img.height; y++) {
            let row = [];
            for (let x = 0; x < this.data.img.width; x++) {
                let index = (x + y * this.data.img.width) * 4;
                let grayValue = this.data.img.pixels[index];
                row.push(grayValue);
            }
            pixelArray.push(row);
        }
        this.data.compression_result = null;

        ImageProcessor.compressImage(pixelArray, this.imageSize.x, this.imageSize.y).then(v => this.data.compression_result = v);
    }

    showCalcs(){
        if (this.data.compression_result != null && this.index!=null) {
            document.getElementById("paper_dialog_body").innerHTML=this.data.compression_result.latex_calculations[this.index];
            MathJax.typeset();
            document.getElementById("paper_dialog").showModal();
        }
    }

    render() {
        this.index = (this.x + this.y * 40) / 8;
        if (this.data.compression_result == null) {
            text("loading...", width / 2, height / 2);
        } else {
            if (this.x >= this.imageSize.x) {
                this.x = 0;
                this.y += this.matrixSize;
            }
            if (this.y >= this.imageSize.y) {
                this.x = this.y = 0;
            }
            this.renderImage();
            this.renderMatrix();
            if (width > 800) {
                this.renderMatrixText();
            }
        }
    }

    renderMatrixText() {
        stroke(0);
        fill(0);

        textAlign(LEFT);
        text("original dct matrix", this.matrixOffset.x + this.matrixScale * this.matrixSize + 20, this.matrixZoom.y - 10);
        text("quantizied dct matrix", this.matrixOffset.x + this.matrixScale * this.matrixSize + 20, this.matrixZoom.y - 10 + this.matrixScale * 8 + 50);

        textFont('Courier New');
        textSize(8 * this.ratio);
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


    isEnded() {
        return this.data.compression_result != null;
    }

    nextStep() {
        this.x += this.matrixSize;
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
    }

    renderImage() {
        image(this.data.img, this.imageOffset.x, this.imageOffset.y);
    }

    renderMatrix() {
        const matrixColor='rgb(198, 69, 76)';

        noFill();
        strokeWeight(1);
        stroke(matrixColor);

        line(this.x + this.imageOffset.x, this.y + this.imageOffset.y, this.matrixZoom.x, this.matrixZoom.y);
        line(this.x + this.imageOffset.x + this.matrixSize, this.y + this.imageOffset.y, this.matrixZoom.x + this.matrixSize * this.matrixScale, this.matrixZoom.y);
        line(this.x + this.imageOffset.x, this.y + this.imageOffset.y + this.matrixSize, this.matrixZoom.x, this.matrixZoom.y + this.matrixSize * this.matrixScale);
        line(this.x + this.imageOffset.x + this.matrixSize, this.y + this.imageOffset.y + this.matrixSize, this.matrixZoom.x + this.matrixSize * this.matrixScale, this.matrixZoom.y + this.matrixSize * this.matrixScale);

        strokeWeight(2);
        stroke(matrixColor);
        square(this.imageOffset.x + this.x, this.imageOffset.y + this.y, this.matrixSize);
        for (let i = 0; i < this.matrixSize; i++) {
            for (let j = 0; j < this.matrixSize; j++) {
                let px = this.data.img.get(this.x + i, this.y + j);
                strokeWeight(1);
                fill(px);
                square(this.matrixZoom.x + i * this.matrixScale, this.matrixZoom.y + j * this.matrixScale, this.matrixScale)
            }
        }
        let compressed_matrix = this.data.compression_result.compressed_image_submatrices[this.index];
        textAlign(LEFT);
        fill(0);
        stroke(0);
        text("original", this.matrixZoom.x, this.matrixZoom.y - 10);
        text("compressed", this.matrixZoom.x, this.matrixZoom.y - 10 + this.matrixScale * 8 + 50);
        textAlign(CENTER);
        for (let i = 0; i < this.matrixSize; i++) {
            for (let j = 0; j < this.matrixSize; j++) {
                let px = this.data.img.get(this.x + i, this.y + j);

                stroke(matrixColor);
                strokeWeight(1);
                fill(px);
                square(this.matrixZoom.x + i * this.matrixScale, this.matrixZoom.y + j * this.matrixScale, this.matrixScale);
                // stroke(0,0,255);
                px = compressed_matrix[j][i];
                fill(px);
                square(this.matrixZoom.x + i * this.matrixScale, this.matrixZoom.y + j * this.matrixScale + this.matrixScale * 8 + 50, this.matrixScale);
            }
        }
    }

    refreshSize() {
        this.ratio = width / 600;
        // width/2-250
        this.imageOffset = createVector(30, (height - this.imageSize.y) / 2);
        this.data.img.resize(this.imageSize.x, this.imageSize.y);
        console.log("resized");
        console.log(this.data)
        this.baseScale = 16;
        this.matrixSize = 8;
        this.matrixScale = this.baseScale * this.ratio;
        this.matrixOffset = createVector(this.imageSize.x + this.imageOffset.x + 30, (height - this.matrixScale * this.matrixSize * 2) / 2 - 20)
        this.matrixZoom = createVector(this.matrixOffset.x, this.matrixOffset.y);

    }
}