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

        this.player = new Player({ scene: this, type: 'warrior' });
        //   const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
        this.player.setDepth(10);
        this.player.setPosition(25*64, 18*64);

        for (const layer of map.layers) {
            const layerObj = map.createLayer(layer.name, tileset);
            const hasCollider = layer.properties?.some(p => p.name === 'collider' && p.value === true);

            if (hasCollider) {
                layerObj.setCollisionByExclusion([-1]);
                this.physics.add.collider(this.player, layerObj);
            }
            const debugGraphics = this.add.graphics().setAlpha(0.75).setDepth(999);
            layerObj.renderDebug(debugGraphics, {
                tileColor: null,
                collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
                faceColor: new Phaser.Display.Color(40, 39, 37, 255)
            });
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

        this.physics.world.createDebugGraphic();

        this.events.on('startBattle', (playerData) => {
            
            // Efeito visual de transição para a batalha
            this.cameras.main.flash(300, 255, 255, 255); 
            
            this.time.delayedCall(300, () => {
                // Pausa TUDO na cena atual (física, animações, etc)
                this.scene.pause(); 
                
                // Sobrepõe a cena de batalha passando o HP atual e máximo
                this.scene.launch('BattleScene', { 
                    biome: 'floresta',
                    mapLevel: 1,
                    originSceneKey: 'Fase1Scene',
                    battleOrigin: { x: this.player.x, y: this.player.y },
                    playerHp: playerData.hp,
                    playerMaxHp: playerData.maxHp
                }); 
            });
        });
    

        // Escuta o evento disparado pela BattleScene quando o jogador ganha
        this.events.on('resumeExploration', (batalhaData) => {
            // Salva a vida resultante no objeto do jogador
            this.player.hp = batalhaData.newHp;
            
            // O método resumeExploration() foi aquele que criamos dentro da classe Player.js
            this.player.resumeExploration();
        });
    }

    update(time, delta) {
        this.player.update(this.cursors);
    }
    
}