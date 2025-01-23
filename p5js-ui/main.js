import * as sketch from "./src/sketch.js"

for (let [key, val] of Object.entries(sketch)) {
  window[key] = val;
}