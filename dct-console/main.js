import ImageProcessorComponent from "./src/components/ImageProcessorComponent.js";

let state = {
  upload: false,
  processed: false,
  ready: false
};

let processor;

function updateState(){
  if(state.upload){
    document.getElementById("up_led").classList.add("on");
  }else{
    document.getElementById("up_led").classList.remove("on");
  }

  if(state.processed){
    document.getElementById("pro_led").classList.add("on");
  }else{
    document.getElementById("pro_led").classList.remove("on");
  }

  if(state.ready){
    document.getElementById("ready_led").classList.add("on");
  }else{
    document.getElementById("ready_led").classList.remove("on");
  }
}



const input = document.getElementById("img_upload");

input.addEventListener("cancel", () => {
  console.log("Cancelled.");
  ImageProcessorComponent.disableControllers();
});

input.addEventListener("change", () => {
  state.upload=state.processed=state.ready=false;
  ImageProcessorComponent.disableControllers();
  if (input.files.length == 1) {
    if (input.files[0].type.startsWith('image/')) {
      const file = input.files[0];
      state.upload=true;
      updateState();
      const reader = new FileReader();
      reader.onload =async () => {
          const rawImg = reader.result;
          state.processed = true;
          updateState();
          processor= new ImageProcessorComponent();
          await processor.init(rawImg);
          state.ready = true;
          updateState();
          // loadImage(reader.result, (img) => {
          //     img.loadPixels();
          //     img.resize(320, 320);
          //     img.filter(GRAY);
          //     
          // });
      };
      reader.readAsDataURL(file);
    } else {
      console.error("Invalid type");
    }
  }
});



