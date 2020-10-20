import {domCanvas, domImage} from './src/domCanvas';
import {nodeCanvas, nodeImage} from './src/nodeCanvas';

export {domCanvas} from './src/domCanvas';
export {nodeCanvas} from './src/nodeCanvas';

export function canvas(w, h, type) {
  var ret = domCanvas(w, h) || nodeCanvas(w, h, type) || null;
  if(ret != null) return ret;
  else throw "Could not get a canvas to draw onto. Are you on NodeJS? If so make sure the 'canvas' package is installed and accessible (npm install canvas)!";
}

export function image() {
  var ret = domImage() || nodeImage() || null;
  if(ret != null) return ret;
  else throw "Could not get a image to draw onto. Are you on NodeJS? If so make sure the 'canvas' package is installed and accessible (npm install canvas)!";
}
