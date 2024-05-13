import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

export class BaseAnimation {
  constructor(path) {
    this.path = path;
    this.characterModel = null;
    this.mixer = null;
    this.activeAction = null;
    this.animationActions = [];
  }

  changeAnimationSpeen = (speedScale) => {
    if (this.activeAction) {
      this.activeAction.timeScale = speedScale ?? 1;
    }
  };

  invokeAnimation = (animationName) => {
    if (this.activeAction) {
      this.activeAction.stop();
    }

    const animationAction = this.animationActions[animationName];

    animationAction.play();
    this.activeAction = animationAction;
  };

  loadAnimation = async () => {
    // const basePath = __dirname
    return new Promise((res, rej) => {
      const that = this;
      const loader = new FBXLoader();
      loader.load(
       this.path,
        function (characterModel) {
          that.characterModel = characterModel;
          that.mixer = new THREE.AnimationMixer(characterModel);
          const animationAction = that.mixer.clipAction(
            characterModel.animations[0]
          );

          that.animationActions["default"] = animationAction;

          characterModel.traverse(function (child) {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          res();
        },
        undefined,
        function (error) {
          console.error(error);
          rej(error);
        }
      );
    });
  };
}
