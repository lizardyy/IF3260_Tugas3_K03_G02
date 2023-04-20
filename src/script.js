
var worldMatrix
var matWorldLocation
var matViewLocation
var matProjLocation
var lightDirectionLocation
var shadingLocation
var textureLocation
var worldCameraLocation
var normalLocation
var viewMatrix
var projMatrix
var mIdentity
var transformMatrixComponent
var textureBuffer
var normalBuffer

var rotAngle = [0,0,0]
var translation = [0,0,0];
var scale = [1, 1, 1];
var camAngle = 0;
var camRadius = 5;
var color = [0.2 ,0.1 , 0.4];
var animation = false;
var number = 0;
var shading = true;
var customMapping = false;
var reflectiveMapping = false;
var bumpMapping = false;
var selectedComponent =-1;
var lightDirection = [1, 1, 1];

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
  {input: document.getElementById('part-rotation'), value: document.getElementById('part-rotation-value'), unit: '°'},
  {input: document.getElementById('x-scale'), value: document.getElementById('x-scale-value'), unit: ''},
  {input: document.getElementById('y-scale'), value: document.getElementById('y-scale-value'), unit: ''},
  {input: document.getElementById('z-scale'), value: document.getElementById('z-scale-value'), unit: ''},
  {input: document.getElementById('x-translate'), value: document.getElementById('x-translate-value'), unit: ''},
  {input: document.getElementById('y-translate'), value: document.getElementById('y-translate-value'), unit: ''},
  {input: document.getElementById('z-translate'), value: document.getElementById('z-translate-value'), unit: ''},
  {input: document.getElementById('angle-camera'), value: document.getElementById('angle-camera-value'), unit: '°'},
  {input: document.getElementById('radius-camera'), value: document.getElementById('radius-camera-value'), unit: ''},
  {input: document.getElementById('light-x'), value: document.getElementById('light-x-value'), unit: ''},
  {input: document.getElementById('light-y'), value: document.getElementById('light-y-value'), unit: ''},
  {input: document.getElementById('light-z'), value: document.getElementById('light-z-value'), unit: ''}
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
  rotAngle = [0,0,0,0];
  translation = [0,0,0];
  scale = [1, 1, 1];
  camAngle = 0; 
  camRadius = 5;
  color = [0.2 ,0.1 , 0.4];
  animation = false;
  number = 0;
  shading = true;
  customMapping = false;
  reflectiveMapping = false;
  bumpMapping = false;
  lightDirection = [1, 1, 1];
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

  textureBuffer = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureBuffer);

  // normalBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  // setNormals(gl);

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
  lightDirectionLocation = gl.getUniformLocation(program, 'uLightDirection');
  shadingLocation = gl.getUniformLocation(program, 'shading');
  customMappingLocation = gl.getUniformLocation(program, 'customMapping');
  reflectiveMappingLocation = gl.getUniformLocation(program, 'reflectiveMapping');
  bumpMappingLocation = gl.getUniformLocation(program, 'bumpMapping');
  textureLocation = gl.getUniformLocation(program, 'uTexture');
  worldCameraLocation = gl.getUniformLocation(program, 'uWorldCameraPosition');

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
  var loop = () => {
    if (animation){
      rotAngle[0] += (1/1800 * Math.PI);
      rotAngle[1] += (1/1800 * Math.PI);
      rotAngle[2] += (1/1800 * Math.PI);
    } 

    worldMatrix = transformMatrix.projection(2, 2, 2)
    worldMatrix = transformMatrix.translate(worldMatrix, translation[0], translation[1], translation[2]);
    worldMatrix = transformMatrix.xRotate(worldMatrix, rotAngle[0]);
    worldMatrix = transformMatrix.yRotate(worldMatrix, rotAngle[1]);
    worldMatrix = transformMatrix.zRotate(worldMatrix, rotAngle[2]);
    worldMatrix = transformMatrix.scale(worldMatrix, scale[0], scale[1], scale[2]);
    if (selectedComponent != -1){
      transformMatrixComponent = model[selectedComponent].getTransformMatrix()

      const rotationCoord = model[selectedComponent].getRotationCoord();
      let xAxis = rotationCoord[0];
      let yAxis = rotationCoord[1];
      let zAxis = rotationCoord[2];
      transformMatrixComponent = transformMatrix.translate(transformMatrixComponent, xAxis, yAxis, zAxis);
      if (model[selectedComponent].getRotationAxis() == "x")  transformMatrixComponent = transformMatrix.xRotate(transformMatrixComponent, model[selectedComponent].getRotationAngle());
      else if (model[selectedComponent].getRotationAxis() == "y")transformMatrixComponent = transformMatrix.yRotate(transformMatrixComponent, model[selectedComponent].getRotationAngle());
      else if (model[selectedComponent].getRotationAxis() == "z")transformMatrixComponent = transformMatrix.zRotate(transformMatrixComponent, model[selectedComponent].getRotationAngle());
      transformMatrixComponent = transformMatrix.translate(transformMatrixComponent, -xAxis, -yAxis, -zAxis);
    }

    gl.uniformMatrix4fv(matWorldLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjLocation, gl.FALSE, projMatrix);
    gl.uniform1i(shadingLocation, shading);
    gl.uniform1i(customMappingLocation, customMapping);
    gl.uniform1i(reflectiveMappingLocation, reflectiveMapping);
    gl.uniform1i(bumpMappingLocation, bumpMapping);
    gl.uniform3fv(lightDirectionLocation, lightDirection);

    gl.clearColor(0.125, 0.125, 0.118, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    for (let i=0;i <model.length;i++){
      if (i == selectedComponent){
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mult(model[i].getVertices(), transformMatrixComponent)), gl.STATIC_DRAW);
      } else {  
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mult(model[i].getVertices(), model[i].getTransformMatrix())), gl.STATIC_DRAW);
      }
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model[i].getIndices()), gl.STATIC_DRAW);
      gl.drawElements(gl.TRIANGLES, model[i].getIndicesLength(), gl.UNSIGNED_SHORT, 0);
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

function shaderModel(color){
  if (!shading){
    customMapping = false;
    reflectiveMapping = false;
    bumpMapping = false;
  }
  // let r = color[0]
  // let g = color[1]
  // let b = color[2]

  // // if (shading){
  // //   for (var i = 0; i < model.length; i++){
  // //     var sides = 6;
  // //     if (number == 1){
  // //       sides = 5;
  // //     }
  // //     var color = [0.0, 0.0, 0.0];
  // //     for (var j = 3; j < model[i].length; j+=6){
  // //       if (j < sides * 24){
  // //         color = [(0.3+r)/1.4,(0.3+g)/1.4,(0.3+b)/1.4];
  // //       } else if (j >= sides * 24 && j < sides * 2 * 24){
  // //         color = [r/1.3,g/1.3,b/1.3];
  // //       } else {
  // //         color = [r,g,b];
  // //       }
  // //       model[i][j] = color[0];
  // //       model[i][j+1] = color[1];
  // //       model[i][j+2] = color[2];
  // //     }
  // //   }
  // // } else {
  // //   for (var i = 0; i < model.length; i++){
  // //     for (var j = 3; j < model[i].length; j+=6){
  // //       model[i][j] = r;
  // //       model[i][j+1] = g;
  // //       model[i][j+2] = b;
  // //     }
  // //   }
  // // }
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
  if (id != 3){
    rotAngle[id] = toRadian(angle)
  } else {
    model[selectedComponent].setRotationAngle(toRadian(angle))
    console.log(model[selectedComponent].getRotationAngle())
  }
}

function translateModel(id, value) {
  // stopAnimation()
  translation[id] = value
}

function changeLightDirection(id, value) {
  lightDirection[id] = Number(value);
  console.log(lightDirection);
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
  const setCube = document.getElementById("set-cube");
  if(setCube != null) {
    setCube.classList.add("active");
  }
  // document.getElementById("set-cube").classList.add("active");
  const setTriangularPrism = document.getElementById("set-triangularPrism");
  if(setTriangularPrism != null) {
    setTriangularPrism.classList.remove("active");
  }
  // document.getElementById("set-triangularPrism").classList.remove("active");
  const setSquarePyramid = document.getElementById("set-squarePyramid");
  if(setSquarePyramid != null) {
    setSquarePyramid.classList.remove("active");
  }

  // document.getElementById("set-squarePyramid").classList.remove("active");
  const setLoadedModel = document.getElementById("set-loadedModel");
  if(setLoadedModel != null) {
    setLoadedModel.classList.remove("active");
  }
  // document.getElementById("set-loadedModel").classList.remove("active");
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

function mult(verticesModel, worldMatrix){
  const result = []
  for (let i = 0; i < verticesModel.length; i += 6) {
    result.push(...multVerticesTransformMatrix(verticesModel.slice(i, i + 6), worldMatrix))
  }
  return result
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
  model =[]
  reader.onload = function () {
    fileread = JSON.parse(reader.result);
    for (let i = 0; i < fileread.length; i++) {
      model.push(new Articulated(fileread[i]["name"], fileread[i]["vertices"],fileread[i]["indices"], fileread[i]["rotationCoord"], fileread[i]["rotationAxis"], fileread[i]["rotationLimit"], fileread[i]["rotationAngle"], worldMatrix))
    }
    generateTree()
  }

  const label = document.getElementById('part-rotate-label')
  const value = document.getElementById('part-rotation-value');
  const input = document.getElementById('part-rotation');
  label.style.display = 'none';
  value.style.display = 'none';
  input.style.display = 'none';

  resetCameraView()
}

function saveModel() {
  const transformedModel = model.map((articulated, i) => {
    if (i === selectedComponent) {
      return {
        name: articulated.name,
        vertices: mult(articulated.getVertices(), transformMatrixComponent),
        indices: articulated.indices,
        rotationCoord: articulated.rotationCoord,
        rotationAxis: articulated.rotationAxis,
        rotationLimit: articulated.rotationLimit,
        rotationAngle: articulated.getRotationAngle(),
      };
    } else {
      return {
        name: articulated.name,
        vertices: mult(articulated.getVertices(), articulated.getTransformMatrix()),
        indices: articulated.indices,
        rotationCoord: articulated.rotationCoord,
        rotationAxis: articulated.rotationAxis,
        rotationLimit: articulated.rotationLimit,
        rotationAngle: articulated.getRotationAngle(),
      };
    }
  });

  const modelJSON = JSON.stringify(transformedModel);

  const blob = new Blob([modelJSON], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const downloadFile = document.createElement("a");
  downloadFile.href = url;
  downloadFile.setAttribute("download", "model.json");
  document.body.appendChild(downloadFile);
  downloadFile.click();
  document.body.removeChild(downloadFile);
}



function generateTree(){
  let inner = '<input type="radio" id="component--1" name="component" onclick="selectComponent(' + -1 + ')" style="display: none;">';
  inner += '<label for="component--1" class="radio-label"">Root</label><br>';

  for (let i = 0; i < model.length; i++) {
    inner += '<input type="radio" id="component-' + i + '" name="component" onclick="selectComponent(' + i + ')" style="display: none;">';
    inner += '<label for="component-' + i + '" class="radio-label">' + model[i].getName() + '</label><br>';
  }

  document.getElementById("component-tree").innerHTML = inner;
  document.getElementById("component--1").checked = true;
}


function selectComponent(idx) {
  const label = document.getElementById('part-rotate-label');
  const value = document.getElementById('part-rotation-value');
  const input = document.getElementById('part-rotation');

  if (selectedComponent != -1) {
    // update the current selected component
    const partRotation = document.getElementById('part-rotation');
    const rotationLimit = model[selectedComponent].getRotationLimit();

    model[selectedComponent].setTransformMatrix(transformMatrixComponent);

    label.style.display = 'inline';
    value.style.display = 'inline';
    input.style.display = 'inline';

    label.textContent = model[selectedComponent].getName() + ' Rotation:';
    partRotation.value = model[selectedComponent].getRotationAngle() * 180 / Math.PI
    console.log(partRotation.value);
    value.innerText = partRotation.value + '°';
    partRotation.min = rotationLimit[0];
    partRotation.max = rotationLimit[1];

    console.log(model[selectedComponent].getName());
    console.log(partRotation.min);
  } else {
    label.style.display = 'none';
    value.style.display = 'none';
    input.style.display = 'none';
  }

  // update the selected component after a delay of 0ms
  setTimeout(function() {
    console.log(idx);
    selectedComponent = idx;
  }, 0);
}

function changeMapping(type){
  if (type == 'bump'){
    
  } else if (type == 'reflective') {
    customMapping = false;
    reflectiveMapping = true;
    bumpMapping = false;
    setReflectiveMapping()
  } else if (type == 'custom'){
    customMapping = true;
    reflectiveMapping = false;
    bumpMapping = false;
    setCustomMapping()
  }
}

function setCustomMapping(){
  const faceInfos = [
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: '../texture/texture2.jpeg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: '../texture/texture2.jpeg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: '../texture/texture2.jpeg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: '../texture/texture2.jpeg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: '../texture/texture2.jpeg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: '../texture/texture2.jpeg',
    },
  ];

  faceInfos.forEach((faceInfo) => {
    const {target, url} = faceInfo;
  
    // Upload canvas ke cubemap
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 512;
    const height = 512;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureBuffer);
    gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
  
    // Load image
    const image = new Image();
    image.src = url;
    image.addEventListener('load', function() {
      // Upload ke texture.
      
      gl.texImage2D(target, level, internalFormat, format, type, image);
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    });

  });

  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
}

function setReflectiveMapping(){
  textureBuffer = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureBuffer);

  const faceInfos = [
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      url: '../texture/pos-x.jpg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      url: '../texture/neg-x.jpg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      url: '../texture/pos-y.jpg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      url: '../texture/neg-y.jpg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      url: '../texture/pos-z.jpg',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      url: '../texture/neg-z.jpg',
    },
  ];

  faceInfos.forEach((faceInfo) => {
    const {target, url} = faceInfo;
  
    // Upload the canvas to the cubemap face.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 512;
    const height = 512;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
  
    // setup each face so it's immediately renderable
    gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
  
    // Asynchronously load an image
    const image = new Image();
    image.src = url;
    image.addEventListener('load', function() {
      // Now that the image has loaded upload it to the texture.
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureBuffer);
      gl.texImage2D(target, level, internalFormat, format, type, image);
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    });
  });
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

  var normalLocation = gl.getAttribLocation(program, "aNormal");
  gl.enableVertexAttribArray(normalLocation);
  gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
}

function setNormals(gl) {
  var normals = new Float32Array(
    [
       0, 0, -1,
       0, 0, -1,
       0, 0, -1,
       0, 0, -1,
       0, 0, -1,
       0, 0, -1,

       0, 0, 1,
       0, 0, 1,
       0, 0, 1,
       0, 0, 1,
       0, 0, 1,
       0, 0, 1,

       0, 1, 0,
       0, 1, 0,
       0, 1, 0,
       0, 1, 0,
       0, 1, 0,
       0, 1, 0,

       0, -1, 0,
       0, -1, 0,
       0, -1, 0,
       0, -1, 0,
       0, -1, 0,
       0, -1, 0,

      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,

       1, 0, 0,
       1, 0, 0,
       1, 0, 0,
       1, 0, 0,
       1, 0, 0,
       1, 0, 0,
    ]);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}
