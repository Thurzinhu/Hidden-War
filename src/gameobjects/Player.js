import { Physics } from "phaser";

export class Player extends Physics.Arcade.Sprite {
    scene = null;
    walkSpeed = 180;
    type = "warrior";

    hp = 100;
    maxHp = 100;

    distanceAccumulator = 0;
    nextEncounterDistance = 0;
    lastX = 0;
    lastY = 0;
    isExploring = true;

    constructor({ scene, type }) {
        super(scene, 50, 50, `${type}-idle`);
        this.scene = scene;
        this.type = type;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.setSize(35, 35);
        this.createPlayerAnimations();

        this.lastX = this.x;
        this.lastY = this.y;
        this.nextEncounterDistance = this.generateNextEncounterTarget();
    }

    createPlayerAnimations() {
        const anims = this.scene.anims;
        anims.create({
            key: 'idle',
            frames: anims.generateFrameNumbers(`${this.type}-idle`),
            frameRate: 16,
            repeat: -1,
        })
        anims.create({
            key: 'run',
            frames: anims.generateFrameNumbers(`${this.type}-run`),
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

        if (this.isExploring) {
            this.checkRandomEncounter();
        }
    }

    generateNextEncounterTarget() {
        // Quantidade de pixels mínima e máxima para rodar pelo mapa até a batalha
        const minDistance = 10; 
        const maxDistance = 10; 
        return Phaser.Math.Between(minDistance, maxDistance);
    }

    checkRandomEncounter() {
        // Calcula a distância percorrida usando a matemática do próprio Phaser
        const distanceMoved = Phaser.Math.Distance.Between(this.lastX, this.lastY, this.x, this.y);

        if (distanceMoved > 0) {
            this.distanceAccumulator += distanceMoved;
            
            // Atualiza as posições para o próximo frame
            this.lastX = this.x;
            this.lastY = this.y;

            // Se atingiu a cota de distância, inicia a batalha
            if (this.distanceAccumulator >= this.nextEncounterDistance) {
                this.iniciarBatalha();
            }
        }
    }

    iniciarBatalha() {
        console.log("Inimigo encontrado!");
        
        // Trava o jogador
        this.isExploring = false;
        this.body.setVelocity(0);
        this.play("idle", true);

        // Zera tudo para a próxima exploração
        this.distanceAccumulator = 0;
        this.nextEncounterDistance = this.generateNextEncounterTarget();

        // Dispara o evento para a Fase1Scene cuidar da troca de tela
        this.scene.events.emit('startBattle', { hp: this.hp, maxHp: this.maxHp }); 
    }
    
    resumeExploration() {
        this.isExploring = true;
        // Reinicia a posição salva para não dar um salto no cálculo ao voltar da batalha
        this.lastX = this.x;
        this.lastY = this.y;
    }

    increaseSpeed(amount = 50) {
        this.walkSpeed += amount;
        console.log(`Velocidade aumentada para: ${this.walkSpeed}`);
    }

    decreaseSpeed(amount = 50) {
        this.walkSpeed = Math.max(this.walkSpeed - amount, 50); // Mínimo de 50 para não ficar muito lento
        console.log(`Velocidade diminuída para: ${this.walkSpeed}`);
    }

    setSpeed(speed) {
        this.walkSpeed = Math.max(speed, 50);
        console.log(`Velocidade definida para: ${this.walkSpeed}`);
    }

    increaseSpeed(amount = 50) {
        this.walkSpeed += amount;
        console.log(`Velocidade aumentada para: ${this.walkSpeed}`);
    }

    decreaseSpeed(amount = 50) {
        this.walkSpeed = Math.max(this.walkSpeed - amount, 50); // Mínimo de 50 para não ficar muito lento
        console.log(`Velocidade diminuída para: ${this.walkSpeed}`);
    }

    setSpeed(speed) {
        this.walkSpeed = Math.max(speed, 50);
        console.log(`Velocidade definida para: ${this.walkSpeed}`);
    }
}