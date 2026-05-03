import Phaser from 'phaser';

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene');
    }

    init(data) {
        // Recebe os dados da cena de exploração
        this.mapLevel = data.mapLevel || 1;
    }

    create() {
        console.log("Batalha Iniciada!");

        // Adiciona o Herói à esquerda (x: 150, y: 250)
        this.playerSprite = this.add.sprite(150, 250, 'warrior-idle');
        this.playerSprite.setScale(2); // Aumenta o tamanho se ficar pequeno

        // Adiciona o Inimigo à direita (x: 650, y: 250)
        this.enemySprite = this.add.sprite(650, 250, 'enemy-blue');
        this.enemySprite.setScale(2);
        this.enemySprite.flipX = true; // Inverte horizontalmente para encarar o herói

        // 1. Fundo da Batalha (Pode ser substituído por uma imagem de background)
        this.cameras.main.setBackgroundColor('rgba(40, 40, 40, 1)');

        // 2. Definição das Entidades (Arquitetura inicial do CTB)
        // O "actionValue" é o acumulador. Quando chega a 100, é o turno do personagem.
        this.playerStats = {
            name: 'Herói',
            hp: 100,
            maxHp: 100,
            attack: 15,
            speed: 12,
            actionValue: 0 
        };

        this.enemyStats = {
            name: 'Slime Sombrio',
            hp: 50,
            maxHp: 50,
            attack: 8,
            speed: 8,
            actionValue: 0
        };

        // 3. UI Básica (Textos na tela)
        this.playerText = this.add.text(50, 300, this.getPlayerStatus(), { font: '16px Arial', fill: '#00ff00' });
        this.enemyText = this.add.text(500, 100, this.getEnemyStatus(), { font: '16px Arial', fill: '#ff0000' });
        
        this.logText = this.add.text(50, 400, 'Um inimigo apareceu!', { font: '18px Arial', fill: '#ffffff' });

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
        this.logText.setText('Seu turno! Pressione [ESPAÇO] para Atacar.');
        
        // Consome a barra de ação
        this.playerStats.actionValue -= 100; 
        
        // Aguarda input do jogador
        this.input.keyboard.once('keydown-SPACE', () => {
            this.executeAttack(this.playerStats, this.enemyStats);
        });
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
            exploreScene.events.emit('resumeExploration');
        } else {
            // Em caso de Game Over, manda para a tela inicial
            this.scene.start('GameOverScene'); 
        }
    }
}