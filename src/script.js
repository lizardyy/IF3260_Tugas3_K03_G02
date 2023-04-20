
var worldMatrix
var matWorldLocation
var matViewLocation
var matProjLocation
var lightDirectionLocation
var shadingLocation
var textureLocation
var worldCameraLocation
var timeLocation
var resolutionLocation
var normalLocation
var bumpScaleLocation
var viewMatrix
var projMatrix
var mIdentity
var transformMatrixComponent
var textureBuffer
var normalBuffer

var rotAngle = [0,0,0,0]
var translation = [0,0,0];
var scale = [1, 1, 1];
var camAngle = 0;
var camRadius = 5;
var animation = false;
var number = 0;
var shading = true;
var customMapping = false;
var reflectiveMapping = false;
var bumpMapping = false;
var selectedComponent = -1;
var lightDirection = [1, 1, 1];

var state = {
  rotAngle :[0, 0, 0,0],
  translation :[0, 0, 0],
  scale :[1, 1, 1],
  camAngle :0,
  camRadius :5,
  animation :false,
  number :0,
  shading :true,
  customMapping :false,
  reflectiveMapping :false,
  bumpMapping :false,
  lightDirection :[1, 1, 1],

}

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

function changeState(state) {
  rotAngle = state.rotAngle;
  translation = state.translation;
  scale = state.scale;
  camAngle = state.camAngle;
  camRadius = state.camRadius;
  color = state.color;
  animation = state.animation;
  number = state.number;
  lightDirection = state.lightDirection;

  inputs[0].input.value = rotAngle[0];
  inputs[1].input.value= rotAngle[1];
  inputs[2].input.value= rotAngle[2];
  inputs[3].input.value= rotAngle[3];
  inputs[4].input.value= scale[0];
  inputs[5].input.value= scale[1];
  inputs[6].input.value= scale[2];
  inputs[7].input.value= translation[0];
  inputs[8].input.value= translation[1];
  inputs[9].input.value= translation[2];
  inputs[10].input.value= camAngle;
  inputs[11].input.value= camRadius;
  inputs[12].input.value= lightDirection[0];
  inputs[13].input.value= lightDirection[1];
  inputs[14].input.value= lightDirection[2];

  inputs.forEach(({input, value, unit}) => {
    value.innerText = input.value + unit;
  });
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
  gl.getExtension("OES_standard_derivatives");

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
  timeLocation = gl.getUniformLocation(program, 'time');
  resolutionLocation = gl.getUniformLocation(program, 'resolution');
  bumpScaleLocation = gl.getUniformLocation(program, 'uBumpScale');

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

var previousTime = 0;

/* Render */
function render(currentTime) {
  const deltaTime = (currentTime - previousTime) / 1000;
  previousTIMe = currentTime;
  mIdentity = new Float32Array(16);
  identity(mIdentity);
  var loop = () => {
    if (animation){
      rotAngle[0] += (1/1800 * Math.PI);
      rotAngle[1] += (1/1800 * Math.PI);
      rotAngle[2] += (1/1800 * Math.PI);
    } 
    if(selectedComponent == -1){
      worldMatrix = transformMatrix.projection(2, 2, 2)
      worldMatrix = transformMatrix.translate(worldMatrix, translation[0], translation[1], translation[2]);
      worldMatrix = transformMatrix.xRotate(worldMatrix, rotAngle[0]);
      worldMatrix = transformMatrix.yRotate(worldMatrix, rotAngle[1]);
      worldMatrix = transformMatrix.zRotate(worldMatrix, rotAngle[2]);
      worldMatrix = transformMatrix.scale(worldMatrix, scale[0], scale[1], scale[2]);

    }
   
    
    let children = [];
    if (selectedComponent != -1){
      transformMatrixComponent = model[selectedComponent].getTransformMatrix()
      children = model[selectedComponent].getChildren();

      const rotationCoord = model[selectedComponent].getRotationCoord();
      let xAxis = rotationCoord[0];
      let yAxis = rotationCoord[1];
      let zAxis = rotationCoord[2];
      transformMatrixComponent = transformMatrix.translate(transformMatrixComponent, xAxis, yAxis, zAxis);
      if (model[selectedComponent].getRotationAxis() == "x")  transformMatrixComponent = transformMatrix.xRotate(transformMatrixComponent, model[selectedComponent].getRotationAngle());
      else if (model[selectedComponent].getRotationAxis() == "y")transformMatrixComponent = transformMatrix.yRotate(transformMatrixComponent, model[selectedComponent].getRotationAngle());
      else if (model[selectedComponent].getRotationAxis() == "z")transformMatrixComponent = transformMatrix.zRotate(transformMatrixComponent, model[selectedComponent].getRotationAngle());
      transformMatrixComponent = transformMatrix.translate(transformMatrixComponent, translation[0], translation[1], translation[2]);
      transformMatrixComponent = transformMatrix.xRotate(transformMatrixComponent, rotAngle[0]);
      transformMatrixComponent = transformMatrix.yRotate(transformMatrixComponent, rotAngle[1]);
      transformMatrixComponent = transformMatrix.zRotate(transformMatrixComponent, rotAngle[2]);
      transformMatrixComponent = transformMatrix.scale(transformMatrixComponent, scale[0], scale[1], scale[2]);
      transformMatrixComponent = transformMatrix.translate(transformMatrixComponent, -xAxis, -yAxis, -zAxis);
    }
    if (selectedComponent == -1) {
      gl.uniformMatrix4fv(matWorldLocation, gl.FALSE, worldMatrix);
    }
    else {

    }
    gl.uniformMatrix4fv(matViewLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjLocation, gl.FALSE, projMatrix);
    gl.uniform1i(shadingLocation, shading);
    gl.uniform1i(customMappingLocation, customMapping);
    gl.uniform1i(reflectiveMappingLocation, reflectiveMapping);
    gl.uniform1i(bumpMappingLocation, bumpMapping);
    gl.uniform3fv(lightDirectionLocation, lightDirection);
    gl.uniform1f(timeLocation, currentTime);
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(bumpScaleLocation, 100);

    gl.clearColor(0.125, 0.125, 0.118, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let j = 0;
    for (let i=0;i <model.length;i++){
      if (selectedComponent ==-1){

      }
      else if (i == selectedComponent || model[selectedComponent].children.indexOf(i)!=-1){
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mult(model[i].getVertices(), transformMatrixComponent)), gl.STATIC_DRAW);
      } 
      else {  
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

function shaderModel(){
  if (!shading){
    customMapping = false;
    reflectiveMapping = false;
    bumpMapping = false;
    model[selectedComponent].state.shading = false;
  } else {
    model[selectedComponent].state.shading = true;
  }
}

function changeShading(e) {
  shading = document.querySelector("#shading").checked;
  shaderModel();
}

document.getElementById("shading").addEventListener('change', changeShading, false);

function changeAnimation(e) {
  animation = document.querySelector("#animation").checked;
  if (animation) {
    model[selectedComponent].state.animation = true;
  }
}

document.getElementById("animation").addEventListener('change', changeAnimation, false);

function rotateModel(id, angle) {
  stopAnimation()
  if (id != 3){
    rotAngle[id] = toRadian(angle)
    model[selectedComponent].state.rotAngle[id] = toRadian(angle)
  } else {
    model[selectedComponent].setRotationAngle(toRadian(angle))
  }
}

function translateModel(id, value) {
  // stopAnimation()
  translation[id] = value
  model[selectedComponent].state.translation[id] = value
}

function changeLightDirection(id, value) {
  lightDirection[id] = Number(value);
  model[selectedComponent].state.lightDirection[id] = Number(value);
}

function scaleModel(id, value){
  // stopAnimation()
  scale[id] = value
  model[selectedComponent].state.scale[id] = value
}

function changeAngle(value){
  stopAnimation()
  camAngle = toRadian(value)
  model[selectedComponent].state.camAngle = toRadian(value)
  changeCameraPosition()
}

function changeRadius(value){
  stopAnimation()
  camRadius = value
  model[selectedComponent].state.camRadius = value
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
  shaderModel()
  changeProjection('perspective')
  
  // reset value of slider
  inputs.forEach(function(item){
    item.input.value = item.input.defaultValue;
    item.value.innerText = item.input.defaultValue + item.unit;
  })

  // reset value of all button
  document.getElementById("shading").checked = true;
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
      model.push(new Articulated(fileread[i]["name"], fileread[i]["vertices"],fileread[i]["indices"], fileread[i]["children"], fileread[i]["rotationCoord"], fileread[i]["rotationAxis"], fileread[i]["rotationLimit"], fileread[i]["rotationAngle"], worldMatrix, state))
    }
    generateTree()
    const label = document.getElementById('part-rotate-label')
    const value = document.getElementById('part-rotation-value');
    const input = document.getElementById('part-rotation');
    label.style.display = 'none';
    value.style.display = 'none';
    input.style.display = 'none';
    selectedComponent = 0;
    resetCameraView()
  }
}

function saveModel() {
  const transformedModel = model.map((articulated, i) => {
    if (i === selectedComponent) {
      return {
        name: articulated.name,
        vertices: mult(articulated.getVertices(), transformMatrixComponent),
        indices: articulated.indices,
        children: articulated.children,
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
        children: articulated.children,
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




tree = [];
innercomponent = ''
function generateTree() {
  innercomponent = ''
  for (let i = 0; i < model.length; i++) {
    tree.push(i)
  }

  while (tree.length != 0) {
    generateComponentTree(0, 0)
  }
  document.getElementById("component-tree").innerHTML = innercomponent;
  document.getElementById("component-0").checked = true;
}

function generateComponentTree(idx, space) {
  for (let i = 0; i < space; i++) {
    innercomponent += '&nbsp;'
  }

  innercomponent += '<input type="radio" id="component-' + idx + '" name="component" onclick="selectComponent(' + idx + ')" style="display: none;">';
  for (let i = 0; i < space; i++) {
    innercomponent += '&nbsp;'
  }
  innercomponent += '<label for="component-' + idx + '" class="radio-label">' + model[idx].getName() + '</label><br>';

  tree.splice(tree.indexOf(idx), 1)

  for (let i = 0; i < model[idx].children.length; i++) {
    generateComponentTree(model[idx].children[i], space + 1)
  }
}


function selectComponent(idx) {
  const label = document.getElementById('part-rotate-label');
  const value = document.getElementById('part-rotation-value');
  const input = document.getElementById('part-rotation');

  model[selectedComponent].vertices = mult(model[selectedComponent].getVertices(), transformMatrixComponent)
  for (i = 0; i < model[selectedComponent].children.length; i++){
    model[model[selectedComponent].children[i]].vertices = mult(model[model[selectedComponent].children[i]].getVertices(), transformMatrixComponent)
  }
  if (selectedComponent != -1) {
    // update the current selected component
    const partRotation = document.getElementById('part-rotation');
    const rotationLimit = model[idx].getRotationLimit();

    // model[idx].setTransformMatrix(transformMatrixComponent);

    label.style.display = 'inline';
    value.style.display = 'inline';
    input.style.display = 'inline';

    label.textContent = model[idx].getName() + ' Rotation:';
    partRotation.value = model[idx].getRotationAngle() * 180 / Math.PI
    value.innerText = partRotation.value + '°';
    partRotation.min = rotationLimit[0];
    partRotation.max = rotationLimit[1];
    selectedComponent = idx;
    changeState(model[idx].state); 

  } else {
    label.style.display = 'none';
    value.style.display = 'none';
    input.style.display = 'none';
  }
}

function changeMapping(type){
  if (type == 'bump'){
    customMapping = false;
    reflectiveMapping = false;
    bumpMapping = true;
    setBumpMapping()
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

function setBumpMapping(){
  const faceInfos = [
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: '../texture/bump_normal.png',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: '../texture/bump_normal.png',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: '../texture/bump_normal.png',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: '../texture/bump_normal.png',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: '../texture/bump_normal.png',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: '../texture/bump_normal.png',
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
  gl.vertexAttribPointer(normalLocation, 1, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
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
