// touch
const dimensionSize = 3000;         // canvas size
const shapeEdge = 2000;             // shape edge size relative to canvas size
const shapeDepth = 4;               // recursion depth, over 4 significantly lowers performance
const mouseSensitivity = 0.15;
const farColor = [255, 255, 255];   // RGB colour of the fog effect
const nearColor = [0, 0, 0];        // RGB colour of the shape
const shadowSideStrength = 0.05     // side darkness multiplier. 0 means no shadow, 1 means only fully lit/dim

// dont touch
const shapeHeight = Math.sqrt(2 / 3) * shapeEdge;
const canvasDimensions = [dimensionSize, dimensionSize];
const baseShapeVertices = [
    [0, -shapeHeight * 2 / 3, 0],
    [-shapeEdge / 2, shapeHeight / 3, shapeHeight / 3],
    [shapeEdge / 2, shapeHeight / 3, shapeHeight / 3],
    [0, shapeHeight / 3, -shapeHeight * 2 / 3]
].map(v => v.map(i => i + dimensionSize / 2));



const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

var mouseDown = false;
var lastMousePos = [0, 0];
var rotation = [0, 0, 0];

canvas.setAttribute("width", canvasDimensions[0]);
canvas.setAttribute("height", canvasDimensions[1]);

document.addEventListener('mousedown', (event) => {
    mouseDown = true;
    lastMousePos = [event.clientX, event.clientY];
});

document.addEventListener("mouseup", (_) => {
    mouseDown = false
});

document.addEventListener('mousemove', (event) => {
    if (!mouseDown) return;

    const dx = event.clientX - lastMousePos[0];
    const dy = event.clientY - lastMousePos[1];

    rotation = [
        rotation[0] - dy * mouseSensitivity,
        rotation[1] + dx * mouseSensitivity,
        rotation[2],
    ].map(i => i.toFixed(2) % 360);

    xRotationInput.value = rotation[0];
    yRotationInput.value = rotation[1];
    zRotationInput.value = rotation[2];

    render();

    lastMousePos = [event.clientX, event.clientY];
});

const tetrahedronIndices = [
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
    [1, 2, 3],
];

function interpolateRGB(d) {
    return [
        farColor[0] + (nearColor[0] - farColor[0]) * d,
        farColor[1] + (nearColor[1] - farColor[1]) * d,
        farColor[2] + (nearColor[2] - farColor[2]) * d
    ];
}

function degToRad(deg) {
    return (deg * Math.PI) / 180;
}

function rotatePoint(point, pivot, rotation) {
    const [sinx, cosx, siny, cosy, sinz, cosz] = rotation;

    let x = point[0] - pivot[0];
    let y = point[1] - pivot[1];
    let z = point[2] - pivot[2];

    let sy = y * cosx - z * sinx;
    let sz = y * sinx + z * cosx;
    y = sy;
    z = sz;

    let sx = x * cosy + z * siny;
    sz = -x * siny + z * cosy;
    x = sx;
    z = sz;

    sx = x * cosz - y * sinz;
    sy = x * sinz + y * cosz;
    x = sx;
    y = sy;

    return [x + pivot[0], y + pivot[1], z + pivot[2]];
}

function rotateVertices(vertices, rotation) {
    const [x, y, z] = rotation.map(degToRad);

    const pivot = [dimensionSize / 2, dimensionSize / 2, dimensionSize / 2];
    return vertices.map(v => rotatePoint(v, pivot, 
        [
            Math.sin(x), Math.cos(x),
            Math.sin(y), Math.cos(y),
            Math.sin(z), Math.cos(z),
        ]
    ));
}

function averagePositions(p1, p2) {
    return p1.map((v, i) => (v + p2[i]) / 2);
}

function calculateZIndex(face) {
    var sum = 0;
    face.map(v => sum += v[2]);
    return sum / 3;
}

function generateShape(depth, vertices) {
    if (!depth) {
        return [...Array(tetrahedronIndices.length).keys()].map(j => {
            const faceVertices = tetrahedronIndices[j].map(i => vertices[i]);
            return [...faceVertices, calculateZIndex(faceVertices), j - 1];
        });
    } else {
        return [0, 1, 2, 3].flatMap(i => generateShape(
            depth - 1,
            vertices.map(v => averagePositions(v, vertices[i]))
        ));
    }
}

function orderFaces(faces) {
    return [...faces].sort((a, b) => a[3] - b[3]);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const faces = orderFaces(
        generateShape(shapeDepth, rotateVertices(
                baseShapeVertices, rotation
            )
        )
    );

    for (const face of faces) {
        const color = interpolateRGB(face[3] * (1 + shadowSideStrength * face[4]) / dimensionSize);

        ctx.fillStyle = ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(face[0][0], face[0][1]);
        ctx.lineTo(face[1][0], face[1][1]);
        ctx.lineTo(face[2][0], face[2][1]);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
    };
}

render();