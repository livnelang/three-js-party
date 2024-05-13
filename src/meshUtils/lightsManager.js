import * as THREE from "three";

export default class LightsManager {
    constructor(scene) {
        this.scene = scene;
        this.initiateLights();
    }

    initiateLights = () => {
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 5);
        hemiLight.position.set(0, 200, 0);
        this.scene.add(hemiLight);
      
        const dirLight = new THREE.DirectionalLight(0xffffff, 5);
        dirLight.position.set(0, 200, 100);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 180;
        dirLight.shadow.camera.bottom = -100;
        dirLight.shadow.camera.left = -120;
        dirLight.shadow.camera.right = 120;
        this.scene.add(dirLight);
    }
}