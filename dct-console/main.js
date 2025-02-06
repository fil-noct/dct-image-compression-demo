import ImageProcessorComponent from "./src/components/ImageProcessorComponent.js";
ImageProcessorComponent.disableControllers();
let state = {
  upload: false,
  processed: false,
  ready: false
};

let processor;

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
  ImageProcessorComponent.disableControllers();
});

input.addEventListener("change", () => {
  state.upload = state.processed = state.ready = false;
  ImageProcessorComponent.disableControllers();
  if (input.files.length == 1) {
    if (input.files[0].type.startsWith('image/')) {
      const file = input.files[0];
      state.upload = true;
      updateState();
      const reader = new FileReader();
      reader.onload = async () => {
        const rawImg = reader.result;
        processor = new ImageProcessorComponent();

        document.getElementById("img_canvas").addEventListener("mousedown", function (event) {
          let rect = document.getElementById("img_canvas").getBoundingClientRect();
          let x = event.clientX - rect.left;
          let y = event.clientY - rect.top;
          processor.setPosition(x, y);
        });

        state.processed = true;
        updateState();
        await processor.init(rawImg);
        state.ready = true;
        updateState();
      };
      reader.readAsDataURL(file);
    } else {
      console.error("Invalid type");
    }
  }
});