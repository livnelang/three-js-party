import * as THREE from "three";

export const createStarMesh = () => {
  const sphere = new THREE.SphereGeometry(1, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const starMesh = new THREE.Mesh(sphere, material);

  const [x, y, z] = new Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(1000));

  starMesh.position.set(x, y, z);

  // Add a random velocity for movement
  const velocity = new THREE.Vector3(
    THREE.MathUtils.randFloat(-0.1, 0.1),
    THREE.MathUtils.randFloat(-0.1, 0.1),
    THREE.MathUtils.randFloat(-0.1, 0.1)
  );

  starMesh.userData.velocity = velocity;

  return starMesh;
};

export default class StarWorld {
  constructor(scene) {
    this.scene = scene;
    this.initStars();
  }

  stars = [];

  initStars = () => {
    Array(200)
      .fill()
      .forEach(() => {
        const star = createStarMesh();
        this.stars.push(star);
      });
    this.scene.add(...this.stars);
  };

  animateStars = () => {
    this.stars.forEach((star) => {
      const { velocity } = star.userData;
      star.position.add(velocity);
  
      // Check if the star has moved too far, and reset its position
      if (
        Math.abs(star.position.x) > 1000 ||
        Math.abs(star.position.y) > 1000 ||
        Math.abs(star.position.z) > 1000
      ) {
        star.position.set(
          THREE.MathUtils.randFloatSpread(1000),
          THREE.MathUtils.randFloatSpread(1000),
          THREE.MathUtils.randFloatSpread(1000)
        );
      }
    });
  };
}
