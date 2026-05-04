import Phaser from 'phaser';

const inimigosDaFloresta = [
    { name: 'Peão Vermelho', maxHp: 50, attack: 8, speed: 8, spriteKey: 'pawn_enemy_red' },
    { name: 'Lanceiro Negro', maxHp: 60, attack: 10, speed: 10, spriteKey: 'lancer_enemy_blue' }
];

const inimigosDaFloresta = [
    { name: 'Peão Vermelho', maxHp: 50, attack: 8, speed: 8, spriteKey: 'pawn_enemy_red' },
    { name: 'Lanceiro Negro', maxHp: 60, attack: 10, speed: 10, spriteKey: 'lancer_enemy_blue' }
];

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene');
    }

    init(data) {
        this.mapLevel = data.mapLevel || 1;
        this.incomingPlayerHp = data.playerHp || 100;
        this.incomingPlayerMaxHp = data.playerMaxHp || 100;
    }

    create() {
        console.log("Batalha Iniciada!");
        this.cameras.main.setBackgroundColor('rgb(187, 176, 176)');        

        const inimigoSorteado = Phaser.Math.RND.pick(inimigosDaFloresta);
      
        this.playerStats = {
            name: 'Herói',
            hp: this.incomingPlayerHp,
            maxHp: this.incomingPlayerMaxHp,    
            attack: 15,
            speed: 12,
            actionValue: 0 
        };
        
        this.enemyStats = {
            name: inimigoSorteado.name,
            hp: inimigoSorteado.maxHp,
            maxHp: inimigoSorteado.maxHp,
            attack: inimigoSorteado.attack,
            speed: inimigoSorteado.speed,
            spriteKey: inimigoSorteado.spriteKey,
            actionValue: 0
        };

        this.playerSprite = this.add.sprite(150, 250, 'warrior-idle');
        this.playerSprite.setScale(1.5);
        
        this.enemySprite = this.add.sprite(650, 250, this.enemyStats.spriteKey);
        this.enemySprite.setScale(1.5);
        this.enemySprite.flipX = true;

        // 3. UI Básica (Textos na tela)
        this.playerText = this.add.text(100, 80, this.getPlayerStatus(), { font: '16px Arial', fill: '#00ff00' });
        this.enemyText = this.add.text(550, 80, this.getEnemyStatus(), { font: '16px Arial', fill: '#ff0000' });
        
        this.logText = this.add.text(50, 480, 'Um inimigo apareceu!', { font: '18px Arial', fill: '#ffffff' });

        // 4. Animação dos personagens
        if (!this.anims.exists('battle-hero-idle')) {
            this.anims.create({
                key: 'battle-hero-idle',
                frames: this.anims.generateFrameNumbers('warrior-idle'),
                frameRate: 16,
                repeat: -1 // -1 faz a animação repetir em loop infinito
            });
        }
        this.playerSprite.play('battle-hero-idle');

        const enemyAnimKey = `battle-${this.enemyStats.spriteKey}-idle`;
        if (!this.anims.exists(enemyAnimKey)) {
            this.anims.create({
                key: enemyAnimKey,
                frames: this.anims.generateFrameNumbers(this.enemyStats.spriteKey, { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }
        this.enemySprite.play(enemyAnimKey);

        // Impede ações enquanto a lógica calcula de quem é o turno
        this.isProcessingTurn = false;

        // Inicia o motor da batalha
        this.time.delayedCall(1000, () => {
            this.calculateNextTurn();
        });
    }

    // Retorna a string formatada para a UI
    getPlayerStatus() {
        return `${this.playerStats.name}\nHP: ${this.playerStats.hp}/${this.playerStats.maxHp}\nCTB: ${this.playerStats.actionValue}/100`;
    }

    getEnemyStatus() {
        return `${this.enemyStats.name}\nHP: ${this.enemyStats.hp}/${this.enemyStats.maxHp}\nCTB: ${this.enemyStats.actionValue}/100`;
    }

    updateUI() {
        this.playerText.setText(this.getPlayerStatus());
        this.enemyText.setText(this.getEnemyStatus());
    }

    // --- MOTOR DO CTB (Conditional Turn-Based) ---
    calculateNextTurn() {
        this.isProcessingTurn = true;

        // Avança o Action Value baseado na velocidade até alguém chegar a 100
        while (this.playerStats.actionValue < 100 && this.enemyStats.actionValue < 100) {
            this.playerStats.actionValue += this.playerStats.speed;
            this.enemyStats.actionValue += this.enemyStats.speed;
        }

        this.updateUI();

        // Verifica de quem é o turno (quem passou de 100 primeiro)
        if (this.playerStats.actionValue >= 100 && this.playerStats.actionValue >= this.enemyStats.actionValue) {
            this.startPlayerTurn();
        } else if (this.enemyStats.actionValue >= 100) {
            this.startEnemyTurn();
        }
    }

    // --- TURNO DO JOGADOR ---
    startPlayerTurn() {
        this.logText.setText('Seu turno! [ESPAÇO] Atacar  |  [C] Curar');
        
        // Consome a barra de ação
        this.playerStats.actionValue -= 100; 
        
        // Cria um ouvinte de teclado global para o turno
        const handleTurnInput = (event) => {
            // Se apertou ESPAÇO (Atacar)
            if (event.code === 'Space') {
                this.input.keyboard.off('keydown', handleTurnInput); // Remove o ouvinte para não bugar
                this.executeAttack(this.playerStats, this.enemyStats);
            } 
            // Se apertou C (Curar)
            else if (event.code === 'KeyC') {
                this.input.keyboard.off('keydown', handleTurnInput); // Remove o ouvinte
                this.executeHeal(this.playerStats);
            }
        };

        // Liga o ouvinte aguardando o jogador apertar alguma tecla
        this.input.keyboard.on('keydown', handleTurnInput);
    }

    // --- TURNO DO INIMIGO ---
    startEnemyTurn() {
        this.logText.setText(`Turno do ${this.enemyStats.name}...`);
        
        this.enemyStats.actionValue -= 100;

        // IA super simples: ataca após 1 segundo
        this.time.delayedCall(1000, () => {
            this.executeAttack(this.enemyStats, this.playerStats);
        });
    }

    // --- LÓGICA DE DANO ---
    executeAttack(attacker, defender) {
        // Cálculo base de dano (pode expandir com crítico, defesa, fraquezas)
        let damage = attacker.attack + Phaser.Math.Between(-2, 2); 
        defender.hp -= damage;
        if (defender.hp < 0) defender.hp = 0;

        this.logText.setText(`${attacker.name} causou ${damage} de dano!`);
        this.updateUI();

        // Efeito visual tremendo a câmera
        this.cameras.main.shake(200, 0.01);

        // Verifica fim da batalha após um breve delay para o jogador ler o log
        this.time.delayedCall(1500, () => {
            this.checkBattleEnd();
        });
    }

    executeHeal(character) {
        // Define o valor da cura (ex: 25 de HP base + um valor aleatório entre -5 e 5)
        let healAmount = 25 + Phaser.Math.Between(-5, 5); 
        
        character.hp += healAmount;

        // Trava o HP para não ultrapassar a vida máxima
        if (character.hp > character.maxHp) {
            // Calcula o quanto curou de verdade (caso a vida estivesse quase cheia)
            healAmount -= (character.hp - character.maxHp); 
            character.hp = character.maxHp;
        }

        this.logText.setText(`${character.name} recuperou ${healAmount} de HP!`);
        this.updateUI();

        // Efeito visual: Flash verde na tela para indicar a cura
        this.cameras.main.flash(300, 50, 255, 50);

        // Deixa a cor do boneco verde rapidamente, depois volta ao normal
        this.playerSprite.setTint(0x00ff00);
        this.time.delayedCall(300, () => {
            this.playerSprite.clearTint();
        });

        // Passa o turno adiante
        this.time.delayedCall(1500, () => {
            this.checkBattleEnd();
        });
    }

    checkBattleEnd() {
        if (this.enemyStats.hp <= 0) {
            this.logText.setText('Você venceu a batalha!');
            this.time.delayedCall(2000, () => this.endBattle(true));
        } 
        else if (this.playerStats.hp <= 0) {
            this.logText.setText('Você foi derrotado...');
            this.time.delayedCall(2000, () => this.endBattle(false));
        } 
        else {
            // Se ninguém morreu, recalcula o próximo turno
            this.calculateNextTurn();
        }
    }

    endBattle(playerWon) {
        if (playerWon) {
            // Recupera a cena de exploração original
            const exploreScene = this.scene.get('Fase1Scene'); // Atualize com o nome correto da sua cena principal
            
            // Para esta cena de batalha e acorda o mapa
            this.scene.stop();
            this.scene.resume('Fase1Scene');
            
            // Avisa o mapa para destravar o movimento do player
            exploreScene.events.emit('resumeExploration', { newHp: this.playerStats.hp });
        } else {
            // Em caso de Game Over, manda para a tela inicial
            this.scene.start('GameOverScene'); 
        }
    }
}