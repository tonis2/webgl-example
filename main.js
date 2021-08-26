import { Matrix4, degToRad, radToDeg } from "./utils.js"

var canvas = document.getElementById("target");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;




var gl = canvas.getContext("webgl2");
if (!gl) {
    console.error("WebGL 2 not available");
    document.body.innerHTML = "This example requires WebGL 2 which is unavailable on this system."
}

let createBuffer = (arr) => {
    // ⚪ Create Buffer
    let buf = gl.createBuffer();
    let bufType =
        arr instanceof Uint16Array || arr instanceof Uint32Array ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
    // 🩹 Bind Buffer to WebGLState
    gl.bindBuffer(bufType, buf);
    // 💾 Push data to VBO
    gl.bufferData(bufType, arr, gl.STATIC_DRAW);
    return buf;
};


let setVertexBuffer = (buffer, name) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    let loc = gl.getAttribLocation(program, name);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc);
};

/////////////////////
// SET UP PROGRAM
/////////////////////

const vertexShaderData = `
    #version 300 es
        
    layout (location=0) in vec3 position;
    layout (location=1) in vec3 color;

    uniform mat4 cameraMatrix;

    out vec3 vColor;

    void main() {
        vColor = color;
        gl_Position = cameraMatrix * vec4(position.x, position.y, position.z, 1.0);
    }
`

const fragmentShaderData = `
    #version 300 es
    precision highp float;

    in vec3 vColor;
    out vec4 fragColor;

    void main() {
        fragColor = vec4(vColor, 0.5);
    }
`

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderData.trim());
gl.compileShader(vertexShader);

if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(vertexShader));
}

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderData.trim());
gl.compileShader(fragmentShader);

if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(fragmentShader));
}

var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
}

gl.useProgram(program);

/////////////////////
// SET UP GEOMETRY
/////////////////////

const indices = new Uint16Array([
    3, 2, 1, 3, 1, 0
]);

const vertices = new Float32Array([
    -0.5, 0.5, 0.0,
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    0.5, 0.5, 0.0
]);

const colors = new Float32Array([
    1.0, 1.0, 1.0,
    1.0, 1.0, 0.5,
    1.0, 0.5, 0.5
]);

var matrix = Matrix4.projection(10, 10, 100)
matrix.translate([5.0, 5.0, 5.0])
matrix.zRotate(degToRad(60))

const uniformLocation = gl.getUniformLocation(program, "cameraMatrix");

gl.uniformMatrix4fv(uniformLocation, false, new Float32Array(matrix.content));

var vertexBuffer = createBuffer(vertices);
var indexBuffer = createBuffer(indices);
var colorBuffer = createBuffer(colors);

setVertexBuffer(vertexBuffer, "position");
setVertexBuffer(colorBuffer, "color");

////////////////
// DRAW
////////////////

const render = () => {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

window.requestAnimationFrame(() => render())