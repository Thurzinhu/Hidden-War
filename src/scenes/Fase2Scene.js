import { Scene } from "phaser";
import { Player } from "../gameobjects/Player";

export class Fase2Scene extends Scene {
    controls = null;
    player = null;
    cursors = null;

    constructor() {
        super("Fase2Scene");
    }

    create() {
        // 1. Carrega o teu mapa dos Ossos
        const map = this.make.tilemap({ key: 'mapaOssos' });
        const tileset = map.addTilesetImage(map.tilesets[0].name, 'tilesFase2');

        this.player = new Player({ scene: this });
        this.player.setDepth(10);
        this.player.setPosition(701, 634);
        this.player.body.setSize(30, 20); 
        this.player.body.setOffset(80, 90); 

        for (const layer of map.layers) {
            const layerObj = map.createLayer(layer.name, tileset);
            const hasCollider = layer.properties?.some(p => p.name === 'collider' && p.value === true);

            if (hasCollider) {
                layerObj.setCollisionByExclusion([-1]);
                this.physics.add.collider(this.player, layerObj);
            }
        }  

        const camera = this.cameras.main;
        camera.startFollow(this.player);
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();

        // A tua neblina
        this.add.rectangle(0, 0, map.widthInPixels, map.heightInPixels, 0xbababa, 0.2)
            .setOrigin(0, 0)
            .setDepth(100); 
            this.input.on('pointerdown', (pointer) => {
        const worldX = pointer.worldX;
        const worldY = pointer.worldY;
        console.log(`Nascer aqui: this.player.setPosition(${Math.round(worldX)}, ${Math.round(worldY)});`);
        });
    }

    update(time, delta) {
        this.player.update(this.cursors);
    }
    
}