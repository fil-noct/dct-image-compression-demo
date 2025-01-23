import UploadImageController from "../../controllers/UploadImageController.js";
import State from "./State.js";

export default class UploadImageState extends State {
    constructor(title) {
        super(title);
        this.imageSize = createVector(320, 320);
    }

    init(data) {
        super.init(data);
        this.refreshSize();
        UploadImageController.init((file)=>this.uploadImage(file), this);
    }

    uploadImage(file){
        const reader = new FileReader();
        reader.onload = () => {
            this.data.img = loadImage(reader.result, () => {
                this.data.img.loadPixels();
                this.data.img.filter(GRAY);
                this.refreshSize();
            });
        };
        reader.readAsDataURL(file);
    }

    render() {
        textSize(20);
        textAlign(CENTER);
        fill(0);
        stroke(0);
        strokeWeight(1);
        if(this.data.img!=null){
            this.data.img.filter(GRAY);
            this.renderImage();
            text("The picked image has been resized \n to 320x320 gray scale image", width/2,height/2+160)
        }else{
            text("Upload an image to start", width/2,height/2)
        }  
    };

    isEnded() {
        return this.data.img!=null;
    }

    renderImage() {
        if(this.data.img!=null)
            image(this.data.img, this.imageOffset.x, this.imageOffset.y);
    }


    refreshSize() {

        this.imageOffset = createVector(width/2-160, height/ 2 - 180);
        if(this.data.img!=null){
            this.data.img.resize(this.imageSize.x, this.imageSize.y);
        }
        
    }
}