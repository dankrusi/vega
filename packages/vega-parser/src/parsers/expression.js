import {
  ASTNode,
  parse,
  codegen,
  functions as baseFunctions,
  constants
} from 'vega-expression';
import {error, stringValue} from 'vega-util';

var Literal = 'Literal';
var Identifier = 'Identifier';

export var signalPrefix = '$';
export var scalePrefix  = '%';
export var indexPrefix  = '@';
export var eventPrefix  = 'event.vega.';

function signalCode(id) {
  return '_[' + stringValue('$' + id) + ']';
}

export var functions = function(codegen) {
  var fn = baseFunctions(codegen);

  // view-specific event information
  fn.view   = eventPrefix + 'view';
  fn.item   = eventPrefix + 'item';
  fn.group  = eventPrefix + 'group';
  fn.xy     = eventPrefix + 'xy';
  fn.x      = eventPrefix + 'x';
  fn.y      = eventPrefix + 'y';
  fn.encode = 'this.encode';
  fn.modify = 'this.modify';

  // format functions
  fn.format = 'this.format';
  fn.timeFormat = 'this.timeFormat';
  fn.utcFormat = 'this.utcFormat';
  fn.pad = 'this.pad';
  fn.truncate = 'this.truncate';

  // color functions
  fn.rgb = 'this.rgb';
  fn.lab = 'this.lab';
  fn.hcl = 'this.hcl';
  fn.hsl = 'this.hsl';
  fn.gradient = 'this.gradient';

  // scales, projections, data
  fn.copy = 'this.scaleCopy';
  fn.bandwidth = 'this.bandwidth';
  fn.indata = 'this.indata';
  fn.inrange = 'this.inrange';
  fn.invert = 'this.scaleInvert';
  fn.range = 'this.range';
  fn.scale = 'this.scale';
  fn.span = 'this.span';

  // interaction support
  fn.clampRange    = 'this.clampRange';
  fn.pinchDistance = 'this.pinchDistance';
  fn.pinchAngle    = 'this.pinchAngle';

  // environment functions
  fn.open   = 'this.open';
  fn.screen = function() { return 'window.screen'; };
  fn.windowsize = function() {
    return '[window.innerWidth, window.innerHeight]';
  };

  return fn;
};

export var generator = codegen({
  blacklist:  ['_'],
  whitelist:  ['datum', 'event'],
  fieldvar:   'datum',
  globalvar:  signalCode,
  functions:  functions,
  constants:  constants
});

function signal(name, scope, params) {
  var signalName = signalPrefix + name;
  if (!params.hasOwnProperty(signalName)) {
    params[signalName] = scope.signalRef(name);
  }
}

function scale(name, scope, params) {
  var scaleName = scalePrefix + name;
  if (!params.hasOwnProperty(scaleName)) {
    try {
      params[scaleName] = scope.scaleRef(name);
    } catch (err) {
      // TODO: error handling? warning?
    }
  }
}

function index(data, field, scope, params) {
  var indexName = indexPrefix + field;
  if (!params.hasOwnProperty(indexName)) {
    params[indexName] = scope.getData(data).indataRef(scope, field);
  }
}

export default function(expr, scope, preamble) {
  var params = {}, ast, gen;

  try {
    ast = parse(expr);
  } catch (err) {
    error('Expression parse error: ' + expr);
  }

  // analyze ast for dependencies
  ast.visit(function visitor(node) {
    if (node.type !== 'CallExpression') return;

    var name = node.callee.name,
        args = node.arguments;

    switch (name) {
      case 'bandwidth':
      case 'copy':
      case 'range':
      case 'gradient':
      case 'invert':
      case 'scale':
        if (args[0].type === Literal) {           // scale dependency
          scale(args[0].value, scope, params);
        } else if (args[0].type === Identifier) { // forward reference to signal
          name = args[0].name;
          args[0] = new ASTNode(Literal);
          args[0].raw = '{signal:"' + name + '"}';
        }
        break;
      case 'indata':
        if (args[0].type !== Literal) error('First argument to indata must be a string literal.');
        if (args[1].type !== Literal) error('Second argument to indata must be a string literal.');
        index(args[0].value, args[1].value, scope, params);
        break;
    }
  });

  // perform code generation
  gen = generator(ast);
  gen.globals.forEach(function(name) { signal(name, scope, params); });

  // returned parsed expression
  return {
    $expr:   preamble ? preamble + 'return(' + gen.code + ');' : gen.code,
    $fields: gen.fields,
    $params: params
  };
}