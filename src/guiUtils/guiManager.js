import { GUI } from "dat.gui";
import Macarena from "../assets/audio/macarena.mp3";
import GiveMeTheNight from "../assets/audio/give_me_the_night.mp3";

const songsMap = {
  "Macarena": Macarena,
  "Give Me The Night": GiveMeTheNight,
};

export default class GuiManager {
  constructor(handleAnimationSpeed, handleOnSongPause) {
    this.gui = new GUI();
    this.song = new Audio(songsMap["Give Me The Night"]);
    this.songTitle = Object.keys(songsMap).at(1);
    this.handleAnimationSpeed = handleAnimationSpeed;

    this.guiOptions = {
      music: false,
      "animation speed": 1.1,
    };
    this.animationsFolder = this.gui.addFolder("Animations");

    this.gui.add(this.guiOptions, "music").onChange((e) => {
      if (e) {
        this.song.play();
        handleOnSongPause(true, this.songTitle);
      } else {
        this.song.pause();
        handleOnSongPause(false, this.songTitle);
      }
    });

    this.gui
      .add(this.guiOptions, "animation speed", 0.5, 2, 0.001)
      .onChange(() => {
        this.handleAnimationSpeed();
      });
    this.animationsFolder.open();
  }

  addAnimation = (target, path) => {
    this.animationsFolder.add(target, path);
  };
}
