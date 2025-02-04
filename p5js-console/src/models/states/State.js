import Controller from "../../controllers/Controller.js";
import DOMUtils from "../../utils/DOMUtils.js";

export default class State{
    constructor(title, getData, setData){
        this.title=title;
        this.ended=false;
    }

    init(data){
        Controller.hideControllers();
        DOMUtils.setInnerHTML("state_title", this.title);
        this.ended=false;
        this.data=data;
    }

    render(){
        background(220);
        stroke(0);
        fill(0);
        line(0, 0, width, height);
        line(width, 0, 0, height);
        text("not implemented", width/2-150, 100);
    }

    isEnded(){
        return this.ended;
    }

    nextStep(){

    }

    prevStep(){
        
    }

    refreshSize(){}
}