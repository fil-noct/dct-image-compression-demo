import DOMUtils from "../utils/DOMUtils.js";
import Controller from "./Controller.js";

export default class ImageProcessingController extends Controller {
    static init(showCalcs) {
        Controller.hideControllers();
        DOMUtils.show("process_controller");
        DOMUtils.setClickEvent("show_calcs", showCalcs);
        
    }
}