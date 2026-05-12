import { Scene } from "phaser";
import { Player } from "../gameobjects/Player";

const TRANSPARENT_TILES = [45, 59, 66, 69, 82, 102, 125, 135, 141, 144, 146, 161, 164, 195, 205, 274, 278, 294];
const SHADE_LAYERS = ['Obstacles', 'Trees', 'Trees (Copy)'];

export class Fase2Scene extends Scene {
    player = null;
    cursors = null;
    shadeLayers = [];

    constructor() {
        super("Fase2Scene");
    }

    create() {
        const map = this.make.tilemap({ key: 'mapaOssos' });
        const tileset = map.addTilesetImage(map.tilesets[0].name, 'tilesFase2');

        // Criar layers em ordem e guardar referências
        const layers = {};
        for (const layerData of map.layers) {
            layers[layerData.name] = map.createLayer(layerData.name, tileset);
        }

        // === COLISÃO ===
        // A colisão desta fase é controlada pela layer "Collision"
        const collisionLayer = layers['Collision'];
        const oceanLayer = layers['Ocean'];
        const groundLayer = layers['Ground'];
        const bridgeLayer = layers['Bridges'];

        if (collisionLayer) {
            collisionLayer.setCollisionByExclusion([-1]);
        }

        // Colisão do ocean: bloquear onde nao ha ground nem bridge por cima
        if (oceanLayer && groundLayer && bridgeLayer) {
            oceanLayer.forEachTile(tile => {
                if (tile.index === -1) return;
                const groundTile = groundLayer.getTileAt(tile.x, tile.y);
                const bridgeTile = bridgeLayer.getTileAt(tile.x, tile.y);
                const hasGround = groundTile && groundTile.index !== -1;
                const hasBridge = bridgeTile && bridgeTile.index !== -1;
                if (!hasGround && !hasBridge) {
                    tile.setCollision(true, true, true, true);
                }
            });
        }

        this.player = new Player({ scene: this });
        this.player.setDepth(10);
        this.player.setPosition(2672, 2434);
        this.player.setScale(2.2);
        this.player.increaseSpeed(200);
        this.player.body.setSize(40, 20);
        this.player.body.setOffset(80, 90);

        if (collisionLayer) {
            this.physics.add.collider(this.player, collisionLayer);
        }
        if (oceanLayer) {
            this.physics.add.collider(this.player, oceanLayer);
        }

        // === SHADE NAS LAYERS DE VEGETAÇÃO ===
        this.shadeLayers = [];
        for (const name of SHADE_LAYERS) {
            if (layers[name]) {
                layers[name].setDepth(20); // acima do player (depth 10)
                this.shadeLayers.push(layers[name]);
            }
        }

        const camera = this.cameras.main;
        camera.startFollow(this.player);
        camera.setZoom(0.35);
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.events.on('startBattle', (playerData) => {
            console.log("Iniciando batalha no Vale dos Ossos...");
            this.cameras.main.flash(300, 255, 255, 255); 
            
            this.time.delayedCall(300, () => {
                this.scene.pause(); 
                
                // IMPORTANTE: Aqui passamos biome: 'caverna' (ou 'ossos')
                this.scene.launch('BattleScene', { 
                    biome: 'ossos', 
                    originSceneKey: 'Fase2Scene',
                    battleOrigin: { x: this.player.x, y: this.player.y },
                    playerHp: playerData.hp,
                    playerMaxHp: playerData.maxHp
                }); 
            });
        });

        this.events.on('resumeExploration', (batalhaData) => {
            this.player.hp = batalhaData.newHp;
            this.player.resumeExploration();
            console.log(`De volta ao Vale. HP: ${this.player.hp}`);
        });

        this.add.rectangle(0, 0, map.widthInPixels, map.heightInPixels, 0xbababa, 0.2)
            .setOrigin(0, 0)
            .setDepth(100);

        this.input.on('pointerdown', (pointer) => {
            console.log(`setPosition(${Math.round(pointer.worldX)}, ${Math.round(pointer.worldY)})`);
        });
    }

    update(time, delta) {
        this.player.update(this.cursors);
        this._updateShadeEffect();
    }

    _updateShadeEffect() {
        // Checar pelo centro do corpo físico do player
        const px = this.player.body.center.x;
        const py = this.player.body.center.y;

        let underVegetation = false;
        for (const layer of this.shadeLayers) {
            const tile = layer.getTileAtWorldXY(px, py);
            if (tile && tile.index > 0 && !TRANSPARENT_TILES.includes(tile.index)) {
                underVegetation = true;
                break;
            }
        }

        const targetAlpha = underVegetation ? 0.35 : 1.0;
        // Transição suave
        this.player.setAlpha(Phaser.Math.Linear(this.player.alpha, targetAlpha, 0.15));
    }
}