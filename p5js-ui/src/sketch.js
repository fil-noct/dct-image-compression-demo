import DOMUtils from "./utils/DOMUtils.js";
import Controller from "./controllers/Controller.js";
import UploadImageState from "./models/states/UploadImageState.js";
import ImageProcessingState from "./models/states/ImageProcessingState.js";
import ResultState from "./models/states/ResultState.js";

let states = [];

let currentState;
let currentStateIndex = 0;

let speed = 30;
let play = false;

let montserratFont;
let ratio = 3 / 2;

let data = {
  img: null,
  compression_result:null 
};

export function preload() {
  //img = loadImage("https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Pictograms_on_Sony_Betamax_Portable.jpg/220px-Pictograms_on_Sony_Betamax_Portable.jpg");
  montserratFont = loadFont("assets/Montserrat-Regular.ttf");
}

export function setup() {
  textFont(montserratFont);
  textAlign(CENTER);

  let canvas = createCanvas(600, 400);
  canvas.parent("p5_canvas");
  adaptiveResizeCanvas();

  Controller.hideControllers();
  DOMUtils.setClickEvent("prev_state", prevState);
  DOMUtils.setClickEvent("next_state", nextState);

  DOMUtils.setClickEvent("prev_step", prevStep);
  DOMUtils.setClickEvent("next_step", nextStep);

  DOMUtils.setClickEvent("play", () => togglePlay(true));
  DOMUtils.setClickEvent("stop", () => togglePlay(false));

  DOMUtils.setClickEvent("speed_up", () => changeSpeed(1));
  DOMUtils.setClickEvent("slow_down", () => changeSpeed(-1));
  DOMUtils.setInnerHTML("speed", speed);
  

  states.push(new UploadImageState("Upload Image"));
  states.push(new ImageProcessingState("DCT-II matrix compression"));
  states.push(new ResultState("Compression results"));

  changeState();
}

export function draw() {
  background(255);
  
  currentState.render();
  // if (currentState.isEnded()) {
  //   currentStateIndex++;
  //   changeState();
  //   play = false;
  // } else {
  if (play) {
    currentState.nextStep();
  }
  // }
}

export function windowResized() {
  adaptiveResizeCanvas();
  currentState.refreshSize();
}

function adaptiveResizeCanvas() {
  let newWidth = windowWidth - 200;
  let newHeight = windowHeight - 200;
  if (newWidth < 600 || newHeight < 400) {
    resizeCanvas(600, 400);
  } else {
    if (newWidth / ratio <= windowHeight - 200) {
      resizeCanvas(newWidth, newWidth / ratio);
    } else {
      resizeCanvas(newHeight * ratio, newHeight);
    }
  }
  if (currentState)
    currentState.refreshSize();
}

function prevState() {
  if (currentStateIndex > 0) {
    currentStateIndex--;
    changeState();
  }
}

function nextState() {
  if (currentStateIndex < states.length - 1 && currentState.isEnded()) {
    currentStateIndex++;
    changeState();
  }
}

function prevStep() {
  currentState.prevStep();
  togglePlay(false);
}

function nextStep() {
  currentState.nextStep();
  togglePlay(false);
}

function togglePlay(state) {
  play = state;
  if (play) {
    frameRate(1 * speed);
  } else {
    frameRate(30);
  }
  updateControls();
}

function changeState() {
  currentState = states[currentStateIndex % states.length];
  currentState.init(data);
  updateControls();
}

function updateControls() {
  DOMUtils.disableInput("prev_state", currentStateIndex == 0);
  DOMUtils.disableInput("next_state", currentStateIndex == states.length - 1);

  DOMUtils.disableInput("play", play);
  DOMUtils.disableInput("stop", !play);

  DOMUtils.disableInput("slow_down", speed <= 0.25);
  DOMUtils.disableInput("speed_up", speed >= 50);
  DOMUtils.setInnerHTML("speed", speed);
}

function changeSpeed(sign) {
  let delta = 0;
  if (sign > 0) {
    delta = 0.25;
    if (speed >= 2) delta = 0.5
    if (speed >= 5) delta = 1;
    if (speed >= 10) delta = 10;
  } else {
    delta = 10;
    if (speed <= 10) delta = 1;
    if (speed <= 5) delta = 0.5;
    if (speed <= 2) delta = 0.25;
  }

  speed += delta * sign;
  frameRate(1 * speed);
  updateControls();
}