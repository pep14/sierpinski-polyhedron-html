const xRotationInput = document.getElementById("x-rotation");
const yRotationInput = document.getElementById("y-rotation");
const zRotationInput = document.getElementById("z-rotation");

const depthInput = document.getElementById("depth");
const multihedronSwitch = document.getElementById("shape-switch");

var rotation = [0, 0, 0];
var shapeDepth = 3;
var tetrahedron = true;

multihedronSwitch.innerHTML = tetrahedron 
? "switch to octahedron"
: "switch to tetrahedron";

var currentShape = undefined;

depthInput.value = shapeDepth;