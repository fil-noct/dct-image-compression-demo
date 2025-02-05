import DOMUtils from "./utils/DOMUtils.js";
import ImageProcessorComponent from "./components/ImageProcessorComponent.js";

let processor;

let speed = 5;
let play = false;

let montserratFont;

export function preload() {
  montserratFont = loadFont("assets/Montserrat-Regular.ttf");
}

export function setup() {
  textFont(montserratFont);
  textAlign(CENTER);

  let canvas = createCanvas(1020, 680);
  canvas.parent("p5_canvas");

  DOMUtils.setClickEvent("prev_step", prevStep);
  DOMUtils.setClickEvent("next_step", nextStep);

  DOMUtils.setClickEvent("play", () => togglePlay(true));
  DOMUtils.setClickEvent("stop", () => togglePlay(false));

  DOMUtils.setClickEvent("speed_up", () => changeSpeed(1));
  DOMUtils.setClickEvent("slow_down", () => changeSpeed(-1));
  DOMUtils.setInnerHTML("speed", speed);
}

export function draw() {
  background(240, 240, 240);
  
  if(processor!=null){
    processor.render();
    if (play) {
      processor.nextStep();
    }
  }
}

function prevStep() {
  processor.prevStep();
  togglePlay(false);
}

function nextStep() {
  processor.nextStep();
  togglePlay(false);
}

function togglePlay(state) {
  play = state;
  if (play) {
    frameRate(1 * speed);
  } else {
    frameRate(10);
  }
  updateControls();
}

function updateControls() {
  DOMUtils.disableInput("play", play);
  DOMUtils.disableInput("stop", !play);

  DOMUtils.disableInput("slow_down", speed <= 0.25);
  DOMUtils.disableInput("speed_up", speed >= 50);
  DOMUtils.setInnerHTML("speed", speed);
}

function changeSpeed(sign) {
  let delta = 0;
  if (sign > 0) {
    delta = 0.5;
    // if (speed >= 2) delta = 0.5
    if (speed >= 5) delta = 1;
    if (speed >= 10) delta = 10;
  } else {
    delta = 10;
    if (speed <= 10) delta = 1;
    if (speed <= 5) delta = 0.5;
    // if (speed <= 2) delta = 0.25;
  }

  speed += delta * sign;
  frameRate(1 * speed);
  updateControls();
}

export function uploadImage(file){
  const reader = new FileReader();
  reader.onload = () => {
      loadImage(reader.result, (img) => {
          img.loadPixels();
          img.resize(320, 320);
          img.filter(GRAY);
          processor= new ImageProcessorComponent(img);
      });
  };
  reader.readAsDataURL(file);
}