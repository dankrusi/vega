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
}

export function nodeCanvas(w, h, type) {
  if (NodeCanvas) {
    try {
      return new NodeCanvas.Canvas(w, h); // bug: dankrusi: when rendering to SVG the type is is really important. this applies also to font measuring
    } catch (e) {
      // do nothing, return null on error
    }
  }
  return null;
}

export const nodeImage = () =>
  (NodeCanvas && NodeCanvas.Image) || null;
