import { GUI } from "dat.gui";
import musicSong from "../assets/audio/macarena.mp3";

export default class GuiManager {
  constructor(handleAnimationSpeed) {
    this.gui = new GUI();
    this.song = new Audio(musicSong);
    this.handleAnimationSpeed = handleAnimationSpeed;

    this.guiOptions = {
      music: false,
      "animation speed": 1.1,
    };
    this.animationsFolder = this.gui.addFolder("Animations");

    this.gui.add(this.guiOptions, "music").onChange((e) => {
      if (e) {
        this.song.play();
      } else {
        this.song.pause();
      }
    });

    this.gui.add(this.guiOptions, "animation speed", 0.5, 2, 0.001).onChange(() => {
      this.handleAnimationSpeed();
    });
    this.animationsFolder.open();
  }

  addAnimation = (target, path) => {
    this.animationsFolder.add(target, path);
  };
}
