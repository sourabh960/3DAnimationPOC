import * as THREE from './libs/three.module.js';
import { GLTFLoader } from './libs/GLTFLoader.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { RGBELoader } from './libs/RGBELoader.js'
import { EXRLoader } from './libs/EXRLoader.js';





// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020); // Default background


// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(30, 30, 30);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 5.5;   // try values between 1.0 and 2.0
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// ✅ Grid Wrapper (for rotation)
const gridParent = new THREE.Object3D();
scene.add(gridParent);

// ✅ Grid Floor
let grid = new THREE.GridHelper(40, 40, 0xffffff, 0x888888);
//grid.rotation.x = Math.PI / 2;
gridParent.add(grid);

//cache hdri
const envCache = {};
new EXRLoader().load('./textures/indoor.exr', (tex) => envCache['studio'] = tex);
new EXRLoader().load('./textures/outdoor.exr', (tex) => envCache['outdoor'] = tex);

//apply HDRI
const hdris = {
  studio: "./textures/indoor.exr",
  outdoor: "./textures/outdoor.exr",
  
};


function applyHDRI(name) {
  const path = hdris[name];
  if (!envCache[name]) return;

//   new RGBELoader()
//     .setDataType(THREE.UnsignedByteType)
//     .load("./textures/events_hall_interior_4k.hdr", (texture) => {
//       texture.mapping = THREE.EquirectangularReflectionMapping;

//       // ✅ Use HDRI as both background and environment
//       scene.background = texture;
//       scene.environment = texture; // gives realistic reflections
//     });

  const texture = envCache[name];
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  };



// ✅ Room-like Background (CubeTexture)
const roomTexture = new THREE.CubeTextureLoader().load([
  "https://threejs.org/examples/textures/cube/Bridge2/posx.jpg",
  "https://threejs.org/examples/textures/cube/Bridge2/negx.jpg",
  "https://threejs.org/examples/textures/cube/Bridge2/posy.jpg",
  "https://threejs.org/examples/textures/cube/Bridge2/negy.jpg",
  "https://threejs.org/examples/textures/cube/Bridge2/posz.jpg",
  "https://threejs.org/examples/textures/cube/Bridge2/negz.jpg",
]);

let roomEnabled = false;

// ✅ Theme Presets
const themes = {
  studio: {
    background: 0x202020,
    ambientIntensity: 0.5,
    gridColor: [0xffffff, 0x888888]
  },
  night: {
    background: 0x000022,
    ambientIntensity: 0.2,
    gridColor: [0x4444ff, 0x222288]
  },
  showroom: {
    background: 0xf0f0f0,
    ambientIntensity: 0.8,
    gridColor: [0x000000, 0x666666]
  }
};

// ✅ Apply Theme
function applyTheme(name) {
  const theme = themes[name];
  if (!theme) return;

  if (!roomEnabled) {
    scene.background = new THREE.Color(theme.background);
  }

  ambient.intensity = theme.ambientIntensity;

  gridParent.remove(grid);
  grid = new THREE.GridHelper(40, 40, theme.gridColor[0], theme.gridColor[1]);
  grid.rotation.x = Math.PI / 2;
  gridParent.add(grid);
}

// ✅ UI Listeners
document.getElementById("bgColor").addEventListener("input", (e) => {
  roomEnabled = false;
  scene.background = new THREE.Color(e.target.value);
});

document.getElementById("themeSelect").addEventListener("change", (e) => {
  //applyTheme(e.target.value);
  applyHDRI(e.target.value);
});

// Default HDRI
//applyHDRI("studio");

document.getElementById("envBtn").addEventListener("click", () => {
  roomEnabled = !roomEnabled;
  scene.background = roomEnabled ? roomTexture : new THREE.Color(document.getElementById("bgColor").value);
});

// Initial Theme
//applyTheme("studio");

// Animate
function animate() {
  requestAnimationFrame(animate);
    gridParent.rotation.y += 0.001; // horizontal rotation
  gridParent.rotation.x += 0.001; // vertical tilt
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
