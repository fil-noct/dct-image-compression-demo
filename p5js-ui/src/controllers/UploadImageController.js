import DOMUtils from "../utils/DOMUtils.js";
import Controller from "./Controller.js";

export default class UploadImageController extends Controller {
    static init(uploadImage) {
        Controller.hideControllers();
        //DOMUtils.setClickEvent("img_upload", uploadImage);
        const input = document.getElementById("img_upload");
        input.addEventListener("cancel", () => {
            console.log("Cancelled.");
        });
        input.addEventListener("change", () => {
            if (input.files.length == 1) {
                if (input.files[0].type.startsWith('image/')) {
                    uploadImage(input.files[0]);
                } else { 
                    console.error("Invalid type"); 
                }
            }
        });

        DOMUtils.show("upload_controller");
    }
}