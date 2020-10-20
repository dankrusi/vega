let NodeCanvas;

try {
  // Allow projects to provide a reference to node-canvas directly
  if(global.canvas) NodeCanvas = global.canvas;
  else NodeCanvas = require('canvas');
  if (!(NodeCanvas && NodeCanvas.createCanvas)) {
    NodeCanvas = null;
  }
} catch (error) {
  // do nothing
  console.warn("Could not load the node-canvas package (via require('canvas')). Rendering behaviour is undefined without the canvas package, as fonts cannot be measured.");
}

export function nodeCanvas(w, h, type) {
  if (NodeCanvas) {
    try {
      return new NodeCanvas.Canvas(w, h, type);
    } catch (e) {
      // do nothing, return null on error
    }
  }
  return null;
}

export const nodeImage = () =>
  (NodeCanvas && NodeCanvas.Image) || null;
