import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BaseAnimation } from "./meshUtils/baseAnimation";
import StarWorld from "./meshUtils/starWorld";
import GuiManager from "./guiUtils/guiManager";
import LightsManager from "./meshUtils/lightsManager";
import { Font } from 'three/addons/loaders/FontLoader.js';

import { TTFLoader } from "three/addons/loaders/TTFLoader.js";
// import { FontLoader } from "three/addons/loaders/ttf.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

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
const guiManager = new GuiManager(handleAnimationSpeed, handleOnSongPausePlay);

let animations = {};
let starWorld;
let lightsManager;
let songTitleMesh, meshSongText;
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
  camera.position.set(-250, 300, 500);

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
  lightsManager = new LightsManager(scene);

  // createSongTitleText();

  window.addEventListener("resize", onWindowResize);

  await loadCharacter();
  await loadOtherCharacters();

  // charactersManager = new CharactersManager(scene, guiManager);
  starWorld = new StarWorld(scene);

  loadAnimations();

  animate();
}

function createSongTitleText(isPlaying, toggledSongText) {
  if (meshSongText && meshSongText !== toggledSongText) {
    scene.remove(songTitleMesh);
  }

  if (meshSongText === toggledSongText) {
    songTitleMesh.visible = isPlaying;
    return;
  }

  meshSongText = toggledSongText;
  const fontLoader = new TTFLoader();
  fontLoader.load(
    "../src/assets/fonts/lobster-regular.ttf",
    (fontJson) => {
      const textMaterial = new THREE.MeshBasicMaterial();

      const textGeometry = new TextGeometry(meshSongText, {
        // font: font,
        font: new Font( fontJson ),
        size: 50,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        beveloffset: 0,
        bevelSegments: 1,

        color: 0xffffff,
        roughness: 0.7,  // Adjust the roughness for a less shiny appearance
        metalness: 0.5,  // Adjust the metalness for a more metallic appearance
      });

      songTitleMesh = new THREE.Mesh(textGeometry, textMaterial);
      songTitleMesh.position.set(-200, 300, -200);
      songTitleMesh.visible = true;
      scene.add(songTitleMesh);
    }
  );
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
      character.characterModel.position.set(-200, 0, -100);
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

function handleOnSongPausePlay(isPlaying, toggledSongText) {
  createSongTitleText(isPlaying, toggledSongText);
  songTitleMesh.visible = isPlaying;
}

function loadAnimations() {
  // const animationPathMap = {
  //   name: "Hip Hop",
  //   path: hip_hop_dance_wo_skin.fbx,
  // };
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
