import ImageProcessorComponent from "./src/components/ImageProcessorComponent.js";
import ResultComponent from "./src/components/ResultComponent.js";
ImageProcessorComponent.disableControllers();
let state = {
  upload: false,
  processed: false,
  ready: false
};

let processor;
let result;

function updateState() {
  if (state.upload) {
    document.getElementById("up_led").classList.add("on");
  } else {
    document.getElementById("up_led").classList.remove("on");
  }

  if (state.processed) {
    document.getElementById("pro_led").classList.add("on");
  } else {
    document.getElementById("pro_led").classList.remove("on");
  }

  if (state.ready) {
    document.getElementById("ready_led").classList.add("on");
  } else {
    document.getElementById("ready_led").classList.remove("on");
  }
}

const input = document.getElementById("img_upload");

input.addEventListener("cancel", () => {
  console.error("Invalid image format");
});

input.addEventListener("change", () => {

  if(processor!=undefined){
    processor.stop();
  }

  state.upload = state.processed = state.ready = false;
  if (input.files.length == 1) {
    if (input.files[0].type.startsWith('image/')) {
      const file = input.files[0];
      state.upload = true;
      updateState();
      const reader = new FileReader();
      reader.onload = async () => {
        const rawImg = reader.result;

        processor = new ImageProcessorComponent();
        await processor.init(rawImg);
        document.getElementById("img_canvas").addEventListener("mousedown", function (event) {
          let rect = document.getElementById("img_canvas").getBoundingClientRect();
          let x = event.clientX - rect.left;
          let y = event.clientY - rect.top;
          processor.setPosition(x, y);
        });
        state.processed = true;
        updateState();

        
        zoom_canvas
        result = new ResultComponent(processor.img, processor.compression_result);
        await result.init();
        document.getElementById("zoom_canvas").addEventListener("mousedown", function (event) {
          let rect = document.getElementById("zoom_canvas").getBoundingClientRect();
          let x = event.clientX - rect.left;
          let y = event.clientY - rect.top;
          result.setPosition(x, y);
        });
        state.ready = true;
        updateState();
      };
      reader.readAsDataURL(file);
    } else {
      console.error("Invalid type");
    }
  }
});