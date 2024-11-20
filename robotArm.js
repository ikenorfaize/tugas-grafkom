"use strict";

var canvas, gl, program;
var NumVertices = 36;

var points = [];
var colors = [];

var verticesBase = [
    vec4(-1.0, 0.0, 1.0, 1.0),  // 0
    vec4(1.0, 0.0, 1.0, 1.0),   // 1
    vec4(1.0, 0.0, -1.0, 1.0),  // 2
    vec4(-1.0, 0.0, -1.0, 1.0), // 3
    vec4(-0.5, 1.0, 0.5, 1.0),  // 4
    vec4(0.5, 1.0, 0.5, 1.0),   // 5
    vec4(0.5, 1.0, -0.5, 1.0),  // 6
    vec4(-0.5, 1.0, -0.5, 1.0), // 7
];

var verticesSegment = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),
];

var vertexColors = [
    vec4(0.0118, 0.0157, 0.3686, 1.0), // Biru gelap untuk base
    vec4(0.6, 0.8, 1.0, 1.0),         // Biru terang untuk konektor
    vec4(0.4, 0.4, 0.4, 1.0),         // Abu-abu untuk segmen
];

var BASE_HEIGHT = 2.0;
var BASE_WIDTH = 2.0;
var SEGMENT_HEIGHT = 4.0;
var SEGMENT_WIDTH = 0.5;

var modelViewMatrix, projectionMatrix;
var Base = 0;
var Segment1 = 1;
var Segment2 = 2;
var Segment3 = 3;

var theta = [0, 0, 0, 0];
var modelViewMatrixLoc;

//tambah 
var autoAnimate = false; // Status animasi otomatis
var animationStep = 1;   // Langkah perubahan animasi

function toggleAnimation() {
    autoAnimate = !autoAnimate; // Aktif/nonaktif animasi
    if (autoAnimate) {
        animate();
    }
}

function animate() {
    if (!autoAnimate) return; // Berhenti jika animasi dinonaktifkan

    theta[Base] += animationStep;
    theta[Segment1] += animationStep;
    theta[Segment2] -= animationStep;
    theta[Segment3] += animationStep;

    if (theta[Base] > 175 || theta[Base] < -175) {
        animationStep = -animationStep; // Balik arah jika melebihi batas
    }

    setTimeout(animate, 50); // Jalankan ulang setiap 50ms
}

init();

function quad(vertices, a, b, c, d, colorIndex) {
    colors.push(vertexColors[colorIndex]); points.push(vertices[a]);
    colors.push(vertexColors[colorIndex]); points.push(vertices[b]);
    colors.push(vertexColors[colorIndex]); points.push(vertices[c]);
    colors.push(vertexColors[colorIndex]); points.push(vertices[a]);
    colors.push(vertexColors[colorIndex]); points.push(vertices[c]);
    colors.push(vertexColors[colorIndex]); points.push(vertices[d]);
}

function colorTrapezoid() {
    quad(verticesBase, 0, 1, 5, 4, 0); // Depan
    quad(verticesBase, 1, 2, 6, 5, 0); // Kanan
    quad(verticesBase, 2, 3, 7, 6, 0); // Belakang
    quad(verticesBase, 3, 0, 4, 7, 0); // Kiri
    quad(verticesBase, 4, 5, 6, 7, 0); // Atas
    quad(verticesBase, 0, 1, 2, 3, 0); // Bawah
}

function colorCube() {
    quad(verticesSegment, 1, 0, 3, 2, 2); // Depan
    quad(verticesSegment, 2, 3, 7, 6, 2); // Kanan
    quad(verticesSegment, 3, 0, 4, 7, 2); // Bawah
    quad(verticesSegment, 6, 5, 1, 2, 2); // Atas
    quad(verticesSegment, 4, 5, 6, 7, 2); // Belakang
    quad(verticesSegment, 5, 4, 0, 1, 2); // Kiri
}

function init() {
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorTrapezoid(); // Base
    colorCube(); // Segmen

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    document.getElementById("slider1").oninput = (event) => (theta[Base] = event.target.value);
    document.getElementById("slider2").oninput = (event) => (theta[Segment1] = event.target.value);
    document.getElementById("slider3").oninput = (event) => (theta[Segment2] = event.target.value);
    document.getElementById("slider4").oninput = (event) => (theta[Segment3] = event.target.value);
    document.getElementById("toggle-animation").onclick = toggleAnimation;

    render();
}

function base() {
    var s = scale(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
    var instanceMatrix = mult(translate(0.0, 0.5 * BASE_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, 36); // Base menggunakan vertex trapezoid
}

function segment(width, height) {
    var s = scale(width, height, width);
    var instanceMatrix = mult(translate(0.0, 0.5 * height, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 36, 36); // Segmen menggunakan vertex kubus
}

function sphere(radius) {
    gl.uniform4fv(gl.getUniformLocation(program, "vColor"), flatten(vertexColors[1])); // Warna biru terang
    var s = scale(radius, radius, radius);
    var instanceMatrix = mult(modelViewMatrix, s);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    gl.drawArrays(gl.TRIANGLES, 72, points.length - 72);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Base
    modelViewMatrix = translate(0.0, -6.0, 0.0);
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[Base], vec3(0, 1, 0)));
    base();

    // Segment 1
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, 2.8, 0.0)); // Pindahkan ke pojok kanan depan base
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[Segment1], vec3(0, 0, 1)));
    sphere(1); // Bola konektor biru terang
    segment(SEGMENT_WIDTH, SEGMENT_HEIGHT);

    // Segment 2
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, SEGMENT_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[Segment2], vec3(0, 0, 1)));
    sphere(1); // Bola konektor biru terang
    segment(SEGMENT_WIDTH, SEGMENT_HEIGHT);

    // Segment 3
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, SEGMENT_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[Segment3], vec3(0, 0, 1)));
    sphere(1); // Bola konektor biru terang
    segment(SEGMENT_WIDTH, SEGMENT_HEIGHT);

    requestAnimationFrame(render);
}
