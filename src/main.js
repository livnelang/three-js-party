import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BaseAnimation } from "./meshUtils/baseAnimation";
import StarWorld from "./meshUtils/starWorld";
import GuiManager from "./guiUtils/guiManager";

// const sizes = {
//   width: 800,
//   height: 600,
// };

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const loader = new FBXLoader();
const clock = new THREE.Clock();
const DEFAULT_POSE_PATH = "sporty_granny.fbx";
let renderer, scene, camera;
const guiManager = new GuiManager(handleAnimationSpeed);

let animations = {};
let starWorld;
let sphereMesh, cubeMesh;
let characters = [];

init();

async function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);

  scene = new THREE.Scene();
  // scene.background = new THREE.Color(0xa0a0a0);
  // scene.background = new THREE.Color(0x24caff);
  scene.fog = new THREE.Fog(0xa0a0a0, 500, 1000);
  // scene.add(new THREE.AxesHelper(500));

  camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
  camera.position.set(0, 240, 500);

  // controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  renderer.setSize(sizes.width, sizes.height);
  document.body.appendChild(renderer.domElement);

  // change text header
  // const elem = document.getElementById("currently-playing").innerHTML ='fdf'.inner

  // sphere mesh
  const geometry = new THREE.SphereGeometry(100, 10, 10);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
  });

  sphereMesh = new THREE.Mesh(geometry, material);
  sphereMesh.position.set(-500, 200, -100);
  scene.add(sphereMesh);

  // cube mesh
  const geometry2 = new THREE.BoxGeometry(100, 100, 100);
  const material2 = new THREE.MeshBasicMaterial({
    color: 0xff9843,
    wireframe: true,
  });
  cubeMesh = new THREE.Mesh(geometry2, material2);
  cubeMesh.position.set(200, 100, 200);

  scene.add(cubeMesh);

  // ground
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  // scene.add(mesh);

  // grid
  const grid = new THREE.GridHelper(2000, 20, 0xffffff, 0xffffff);
  grid.material.opacity = 0.5;
  grid.material.transparent = true;
  scene.add(grid);

  // lights

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 5);
  hemiLight.position.set(0, 200, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 5);
  dirLight.position.set(0, 200, 100);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 180;
  dirLight.shadow.camera.bottom = -100;
  dirLight.shadow.camera.left = -120;
  dirLight.shadow.camera.right = 120;
  scene.add(dirLight);

  window.addEventListener("resize", onWindowResize);

  await loadCharacter();
  await loadOtherCharacters();
  starWorld = new StarWorld(scene);

  loadAnimations();

  animate();
}

async function loadCharacter() {
  const character = new BaseAnimation(DEFAULT_POSE_PATH);
  await character.loadAnimation();
  characters.push(character);
  scene.add(character.characterModel);

  return;
}

async function loadOtherCharacters() {
  const corePaths = ["big_vegas.fbx", "ty.fbx"];
  for (const [idx, path] of Object.entries(corePaths)) {
    await loadPromiseCharacter(path, idx);
  }

  const defualtAnimationPath = "default";
  animations[defualtAnimationPath] = () => {
    invokeAnimations(defualtAnimationPath);
  };
  guiManager.addAnimation(animations, defualtAnimationPath);
}

async function loadPromiseCharacter(path, idx) {
  return new Promise(async (res, rej) => {
    const character = new BaseAnimation(path);
    await character.loadAnimation();
    characters.push(character);
    if (idx == 0) {
      character.characterModel.position.set(-100, 0, -100);
    } else {
      character.characterModel.position.set(200, 0, -100);
    }
    scene.add(character.characterModel);
    res();
    // },
    // undefined,
    // function (error) {
    //   console.error(error);
    //   rej();
    // }
    // );
  });
}

function invokeAnimations(path) {
  characters.forEach((c, idx) => {
    c.invokeAnimation(path);
  });
}

function handleAnimationSpeed() {
  characters.forEach((c, idx) => {
    c.changeAnimationSpeen(guiManager.guiOptions["animation speed"]);
  });
}

function loadAnimations() {
  const animationsPaths = ["hip_hop_dance_wo_skin.fbx"];

  animationsPaths.forEach((path) => {
    loader.load(
      path,
      function (fbx) {
        characters.forEach((c) => {
          c.mixer = new THREE.AnimationMixer(c.characterModel);
          const animationAction = c.mixer.clipAction(fbx.animations[0]);
          c.animationActions[path] = animationAction;
        });

        animations[path] = () => {
          invokeAnimations(path);
        };
        guiManager.addAnimation(animations, path);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  characters.forEach((c) => {
    if (c.mixer) {
      c.mixer.update(delta);
    }
  });

  sphereMesh.rotation.y += 0.03;

  cubeMesh.rotation.x += 0.02;
  cubeMesh.rotation.y += 0.02;

  // Update star positions
  starWorld.animateStars();

  renderer.render(scene, camera);
}
