// touch
const dimensionSize = 3000;         // canvas size
const shapeEdge = 2000;             // shape edge size relative to canvas size
const mouseSensitivity = 0.15;
const farColor = [255, 255, 255];   // RGB colour of the fog effect
const nearColor = [0, 0, 0];        // RGB colour of the shape
const shadowSideStrength = 0.05;    // side darkness multiplier. 0 means no shadow, 1 means only fully lit/dim

// maybe touch
const depthInputMax = 6;            // over 4 depth greatly worsens performance (over 3 for octahedra)

// dont touch
const canvasDimensions = [dimensionSize, dimensionSize];

const a = 1;
const h = Math.sqrt(2 / 3);

const tetrahedronVertices = [
    [0, -h / 3 * 2, 0],
    [-a / 2, h / 3, h / 3],
    [a / 2, h / 3, h / 3],
    [0, h / 3, -h / 3 * 2]
].map(j => j.map(i => i * shapeEdge + dimensionSize / 2));
const tetrahedronIndices = [
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
    [1, 2, 3],
];

const octahedronVertices = [
    [a, 0, 0],
    [0, a, 0],
    [0, 0, a],
    [-a, 0, 0],
    [0, -a, 0],
    [0, 0, -a],
].map(j => j.map(i => i * shapeEdge / 2 + dimensionSize / 2));
const octahedronIndices = [
    [0, 1, 2],
    [3, 1, 2],
    [0, 4, 2],
    [0, 1, 5],
    [3, 4, 2],
    [3, 1, 5],
    [0, 4, 5],
    [3, 4, 5]
];

var inputActive = false;
var lastMousePos = [0, 0];

canvas.setAttribute("width", canvasDimensions[0]);
canvas.setAttribute("height", canvasDimensions[1]);

document.addEventListener('pointerdown', (event) => {
    inputStart(event.clientX, event.clientY);
});

document.addEventListener("pointerup", (_) => {
    inputEnd();
});

document.addEventListener('pointermove', (event) => {
    inputIntermediate(event.clientX, event.clientY);
});

function inputStart(x, y) {
    inputActive = true;
    lastMousePos = [x, y];
}

function inputEnd() {
    inputActive = false
}

function inputIntermediate(x, y) {
    if (!inputActive) return;

    const dx = x - lastMousePos[0];
    const dy = y - lastMousePos[1];

    rotation = [
        rotation[0] - dy * mouseSensitivity,
        rotation[1] + dx * mouseSensitivity,
        rotation[2],
    ].map(i => i.toFixed(2) % 360);

    xRotationInput.value = rotation[0];
    yRotationInput.value = rotation[1];
    zRotationInput.value = rotation[2];

    render();

    lastMousePos = [x, y];
}

class Face {
    constructor(vertices, darkness) {
        this.vertices = vertices;
        this.darkness = darkness;
    }
}

function updateCurrentShape() {
    currentShape = generateHedron(
        shapeDepth, 
        tetrahedron ? tetrahedronVertices : octahedronVertices,
        tetrahedron ? tetrahedronIndices : octahedronIndices
    )
}

function range(max) {
    return [...Array(max).keys()];
}

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

function rotateVertex(vertex, pivot, rotation) {
    const [sinx, cosx, siny, cosy, sinz, cosz] = rotation;

    let x = vertex[0] - pivot[0];
    let y = vertex[1] - pivot[1];
    let z = vertex[2] - pivot[2];

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
    const tempRotation = [
        Math.sin(x), Math.cos(x),
        Math.sin(y), Math.cos(y),
        Math.sin(z), Math.cos(z),
    ];

    const pivot = [dimensionSize / 2, dimensionSize / 2, dimensionSize / 2];
    return vertices.map(v => rotateVertex(v, pivot, tempRotation));
}

function rotateFaces(faces, rotation) {
    return faces.map(face => new Face(rotateVertices(face.vertices, rotation), face.darkness));
}

function averageVertices(p1, p2) {
    return p1.map((v, i) => (v + p2[i]) / 2);
}

function calculateZIndex(face) {
    var sum = 0;
    face.map(v => sum += v[2]);
    return sum / 3;
}

function orderFaces(faces) {
    return [...faces].sort((a, b) => calculateZIndex(a.vertices) - calculateZIndex(b.vertices));
}

function generateHedron(depth, vertices, indices) {
    if (!depth) {
        return range(indices.length).map(j => 
            new Face(indices[j].map(i => vertices[i]), j)
        )
    } else {
        return range(vertices.length).flatMap(i => 
            generateHedron(
                depth - 1,
                vertices.map(v => averageVertices(v, vertices[i])),
                indices
            )
        )
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const faces = orderFaces(
        rotateFaces(currentShape, rotation)
    );

    for (const face of faces) {
        const vertices = face.vertices
        const color = interpolateRGB(calculateZIndex(vertices) * (1 + shadowSideStrength * face.darkness) / dimensionSize);

        ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`; 
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(vertices[0][0], vertices[0][1]);
        ctx.lineTo(vertices[1][0], vertices[1][1]);
        ctx.lineTo(vertices[2][0], vertices[2][1]);
        ctx.closePath();
        
        ctx.fill();
    };
}

updateCurrentShape();
render();