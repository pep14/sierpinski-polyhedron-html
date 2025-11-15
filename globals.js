const xRotationInput = document.getElementById("x-rotation");
const yRotationInput = document.getElementById("y-rotation");
const zRotationInput = document.getElementById("z-rotation");

const depthInput = document.getElementById("depth");
const multihedronSwitch = document.getElementById("shape-switch");
const settings = document.getElementById("settings");
const settingsToggle = document.getElementById("settings-toggle")

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

var rotation = [0, 0, 0];
var shapeDepth = 2;
var chosenShape = 0;

var currentShape = undefined;

depthInput.value = shapeDepth;