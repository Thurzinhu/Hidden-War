import { Scene } from "phaser";
import { Player } from "../gameobjects/Player";
import { BlueEnemy } from "../gameobjects/BlueEnemy";

export class MainScene extends Scene {
    controls = null;

    constructor() {
        super("MainScene");
    }

    init() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.scene.launch("MenuScene");
    }

    create() {
        
        const forest = this.make.tilemap({ key: 'forest' });
        const tileset = forest.addTilesetImage('spritefusion', 'spritesheet')

        forest.createLayer('Background', tileset);
        forest.createLayer('Sand', tileset);
        forest.createLayer('Cliff', tileset);
        forest.createLayer('Rocks', tileset);
        forest.createLayer('Grass', tileset);
        forest.createLayer('Bridge - vertical', tileset);
        forest.createLayer('Bridge - horizontal', tileset);
        forest.createLayer('Stairs', tileset);
        forest.createLayer('Shadows', tileset);
        forest.createLayer('Small rocks', tileset);
        forest.createLayer('Trees back', tileset);
        forest.createLayer('Buildings', tileset);
        forest.createLayer('Trees front', tileset);
        forest.createLayer('Miscs', tileset);


        // Phaser supports multiple cameras, but you can access the default camera like this:
        const camera = this.cameras.main;

        // Set up the arrows to control the camera
        const cursors = this.input.keyboard.createCursorKeys();
        this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
            camera: camera,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            speed: 0.5
        });

        // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
        camera.setBounds(0, 0, forest.widthInPixels, forest.heightInPixels);

    }

    update(time, delta) {
        this.controls.update(delta);
    }
}