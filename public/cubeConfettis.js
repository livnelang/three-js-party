function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  const threeJSColor = `0x${color}`;
  return threeJSColor;
}

const generateRandomCube = (scene) => {
  const geometry = new THREE.BoxGeometry(100, 100, 100);
  const material = new THREE.MeshBasicMaterial({
    color: getRandomColor(),
    // wireframe: true,
  });
  cubeMesh = new THREE.Mesh(geometry2, material);
  return cubeMesh;
};

export const generateCubeConfettis = () => {
  const cubesMeshes = [];

  for(let i=0;i<20;i++) {
    // const randomCube = generateRandomCube();
    cubesMeshes.push(generateRandomCube());

  }

  // cube mesh
  cubeMesh = new THREE.Mesh(geometry2, material2);
};
