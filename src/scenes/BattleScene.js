import Phaser from 'phaser';
import { Enemy } from '../gameobjects/Enemy';

const BATTLEFIELD_CONFIG = {
    floresta: {
        mapKey: 'mapaFloresta',
        tilesetKey: 'tilesFase1',
        sceneKey: 'Fase1Scene',
        fallbackColor: 0x486b3f,
        overlayColor: 0x18321f,
        title: 'Clareira da Floresta'
    },
    ossos: {
        mapKey: 'mapaOssos',
        tilesetKey: 'tilesFase2',
        sceneKey: 'Fase2Scene',
        fallbackColor: 0x4a4a53,
        overlayColor: 0x24202a,
        title: 'Vale dos Ossos'
    }
};

const UI = {
    panelFill: 0x141823,
    panelStroke: 0xd9c27c,
    playerAccent: 0x69d27d,
    enemyAccent: 0xf06a6a,
    text: '#f8efd7',
    mutedText: '#c7b88d'
};

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene');
    }

    init(data) {
        if (!data) data = {};

        this.biome = data.biome || 'floresta';
        this.battlefieldConfig = BATTLEFIELD_CONFIG[this.biome] || BATTLEFIELD_CONFIG.floresta;
        this.mapLevel = data.mapLevel || 1;
        this.incomingPlayerHp = data.playerHp || 100;
        this.incomingPlayerMaxHp = data.playerMaxHp || 100;
        this.battleOrigin = data.battleOrigin || { x: 640, y: 360 };
        this.originSceneKey = data.originSceneKey || this.battlefieldConfig.sceneKey;
    }

    create() {
        this.cameras.main.setBackgroundColor(this.battlefieldConfig.fallbackColor);

        this.createBattleBackdrop();
        this.createBattleFrame();

        const allEnemies = this.cache.json.get('enemies_data');
        const currentPool = allEnemies[this.biome] || allEnemies.floresta;
        const enemyData = Phaser.Math.RND.pick(currentPool);

        this.playerStats = {
            name: 'Herói',
            hp: this.incomingPlayerHp,
            maxHp: this.incomingPlayerMaxHp,
            attack: 15,
            speed: 12,
            actionValue: 0
        };

        this.createCombatants(enemyData);
        this.createBattleUI();

        this.isProcessingTurn = false;
        this.logMessage(`Um ${this.enemy.name} apareceu!`, 'Prepare sua ação quando a barra de turno carregar.');
        this.time.delayedCall(1000, () => this.calculateNextTurn());
    }

    createBattleBackdrop() {
        const { width, height } = this.scale;
        const config = this.battlefieldConfig;

        this.backdropContainer = this.add.container(0, 0).setDepth(-20);

        const vignetteBase = this.add.rectangle(0, 0, width, height, config.fallbackColor).setOrigin(0);
        this.backdropContainer.add(vignetteBase);

        if (this.cache.tilemap.exists(config.mapKey) && this.textures.exists(config.tilesetKey)) {
            const map = this.make.tilemap({ key: config.mapKey });
            const tileset = map.addTilesetImage(map.tilesets[0].name, config.tilesetKey);
            const scale = this.biome === 'ossos' ? 0.62 : 0.82;
            const focusX = Phaser.Math.Clamp(this.battleOrigin.x || map.widthInPixels / 2, 0, map.widthInPixels);
            const focusY = Phaser.Math.Clamp(this.battleOrigin.y || map.heightInPixels / 2, 0, map.heightInPixels);
            const offsetX = width / 2 - focusX * scale;
            const offsetY = height / 2 - focusY * scale;

            let visualLayerDepth = -15;
            for (const layerData of map.layers) {
                if (layerData.name === 'Collision') continue;

                const layer = map.createLayer(layerData.name, tileset, offsetX, offsetY);
                layer.setScale(scale);
                layer.setDepth(visualLayerDepth++);
                layer.setAlpha(layerData.opacity ?? 1);
            }
        }

        this.add.rectangle(0, 0, width, height, 0x000000, 0.22).setOrigin(0).setDepth(-5);
        this.add.rectangle(0, 0, width, height, config.overlayColor, 0.20).setOrigin(0).setDepth(-4);
        this.add.rectangle(0, 0, width, 120, 0x000000, 0.36).setOrigin(0).setDepth(-3);
        this.add.rectangle(0, height - 190, width, 190, 0x000000, 0.42).setOrigin(0).setDepth(-3);

        this.add.ellipse(width * 0.24, 520, 340, 70, 0x000000, 0.26).setDepth(-2);
        this.add.ellipse(width * 0.77, 520, 380, 76, 0x000000, 0.28).setDepth(-2);

        this.add.text(34, 24, config.title, {
            fontFamily: 'Georgia, serif',
            fontSize: '28px',
            color: UI.text,
            stroke: '#1b1209',
            strokeThickness: 5
        }).setDepth(20);
    }

    createBattleFrame() {
        const { width, height } = this.scale;
        this.add.rectangle(12, 12, width - 24, height - 24, 0x000000, 0).setOrigin(0).setStrokeStyle(3, UI.panelStroke, 0.8).setDepth(15);
        this.add.rectangle(22, 22, width - 44, height - 44, 0x000000, 0).setOrigin(0).setStrokeStyle(1, 0xffffff, 0.22).setDepth(15);
    }

    createCombatants(enemyData) {
        this.playerSprite = this.add.sprite(300, 425, 'warrior-idle').setScale(2.05).setDepth(5);

        if (!this.anims.exists('battle-hero-idle')) {
            this.anims.create({
                key: 'battle-hero-idle',
                frames: this.anims.generateFrameNumbers('warrior-idle', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }
        this.playerSprite.play('battle-hero-idle');

        this.enemy = new Enemy(this, 980, 405, enemyData);
        this.enemy.setScale(enemyData.spriteKey?.includes('lancer') ? 1.45 : 2.0);
        this.enemy.setDepth(5);
        this.enemyStats = this.enemy;
    }

    createBattleUI() {
        this.playerCard = this.createStatusCard(48, 92, 430, 128, 'player');
        this.enemyCard = this.createStatusCard(802, 92, 430, 128, 'enemy');

        this.actionPanel = this.add.rectangle(44, 566, 1192, 118, UI.panelFill, 0.92)
            .setOrigin(0)
            .setStrokeStyle(3, UI.panelStroke, 0.9)
            .setDepth(30);

        this.logTitle = this.add.text(72, 586, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '25px',
            color: UI.text,
            stroke: '#000000',
            strokeThickness: 4
        }).setDepth(31);

        this.logText = this.add.text(72, 624, '', {
            fontFamily: 'Trebuchet MS, Arial, sans-serif',
            fontSize: '19px',
            color: UI.mutedText,
            wordWrap: { width: 760 }
        }).setDepth(31);

        this.commandText = this.add.text(875, 596, '[ESPAÇO] Atacar\n[C] Curar', {
            fontFamily: 'Trebuchet MS, Arial, sans-serif',
            fontSize: '21px',
            color: '#ffffff',
            lineSpacing: 10,
            stroke: '#000000',
            strokeThickness: 3
        }).setDepth(31);

        this.updateUI();
    }

    createStatusCard(x, y, width, height, type) {
        const accent = type === 'player' ? UI.playerAccent : UI.enemyAccent;
        const card = {
            x,
            y,
            width,
            height,
            accent,
            bg: this.add.rectangle(x, y, width, height, UI.panelFill, 0.90).setOrigin(0).setStrokeStyle(3, accent, 0.95).setDepth(30),
            name: this.add.text(x + 22, y + 16, '', {
                fontFamily: 'Georgia, serif',
                fontSize: '25px',
                color: UI.text,
                stroke: '#000000',
                strokeThickness: 4
            }).setDepth(31),
            hpText: this.add.text(x + 22, y + 55, '', {
                fontFamily: 'Trebuchet MS, Arial, sans-serif',
                fontSize: '18px',
                color: '#ffffff'
            }).setDepth(31),
            turnText: this.add.text(x + 22, y + 91, '', {
                fontFamily: 'Trebuchet MS, Arial, sans-serif',
                fontSize: '15px',
                color: UI.mutedText
            }).setDepth(31),
            hpBarBg: this.add.rectangle(x + 122, y + 64, width - 152, 18, 0x050608, 0.95).setOrigin(0, 0.5).setDepth(31),
            hpBar: this.add.rectangle(x + 122, y + 64, width - 152, 18, accent, 1).setOrigin(0, 0.5).setDepth(32),
            turnBarBg: this.add.rectangle(x + 122, y + 100, width - 152, 10, 0x050608, 0.95).setOrigin(0, 0.5).setDepth(31),
            turnBar: this.add.rectangle(x + 122, y + 100, width - 152, 10, 0xf0d36b, 1).setOrigin(0, 0.5).setDepth(32)
        };

        card.hpBarBg.setStrokeStyle(1, 0xffffff, 0.25);
        card.turnBarBg.setStrokeStyle(1, 0xffffff, 0.18);
        return card;
    }

    logMessage(title, body = '') {
        this.logTitle.setText(title);
        this.logText.setText(body);
    }

    updateCard(card, stats) {
        const hpPercent = Phaser.Math.Clamp(stats.hp / stats.maxHp, 0, 1);
        const turnPercent = Phaser.Math.Clamp(stats.actionValue / 100, 0, 1);
        const barWidth = card.width - 152;

        card.name.setText(stats.name);
        card.hpText.setText(`HP ${stats.hp}/${stats.maxHp}`);
        card.turnText.setText(`Turno ${Math.floor(stats.actionValue)}/100`);
        card.hpBar.width = Math.max(1, barWidth * hpPercent);
        card.turnBar.width = Math.max(1, barWidth * turnPercent);

        if (hpPercent < 0.3) {
            card.hpBar.setFillStyle(0xd94343);
        } else if (hpPercent < 0.6) {
            card.hpBar.setFillStyle(0xf0c04d);
        } else {
            card.hpBar.setFillStyle(card.accent);
        }
    }

    updateUI() {
        this.updateCard(this.playerCard, this.playerStats);
        this.updateCard(this.enemyCard, this.enemyStats);
    }

    calculateNextTurn() {
        this.isProcessingTurn = true;

        while (this.playerStats.actionValue < 100 && this.enemyStats.actionValue < 100) {
            this.playerStats.actionValue += this.playerStats.speed;
            this.enemyStats.actionValue += this.enemyStats.speed;
        }

        this.updateUI();

        if (this.playerStats.actionValue >= 100 && this.playerStats.actionValue >= this.enemyStats.actionValue) {
            this.startPlayerTurn();
        } else if (this.enemyStats.actionValue >= 100) {
            this.startEnemyTurn();
        }
    }

    startPlayerTurn() {
        this.logMessage('Seu turno!', 'Escolha uma ação: ataque com precisão ou recupere parte do HP.');

        this.playerStats.actionValue -= 100;
        this.updateUI();

        const handleTurnInput = (event) => {
            if (event.code === 'Space') {
                this.input.keyboard.off('keydown', handleTurnInput);
                this.startAttackMiniGame();
            } else if (event.code === 'KeyC') {
                this.input.keyboard.off('keydown', handleTurnInput);
                this.executeHeal(this.playerStats);
            }
        };

        this.input.keyboard.on('keydown', handleTurnInput);
    }

    startAttackMiniGame() {
        this.logMessage('Ataque de precisão', 'Aperte [ESPAÇO] quando o marcador cruzar o centro dourado para causar crítico.');

        const barX = 640;
        const barY = 525;
        const barWidth = 540;
        const barHeight = 28;

        this.miniGameBg = this.add.rectangle(barX, barY, barWidth, barHeight, 0x07090e, 0.96).setOrigin(0.5).setDepth(40);
        this.miniGameBg.setStrokeStyle(3, UI.panelStroke, 1);
        this.miniGameCenter = this.add.rectangle(barX, barY, 52, barHeight, 0xf0d36b, 1).setOrigin(0.5).setDepth(41);
        this.miniGameGood = this.add.rectangle(barX, barY, 180, barHeight, 0x69d27d, 0.28).setOrigin(0.5).setDepth(40);
        this.miniGameCursor = this.add.rectangle(barX - barWidth / 2 + 10, barY, 10, barHeight + 24, 0xffffff).setOrigin(0.5).setDepth(42);

        this.miniGameTween = this.tweens.add({
            targets: this.miniGameCursor,
            x: barX + barWidth / 2 - 10,
            duration: 700,
            yoyo: true,
            repeat: -1
        });

        this.time.delayedCall(100, () => {
            this.input.keyboard.once('keydown-SPACE', () => {
                this.stopAttackMiniGame(barX);
            });
        });
    }

    stopAttackMiniGame(barCenterX) {
        this.miniGameTween.stop();

        const cursorX = this.miniGameCursor.x;
        const distance = Math.abs(cursorX - barCenterX);
        let multiplier = 0;

        if (distance <= 26) {
            multiplier = 1.5;
        } else if (distance <= 120) {
            multiplier = 1.0;
        } else if (distance <= 220) {
            multiplier = 0.5;
        }

        this.miniGameBg.destroy();
        this.miniGameCenter.destroy();
        this.miniGameGood.destroy();
        this.miniGameCursor.destroy();

        this.executeAttack(this.playerStats, this.enemyStats, multiplier);
    }

    startEnemyTurn() {
        this.logMessage(`Turno do ${this.enemyStats.name}...`, 'O inimigo se prepara para atacar.');

        this.enemyStats.actionValue -= 100;
        this.updateUI();

        this.time.delayedCall(1000, () => {
            this.executeAttack(this.enemyStats, this.playerStats);
        });
    }

    executeAttack(attacker, defender, multiplier = 1) {
        if (multiplier === 0) {
            this.logMessage(`${attacker.name} errou!`, 'O golpe passou longe e não causou dano.');
            this.time.delayedCall(1500, () => this.checkBattleEnd());
            return;
        }

        const damage = Math.round(attacker.attack * multiplier);
        let feedbackText = '';
        if (multiplier > 1) feedbackText = 'ACERTO CRÍTICO! ';
        else if (multiplier < 1) feedbackText = 'Acerto de raspão... ';

        if (defender.takeDamage) {
            defender.takeDamage(damage);
        } else {
            defender.hp = Math.max(0, defender.hp - damage);
            this.playerSprite.setTint(0xff5454);
            this.time.delayedCall(200, () => this.playerSprite.clearTint());
        }

        this.logMessage(`${feedbackText}${attacker.name} atacou!`, `${damage} de dano causado.`);
        this.updateUI();
        this.cameras.main.shake(200, 0.01);

        this.time.delayedCall(1500, () => this.checkBattleEnd());
    }

    executeHeal(character) {
        let healAmount = 25 + Phaser.Math.Between(-5, 5);
        character.hp += healAmount;

        if (character.hp > character.maxHp) {
            healAmount -= character.hp - character.maxHp;
            character.hp = character.maxHp;
        }

        this.logMessage(`${character.name} se curou!`, `${healAmount} de HP recuperado.`);
        this.updateUI();
        this.cameras.main.flash(300, 50, 255, 50);
        this.playerSprite.setTint(0x66ff88);
        this.time.delayedCall(300, () => this.playerSprite.clearTint());
        this.time.delayedCall(1500, () => this.checkBattleEnd());
    }

    checkBattleEnd() {
        if (this.enemyStats.hp <= 0) {
            this.logMessage('Você venceu a batalha!', 'A área está segura por enquanto.');
            this.time.delayedCall(2000, () => this.endBattle(true));
        } else if (this.playerStats.hp <= 0) {
            this.logMessage('Você foi derrotado...', 'A expedição chegou ao fim.');
            this.time.delayedCall(2000, () => this.endBattle(false));
        } else {
            this.calculateNextTurn();
        }
    }

    endBattle(playerWon) {
        const currentSceneKey = this.originSceneKey || this.battlefieldConfig.sceneKey;

        if (playerWon) {
            this.scene.stop();
            this.scene.resume(currentSceneKey);

            const exploreScene = this.scene.get(currentSceneKey);
            exploreScene.events.emit('resumeExploration', { newHp: this.playerStats.hp });
        } else {
            this.scene.stop(currentSceneKey);
            this.scene.start('GameOverScene', { points: 0 });
        }
    }
}
