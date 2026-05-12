import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, data) {
        super(scene, x, y, data.spriteKey);
        
        this.scene = scene;
        this.scene.add.existing(this);
        
        // Atributos vindos do JSON
        this.name = data.name;
        this.hp = data.maxHp;
        this.maxHp = data.maxHp;
        this.attack = data.attack;
        this.speed = data.speed;
        this.spriteKey = data.spriteKey;
        this.actionValue = 0;

        this.setScale(1.5);
        this.flipX = true;

        this.createAnimations();
    }

    createAnimations() {
        const animKey = `battle-${this.spriteKey}-idle`;
        if (!this.scene.anims.exists(animKey)) {
            this.scene.anims.create({
                key: animKey,
                frames: this.scene.anims.generateFrameNumbers(this.spriteKey, { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }
        this.play(animKey);
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        
        // Efeito visual de dano (piscar vermelho)
        this.setTint(0xff0000);
        this.scene.time.delayedCall(200, () => this.clearTint());
    }
}