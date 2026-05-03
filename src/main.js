import { Game } from "phaser";
import { Preloader } from "./preloader";
import { GameOverScene } from "./scenes/GameOverScene";
import { HudScene } from "./scenes/HudScene";
// Importa as duas novas fases:
import { Fase1Scene } from "./scenes/Fase1Scene";
import { Fase2Scene } from "./scenes/Fase2Scene";
import { MenuScene } from "./scenes/MenuScene";
import { SplashScene } from "./scenes/SplashScene";
//Cena de batalha
import BattleScene from './scenes/BattleScene.js';

const config = {
    type: Phaser.AUTO,
    parent: "phaser-container",
    width: 1280,
    height: 720,
    backgroundColor: "#1c172e",
    pixelArt: true,
    roundPixel: false,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        max: { width: 1420, height: 800 }
    },
    physics: {
        default: "arcade",
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [
        Preloader,
        SplashScene,
        // Coloca as fases aqui
        Fase1Scene,
        Fase2Scene,
        MenuScene,
        HudScene,
        GameOverScene,
        BattleScene
    ]
};

new Game(config);