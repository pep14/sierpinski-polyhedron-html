[xRotationInput, yRotationInput, zRotationInput].map(input => {
    input.addEventListener("input", function() {formatDegInput(input)});
    input.value = 0;
})

depthInput.addEventListener("input", formatDepthInput)

function formatDegInput(input) {
    var value = input.value.stripNonDec();

    if (value.includes("-")) value = -value.replace("-", "")

    value = ((value % 360) + 360) % 360;
    input.value = parseFloat(value.toFixed(2));

    rotation = [
        xRotationInput,
        yRotationInput,
        zRotationInput,
    ].map(i => Number(i.value));

    render();
}

function formatDepthInput() {
    var value = depthInput.value.charAt(1);
    
    if (value == '' || value == 0) {
        shapeDepth = 0;
    } else if (1 <= value && value <= depthInputMax) {
        shapeDepth = value;
    };

    depthInput.value = shapeDepth;
    updateCurrentShape();
    render();
}

function switchMultihedron() {
    tetrahedron = !tetrahedron;
    updateCurrentShape();
    render();

    multihedronSwitch.innerHTML = tetrahedron 
    ? "switch to octahedron"
    : "switch to tetrahedron";
}

String.prototype.stripNonDec = function() {
    return this.replace(/[^0-9.-]/g, "");
}