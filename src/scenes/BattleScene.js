import Phaser from 'phaser';
import { Enemy } from '../gameobjects/Enemy';

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene');
    }

    init(data) {
        if (!data) data = {}; 
        this.biome = data.biome || 'floresta'; 
        
        this.mapLevel = data.mapLevel || 1;
        this.incomingPlayerHp = data.playerHp || 100;
        this.incomingPlayerMaxHp = data.playerMaxHp || 100;
    }

    create() {
        this.cameras.main.setBackgroundColor('rgb(187, 176, 176)');

        // 1. BUSCAR DADOS DO JSON BASEADO NO BIOMA
        const allEnemies = this.cache.json.get('enemies_data');
        
        // Se o bioma não existir no JSON, usamos 'floresta' como fallback
        const currentPool = allEnemies[this.biome] || allEnemies['floresta'];
        const inimigoSorteadoData = Phaser.Math.RND.pick(currentPool);

        // 2. INSTANCIAR O INIMIGO (Usando a classe Enemy que criamos antes)
        this.enemy = new Enemy(this, 650, 350, inimigoSorteadoData);
        this.enemyStats = this.enemy; 

        // 3. CONFIGURAR PLAYER (Pode virar uma classe PlayerBattle depois)
        this.playerStats = {
            name: 'Herói',
            hp: this.incomingPlayerHp,
            maxHp: this.incomingPlayerMaxHp,
            attack: 15,
            speed: 12,
            actionValue: 0
        };

        this.playerSprite = this.add.sprite(150, 250, 'warrior-idle');
        this.playerSprite.setScale(1.5);

        // Animação Player
        if (!this.anims.exists('battle-hero-idle')) {
            this.anims.create({
                key: 'battle-hero-idle',
                frames: this.anims.generateFrameNumbers('warrior-idle', { start: 0, end: 5 }),
                frameRate: 10, repeat: -1 
            });
        }
        this.playerSprite.play('battle-hero-idle');

        // 4. UI
        this.playerText = this.add.text(100, 80, this.getPlayerStatus(), { font: '16px Arial', fill: '#00ff00' });
        this.enemyText = this.add.text(550, 80, this.getEnemyStatus(), { font: '16px Arial', fill: '#ff0000' });
        this.logText = this.add.text(50, 480, `Um ${this.enemy.name} apareceu!`, { font: '18px Arial', fill: '#ffffff' });

        this.isProcessingTurn = false;
        this.time.delayedCall(1000, () => this.calculateNextTurn());
    }

    // Modifique o executeAttack para usar o método da classe
    executeAttack(attacker, defender) {
        let damage = attacker.attack + Phaser.Math.Between(-2, 2);
        
        // Se o defensor for o objeto da classe Enemy, usamos o método takeDamage
        if (defender.takeDamage) {
            defender.takeDamage(damage);
        } else {
            defender.hp = Math.max(0, defender.hp - damage);
        }

        this.logText.setText(`${attacker.name} causou ${damage} de dano!`);
        this.updateUI();
        this.cameras.main.shake(200, 0.01);

        this.time.delayedCall(1500, () => this.checkBattleEnd());
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
        
        this.playerStats.actionValue -= 100; 
        
        const handleTurnInput = (event) => {
            if (event.code === 'Space') {
                this.input.keyboard.off('keydown', handleTurnInput); 
                
                // INICIA O MINIGAME EM VEZ DO ATAQUE DIRETO
                this.startAttackMiniGame();
            } 
            else if (event.code === 'KeyC') {
                this.input.keyboard.off('keydown', handleTurnInput); 
                this.executeHeal(this.playerStats);
            }
        };

        this.input.keyboard.on('keydown', handleTurnInput);
    }

    // --- MINIGAME DE ATAQUE (Estilo Undertale) ---
    startAttackMiniGame() {
        this.logText.setText('Aperte [ESPAÇO] no centro para Crítico!');

        // Variáveis de tamanho e posição da barra
        const barX = 400; // Centro da tela (assumindo 800 de largura)
        const barY = 430; // Fica logo acima do texto de log
        const barWidth = 400;
        const barHeight = 30;

        // 1. Fundo da barra (Preto com borda)
        this.miniGameBg = this.add.rectangle(barX, barY, barWidth, barHeight, 0x000000).setOrigin(0.5);
        this.miniGameBg.setStrokeStyle(4, 0xffffff);

        // 2. Área central (Crítico - Verde)
        this.miniGameCenter = this.add.rectangle(barX, barY, 40, barHeight, 0x00ff00).setOrigin(0.5);

        // 3. Cursor (A barrinha que se move - Branca)
        this.miniGameCursor = this.add.rectangle(barX - barWidth/2 + 10, barY, 10, barHeight + 20, 0xffffff).setOrigin(0.5);

        // 4. Animação de ir e voltar (Tween)
        this.miniGameTween = this.tweens.add({
            targets: this.miniGameCursor,
            x: barX + barWidth/2 - 10, // Move até a ponta direita
            duration: 700,             // Velocidade (menor = mais rápido/difícil)
            yoyo: true,                // Vai e volta
            repeat: -1                 // Repete infinitamente
        });

        // 5. Escuta o botão de parar (com um pequeno delay para não pegar o espaço do turno)
        this.time.delayedCall(100, () => {
            this.input.keyboard.once('keydown-SPACE', () => {
                this.stopAttackMiniGame(barX, barWidth);
            });
        });
    }

    stopAttackMiniGame(barCenterX, barWidth) {
        // Congela o cursor
        this.miniGameTween.stop();

        // Calcula a distância do cursor até o centro perfeito da barra
        const cursorX = this.miniGameCursor.x;
        const distance = Math.abs(cursorX - barCenterX);

        // Define o multiplicador de dano (A distância máxima é ~200 pixels)
        let multiplier = 0;
        
        if (distance <= 20) {
            multiplier = 1.5; // CRÍTICO: Parou bem no meio
        } else if (distance <= 120) {
            multiplier = 1.0; // NORMAL: Parou na zona média
        } else if (distance <= 180) {
            multiplier = 0.5; // FRACO: Quase errou
        } else {
            multiplier = 0;   // ERROU: Parou na bordinha
        }

        // Apaga os visuais do minigame
        this.miniGameBg.destroy();
        this.miniGameCenter.destroy();
        this.miniGameCursor.destroy();

        // Manda executar o ataque passando o multiplicador como bônus
        this.executeAttack(this.playerStats, this.enemyStats, multiplier);
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
    executeAttack(attacker, defender, multiplier = 1) {
        
        // Se o jogador errou o minigame completamente
        if (multiplier === 0) {
            this.logText.setText(`${attacker.name} ERROU o ataque!`);
            this.time.delayedCall(1500, () => this.checkBattleEnd());
            return;
        }

        // Dano agora é fixo baseado no multiplicador
        let damage = Math.round(attacker.attack * multiplier);

        // Textos interativos dependendo do acerto
        let feedbackText = "";
        if (multiplier > 1) feedbackText = "ACERTO CRÍTICO! ";
        else if (multiplier < 1) feedbackText = "Acerto de raspão... ";

        // Aplica o dano usando a classe Enemy se possível
        if (defender.takeDamage) {
            defender.takeDamage(damage);
        } else {
            defender.hp = Math.max(0, defender.hp - damage);
        }

        this.logText.setText(`${feedbackText}${attacker.name} causou ${damage} de dano!`);
        this.updateUI();

        this.cameras.main.shake(200, 0.01);

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
        // Descobre em qual fase o jogador estava lutando
        const currentSceneKey = this.biome === 'ossos' ? 'Fase2Scene' : 'Fase1Scene';

        if (playerWon) {
            this.scene.stop(); // Desliga a tela de Batalha
            this.scene.resume(currentSceneKey); // Acorda a fase
            
            const exploreScene = this.scene.get(currentSceneKey);
            exploreScene.events.emit('resumeExploration', { newHp: this.playerStats.hp });
        } else {
            // EM CASO DE DERROTA:
            
            // 1. Desliga completamente a fase do mapa (para ela recomeçar limpa depois)
            this.scene.stop(currentSceneKey);
            
            // 2. Inicia o Game Over mandando { points: 0 } de forma explícita
            this.scene.start('GameOverScene', { points: 0 }); 
        }
    }
}