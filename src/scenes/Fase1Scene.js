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
        this.player.setPosition(256, 320);
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
        const portalX = 900; 
        const portalY = 850; 
        
        // Zona de colisão
        const portal = this.add.zone(portalX, portalY, 120, 120);
        this.physics.add.existing(portal);

        // Retângulo amarelo
        this.add.rectangle(portalX, portalY, 120, 120, 0xffff00, 0.4).setDepth(50);

        this.physics.add.overlap(this.player, portal, () => {
            if (this.portalActivated) return;
            this.portalActivated = true;
            this.scene.start("Fase2Scene");
        });

        this.events.on('startBattle', (playerData) => {
        
        // Efeito visual de transição para a batalha
        this.cameras.main.flash(300, 255, 255, 255); 
        
        this.time.delayedCall(300, () => {
            // Pausa TUDO na cena atual (física, animações, etc)
            this.scene.pause(); 
            
            // Sobrepõe a cena de batalha
            this.scene.launch('BattleScene', { 
                    mapLevel: 1,
                    playerHp: playerData.hp,
                    playerMaxHp: playerData.maxHp
                }); 
        });
    });

    // Escuta o evento disparado pela BattleScene quando o jogador ganha
        this.events.on('resumeExploration', (batalhaData) => {
            // Salva a vida resultante no objeto do jogador
            this.player.hp = batalhaData.newHp;
            
            this.player.resumeExploration();
            console.log(`Exploração retomada. HP atual: ${this.player.hp}`);
        });
    }

    update(time, delta) {
        this.player.update(this.cursors);
    }
    
}