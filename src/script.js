
var worldMatrix
var matWorldLocation
var matViewLocation
var matProjLocation
var viewMatrix
var projMatrix
var mIdentity

var rotAngle = [0,0,0]
var translation = [0,0,0];
var scale = [1, 1, 1];
var camAngle = 0;
var camRadius = 5;
var rotated = [0,0,0];
var color = [0.2 ,0.1 , 0.4];
var animation = false;
var number = 0;
var shading = true;


/* Dropdown Handler */
function toggleDropdown(dropdownId) {
    var dropdowns = document.querySelectorAll('.dropdown.show');
    dropdowns.forEach(function(dropdown) {
        if (dropdown.id !== dropdownId) {
            dropdown.classList.remove("show");
        }
    });

    var dropdown = document.getElementById(dropdownId);
    dropdown.classList.toggle("show");
  }

/* Range value Handler */
const inputs = [
  {input: document.getElementById('x-rotation'), value: document.getElementById('x-rotation-value'), unit: '°'},
  {input: document.getElementById('y-rotation'), value: document.getElementById('y-rotation-value'), unit: '°'},
  {input: document.getElementById('z-rotation'), value: document.getElementById('z-rotation-value'), unit: '°'},
  {input: document.getElementById('x-scale'), value: document.getElementById('x-scale-value'), unit: ''},
  {input: document.getElementById('y-scale'), value: document.getElementById('y-scale-value'), unit: ''},
  {input: document.getElementById('z-scale'), value: document.getElementById('z-scale-value'), unit: ''},
  {input: document.getElementById('x-translate'), value: document.getElementById('x-translate-value'), unit: ''},
  {input: document.getElementById('y-translate'), value: document.getElementById('y-translate-value'), unit: ''},
  {input: document.getElementById('z-translate'), value: document.getElementById('z-translate-value'), unit: ''},
  {input: document.getElementById('angle-camera'), value: document.getElementById('angle-camera-value'), unit: '°'},
  {input: document.getElementById('radius-camera'), value: document.getElementById('radius-camera-value'), unit: ''}
];

inputs.forEach(({input, value, unit}) => {
  input.addEventListener('input', () => {
    value.innerText = input.value + unit;
  });
});


/* Upload Handler */
document.addEventListener("DOMContentLoaded", function() {
  const uploadButton = document.getElementById("upload-button");
  const fileInput = document.getElementById("file-input");

  uploadButton.addEventListener("click", function() {
    fileInput.click();
  });
});

/* Default State */
function defaultState() {
  rotAngle = [0,0,0];
  translation = [0,0,0];
  scale = [1, 1, 1];
  camAngle = 0; 
  camRadius = 5;
  rotated = [0,0,0];
  color = [0.2 ,0.1 , 0.4];
  animation = false;
  number = 0;
  shading = true;
}

/* Initialize */
window.onload = function init() {
  canvas = document.getElementById("canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); }
  gl.clearColor(0.125, 0.125, 0.118, 1.0);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  
  var boxVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBuffer);
  
  var boxIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBuffer);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition,3,gl.FLOAT,gl.FALSE,6 * Float32Array.BYTES_PER_ELEMENT,0);
  gl.enableVertexAttribArray(vPosition);

  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor,3,gl.FLOAT,gl.FALSE,6 * Float32Array.BYTES_PER_ELEMENT,3 * Float32Array.BYTES_PER_ELEMENT,);
  gl.enableVertexAttribArray(vColor);

  gl.useProgram(program);

  matWorldLocation = gl.getUniformLocation(program, 'mWorld');
  matViewLocation = gl.getUniformLocation(program, 'mView');
  matProjLocation = gl.getUniformLocation(program, 'mProj');

  // worldMatrix = new Float32Array(16);
  viewMatrix = new Float32Array(16);
  projMatrix = new Float32Array(16);
  lookAt(viewMatrix, [0, 0, 5], [0, 0, 0], [0, 1, 0]);
  perspective(projMatrix, toRadian(45), canvas.width / canvas.height, 0.1, 100.0);
  document.getElementById("perspective").checked = true;

  gl.uniformMatrix4fv(matViewLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjLocation, gl.FALSE, projMatrix);

/* Shape Button Handler */
  const buttons = document.querySelectorAll('.shape');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });

  defaultState();
  stopAnimation();
  render();
}

/* Render */
function render() {
  mIdentity = new Float32Array(16);
  identity(mIdentity);
  gl.drawElements(gl.TRIANGLES, indices[0].length, gl.UNSIGNED_SHORT, 0);
  var loop = () => {
    if (animation){
      rotAngle[0] += (1/1800 * Math.PI);
      rotAngle[1] += (1/1800 * Math.PI);
      rotAngle[2] += (1/1800 * Math.PI);
    } 

    worldMatrix = transformMatrix.projection(2,2,2)
    worldMatrix = transformMatrix.translate(worldMatrix, translation[0], translation[1], translation[2]);
    worldMatrix = transformMatrix.xRotate(worldMatrix, rotAngle[0]);
    worldMatrix = transformMatrix.yRotate(worldMatrix, rotAngle[1]);
    worldMatrix = transformMatrix.zRotate(worldMatrix, rotAngle[2]);
    worldMatrix = transformMatrix.scale(worldMatrix, scale[0], scale[1], scale[2]);

    gl.uniformMatrix4fv(matWorldLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjLocation, gl.FALSE, projMatrix);

    gl.clearColor(0.125, 0.125, 0.118, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // buat bikin articulated model nya kalo udah semua hapus aja
    if (number==0){
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model[number]), gl.STATIC_DRAW);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices[number]), gl.STATIC_DRAW);
      gl.drawElements(gl.TRIANGLES, indices[number].length, gl.UNSIGNED_SHORT, 0);
    }

    if (number == 1) {
      for (let i=0;i <model[number].length;i++){
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model[number][i].getVertices()), gl.STATIC_DRAW);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model[number][i].getIndices()), gl.STATIC_DRAW);
        gl.drawElements(gl.TRIANGLES, model[number][i].getIndicesLength(), gl.UNSIGNED_SHORT, 0);
      }
      
    }


    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

const toRadian = (deg) => {
  return deg * Math.PI / 180;
}

const hexToRgb = (hex) => {
  var r = parseInt(hex.slice(1, 3), 16) / 255;
  var g = parseInt(hex.slice(3, 5), 16) / 255;
  var b = parseInt(hex.slice(5, 7), 16) / 255;

  return [r, g, b];
}


function changeShape(model){
  if (model=='cube'){
    number = 0;
  } else if (model=='triangular-prism'){
    number = 1;
  } else if (model=='square-pyramid'){
    number = 2;
  } else{
    number = 3;
  }
}

function shaderModel(color){
  let r = color[0]
  let g = color[1]
  let b = color[2]

  if (shading){
    for (var i = 0; i < model.length; i++){
      var sides = 6;
      if (number == 1){
        sides = 5;
      }
      var color = [0.0, 0.0, 0.0];
      for (var j = 3; j < model[i].length; j+=6){
        if (j < sides * 24){
          color = [(0.3+r)/1.4,(0.3+g)/1.4,(0.3+b)/1.4];
        } else if (j >= sides * 24 && j < sides * 2 * 24){
          color = [r/1.3,g/1.3,b/1.3];
        } else {
          color = [r,g,b];
        }
        model[i][j] = color[0];
        model[i][j+1] = color[1];
        model[i][j+2] = color[2];
      }
    }
  } else {
    for (var i = 0; i < model.length; i++){
      for (var j = 3; j < model[i].length; j+=6){
        model[i][j] = r;
        model[i][j+1] = g;
        model[i][j+2] = b;
      }
    }
  }
}

function changeShading(e) {
  shading = document.querySelector("#shading").checked;
  shaderModel(color);
}

document.getElementById("shading").addEventListener('change', changeShading, false);

function changeAnimation(e) {
  animation = document.querySelector("#animation").checked;
}

document.getElementById("animation").addEventListener('change', changeAnimation, false);

function changeColor(e) {
  color = hexToRgb(document.querySelector("#color-picker").value);
  shaderModel(color);
}

document.getElementById("color-picker").addEventListener('input', changeColor, false);


function rotateModel(id, angle) {
  stopAnimation()
  rotAngle[id] = toRadian(angle)
  rotated = rotAngle;
}

function translateModel(id, value) {
  // stopAnimation()
  translation[id] = value
}

function scaleModel(id, value){
  // stopAnimation()
  scale[id] = value
}

function changeAngle(value){
  stopAnimation()
  camAngle = toRadian(value)
  changeCameraPosition()
}

function changeRadius(value){
  stopAnimation()
  camRadius = value
  changeCameraPosition()
}

function changeCameraPosition() {
  const x = Math.sin(camAngle) * camRadius
  const y = 0
  const z = Math.cos(camAngle) * camRadius
  lookAt(viewMatrix, [x, y, z], [0, 0, 0], [0, 1, 0])
}

function resetCameraView(){
  camAngle = 0
  camRadius = 5
  defaultState()
  changeCameraPosition()
  shaderModel(color)
  changeProjection('perspective')
  
  // reset value of slider
  inputs.forEach(function(item){
    item.input.value = item.input.defaultValue;
    item.value.innerText = item.input.defaultValue + item.unit;
  })

  // reset value of all button
  document.getElementById("shading").checked = true;
  document.getElementById("color-picker").value = "#331A66";
  document.getElementById("perspective").checked = true;
  document.getElementById("set-cube").classList.add("active");
  document.getElementById("set-triangularPrism").classList.remove("active");
  document.getElementById("set-squarePyramid").classList.remove("active");
  document.getElementById("set-loadedModel").classList.remove("active");
}

function stopAnimation(){
  document.getElementById("animation").checked = false;
  animation = false
  // rotAngle[0] =0
}

function changeProjection(type){
  if (type == 'perspective'){
    stopAnimation()
    perspective(projMatrix, toRadian(45), canvas.width / canvas.height, 0.1, 100.0)
  } else if (type == 'orthographic') {
    stopAnimation()
    orthographic(projMatrix, -3.2, 3.2, -1.8, 1.8, 0.1, 100.0)
  } else if (type == 'oblique'){
    stopAnimation()
    oblique(projMatrix, -2.3, 5.7, -1.3, 2.7, 0.1, 100.0, toRadian(-85), toRadian(-85))
  }
}

function saveModel(){
  const verticesModel = model[number]
  const indicesModel = indices[number]
  var result =[];
  for (let i = 0; i < verticesModel.length;i+=6){
    result.push(...multVerticesTransformMatrix(verticesModel.slice(i,i+6),worldMatrix))
  }
  const jsonObj = {
    vertices: result,
    indices: indicesModel
  };
  const jsonFile = JSON.parse(JSON.stringify(jsonObj));

  const downloadFile = document.createElement("a");
  downloadFile.href = URL.createObjectURL(new Blob([JSON.stringify(jsonFile, null, 2)], {
    type: "text/plain"
  }));
  downloadFile.setAttribute("download", "Model.json");
  document.body.appendChild(downloadFile);
  downloadFile.click();
  document.body.removeChild(downloadFile);
  
}

function multVerticesTransformMatrix(vertices,transformMatrix) {
  const vert = vertices.slice(0,3)
  vert.push(1.0);
  const out = []
  for (let i = 0; i < 1; i++) {
    for (let j = 0; j < 4; j++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += vert[4 * i + k] * transformMatrix[4 * k + j];

      }
      out[4 * i + j] = sum;
    }
  }
  out.splice(3,1)
  out.push(...vertices.slice(3, 6))
  return out;
}

function loadModel(){
  const file = document.getElementById("file-input").files[0];
  var fileread;
  let reader = new FileReader();

  reader.readAsText(file);
  model[1] =[]
  indices[1] =[]
  reader.onload = function () {
    fileread = JSON.parse(reader.result);
    for (let i = 0; i < fileread.length; i++) {
      model[1].push(new Articulated(fileread[i]["name"], fileread[i]["vertices"],fileread[i]["indices"]))
    }
    console.log(model[1]);
  }


}