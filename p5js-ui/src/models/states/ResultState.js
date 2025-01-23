import Controller from "../../controllers/Controller.js";
import State from "./State.js";

export default class ResultState extends State {
    constructor(title) {
        super(title);
        this.imageSize = createVector(320, 320);
    }

    init(data) {
        super.init(data);
        this.rate = (320*320-this.data.compression_result.dct_zeros) /( 320*320-this.data.compression_result.compressed_dct_zeros) ;

        this.refreshSize();
        Controller.hideControllers()
    }

    render() {
        textAlign(CENTER);
        
        textSize(20);
        if (this.data.compression_result != null && this.data.img != null) {

            stroke(0);
            strokeWeight(1);
            fill(0);
            let comp = createImage(320, 320)
            comp.loadPixels();
            for (let i = 0; i < 320; i++) {
                for (let j = 0; j < 320; j++) {
                    comp.set(j, i, this.data.compression_result.compressed_image[i][j]);
                }
            }
            comp.updatePixels();
            
            text("original", width/2-320+160,20+this.offset.y)
            image(this.data.img, width/2-320 -10, 50+this.offset.y);

            text("compressed",width/2 +160, 20 +this.offset.y)
            image(comp, width/2 + 10, 50+this.offset.y);

            text("Dimension rate: "+this.rate.toFixed(2).toString()+" : 1", width/2, 400+this.offset.y)
            
            text("Reducition: "+ ((1-1/this.rate)*100).toFixed(2).toString()+" %", width/2, 450+this.offset.y)
        }
    };

    isEnded() {
        return this.data.img!=null;
    }

    renderImage() {
        if(this.img!=null)
            image(this.data.img, this.imageOffset.x, this.imageOffset.y);
    }


    refreshSize() {
        this.ratio = width / 600;
        // (height-(320+20+20+50))/2
        this.offset = createVector(0, 30);
        this.data.img.resize(this.imageSize.x, this.imageSize.y);
    }
}