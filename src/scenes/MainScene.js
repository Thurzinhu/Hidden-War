import { Scene } from "phaser";
import { Player } from "../gameobjects/Player";

export class MainScene extends Scene {
    controls = null;
    player = null;
    cursors = null;

    constructor() {
        super("MainScene");
    }

    init() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.scene.launch("MenuScene");
    }

    create() {
        
        const forest = this.make.tilemap({ key: 'forest' });
        const tileset = forest.addTilesetImage('spritefusion', 'spritesheet');

        for (const layer of forest.layers) {
            const layerObj = forest.createLayer(layer.name, tileset);
            const hasCollider = layer.properties?.some(
                p => p.name === 'collider' && p.value === true
            );

            if (hasCollider) {
                layerObj.setCollisionByExclusion([-1]);
            }
            const debugGraphics = this.add.graphics().setAlpha(0.75);
            layerObj.renderDebug(debugGraphics, {
                tileColor: null,
                collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
                faceColor: new Phaser.Display.Color(40, 39, 37, 255)
            });
        }  
        

        //   const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
        this.player = new Player({ scene: this });

        const camera = this.cameras.main;
        camera.startFollow(this.player);
        camera.setBounds(0, 0, forest.widthInPixels, forest.heightInPixels);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.physics.world.createDebugGraphic();

    }

    update(time, delta) {
        this.player.update(this.cursors);
    }
}