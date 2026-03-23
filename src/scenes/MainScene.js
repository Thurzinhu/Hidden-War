import { Scene } from "phaser";

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

    createPlayerAnimation() {
        const anims = this.anims;
        anims.create({
            key: 'idle',
            frames: anims.generateFrameNumbers("warrior-idle"),
            frameRate: 16,
            repeat: -1,
        })
        anims.create({
            key: 'run',
            frames: anims.generateFrameNumbers("warrior-run"),
            frameRate: 16,
            repeat: -1,
        })
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
        this.player = this.physics.add.sprite(50, 50, "warrior-idle").setSize(40, 40);

        const camera = this.cameras.main;
        camera.startFollow(this.player);
        camera.setBounds(0, 0, forest.widthInPixels, forest.heightInPixels);
        this.createPlayerAnimation();

        this.cursors = this.input.keyboard.createCursorKeys();

        this.physics.world.createDebugGraphic();

    }

    update(time, delta) {
        const speed = 180;
        // const prevVelocity = this.player.velocity.clone();
        this.player.body.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(speed);
        }

        if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(speed);
        }

        this.player.body.velocity.normalize().scale(speed);
        
        if (this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown) {
            if (this.cursors.right.isDown) {
                this.player.flipX = false;
            } else if (this.cursors.left.isDown) {
                this.player.flipX = true;
            }
            this.player.play("run", true);
        } else {
            this.player.play("idle", true);
        }
    }
}