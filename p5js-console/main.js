import * as sketch from "./src/sketch.js"

for (let [key, val] of Object.entries(sketch)) {
  window[key] = val;
}

const input = document.getElementById("img_upload");

input.addEventListener("cancel", () => {
  console.log("Cancelled.");
});

input.addEventListener("change", () => {
  if (input.files.length == 1) {
    if (input.files[0].type.startsWith('image/')) {
      sketch.uploadImage(input.files[0]);
    } else {
      console.error("Invalid type");
    }
  }
});