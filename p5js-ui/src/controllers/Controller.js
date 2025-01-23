import DOMUtils from "../utils/DOMUtils.js";

export default class Controller {
    static hideControllers() {
        const controllers = document.getElementById("controllers");
        controllers.children.forEach(element => {
            DOMUtils.hide(element.id);
        });
    }
    init() {

    }
}