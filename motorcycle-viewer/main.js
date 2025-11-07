import * as THREE from './libs/three.module.js';
import { GLTFLoader } from './libs/GLTFLoader.js';
import { OrbitControls } from './libs/OrbitControls.js';

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(2, 1.5, 4);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.body.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(5, 5, 5);
scene.add(light);

// Controls
 const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Load Model
const loader = new GLTFLoader();
let motorcycle;

loader.load(
  "./models/motorcycle.glb",
  (gltf) => {
    motorcycle = gltf.scene;
    motorcycle.scale.set(5,5,5);
    motorcycle.position.set(0, 2, 5);
    scene.add(motorcycle);
  },
  undefined,
  (err) => console.error("Model load error:", err)
);


const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0xdddddd })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

scene.background = new THREE.Color(0xf0f0f0); // light gray showroom feel

const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

const spotLight = new THREE.SpotLight(0xffffff, 1.2);
spotLight.position.set(5, 10, 5);
spotLight.castShadow = true;
scene.add(spotLight);


// // Animation Loop
function animate() {
  requestAnimationFrame(animate);
  if (motorcycle) motorcycle.rotation.y += 0.005;
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
