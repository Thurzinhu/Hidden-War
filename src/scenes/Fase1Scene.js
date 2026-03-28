import { Scene } from "phaser";
import { Player } from "../gameobjects/Player";

export class Fase1Scene extends Scene {
    controls = null;
    player = null;
    cursors = null;

    constructor() {
        super("Fase1Scene");
    }

    create() {
        // 1. Carrega o mapa da Floresta
        const map = this.make.tilemap({ key: 'mapaFloresta' });
        const tileset = map.addTilesetImage(map.tilesets[0].name, 'tilesFase1');

        this.player = new Player({ scene: this });
        this.player.setDepth(10);
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

        // --- O PORTAL PARA A FASE 2 ---
        // O teu mapa tem 1856x1024 de tamanho. O centro é perto de 900x500.
        const portalX = 900; // Mantém no meio na horizontal
        const portalY = 850; // Aumentamos o Y para ele descer para a areia
        
        // Cria a zona de colisão
        const portal = this.add.zone(portalX, portalY, 120, 120);
        this.physics.add.existing(portal);

        // Retângulo amarelo para você ver onde está o portal
        this.add.rectangle(portalX, portalY, 120, 120, 0xffff00, 0.4).setDepth(50);

        // A MÁGICA: Quando o jogador pisar no portal, muda de cena!
        this.physics.add.overlap(this.player, portal, () => {
            this.scene.start("Fase2Scene");
        });
    }

    update(time, delta) {
        this.player.update(this.cursors);
    }
}