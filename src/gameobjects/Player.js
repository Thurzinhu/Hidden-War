import { Physics } from "phaser";

export class Player extends Physics.Arcade.Sprite {
    scene = null;
    walkSpeed = 180;

    constructor({scene}) {
        super(scene, 50, 50, "warrior-idle");
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.setSize(40, 40);
        this.createPlayerAnimations();
    }

    createPlayerAnimations() {
        const anims = this.scene.anims;
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

    start() {   
    }

    move(cursors) {
        this.body.setVelocity(0);
        
        if (cursors.left.isDown) {
            this.body.setVelocityX(-this.walkSpeed);
        } else if (cursors.right.isDown) {
            this.body.setVelocityX(this.walkSpeed);
        }

        if (cursors.up.isDown) {
            this.body.setVelocityY(-this.walkSpeed);
        } else if (cursors.down.isDown) {
            this.body.setVelocityY(this.walkSpeed);
        }

        this.body.velocity.normalize().scale(this.walkSpeed);
        
        if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown) {
            if (cursors.left.isDown) {
                this.flipX = true;
            } else if (cursors.right.isDown) {
                this.flipX = false;
            }
            this.play("run", true);
        } else {
            this.play("idle", true);
        }
    }

    update(cursors) {
        this.move(cursors);
    }
}