import { Scene } from "phaser";

const STORY_PAGES = [
    {
        speaker: "Narrador",
        text: "Na última noite de inverno, os sinos do Castelo de Valenor ecoaram pela capital como um presságio sombrio. A princesa Elyra, herdeira do trono, havia desaparecido sem deixar rastros."
    },
    {
        speaker: "Rei Aldric",
        text: "Mensageiros enviados à Floresta da Neblina nunca retornaram. Patrulhas inteiras desapareceram entre as árvores cobertas pela névoa. O reino precisava de alguém capaz de sobreviver onde exércitos falharam."
    },
    {
        speaker: "Narrador",
        text: "Entre cavaleiros, mercenários e veteranos de guerra, apenas um nome foi escolhido pelo rei: o soldado mais letal da guarda real. Sua missão era simples apenas no papel — encontrar a princesa e trazê-la de volta viva."
    },
    {
        speaker: "Missão",
        text: "Atravessando ruínas esquecidas, estradas abandonadas e territórios dominados por feras, o guerreiro logo percebe que a floresta esconde algo muito mais perigoso do que monstros."
    },
    {
        speaker: "Presságio",
        text: "Acampamentos secretos surgem entre as sombras. Armas marcadas com o brasão do Império de Drakmor aparecem ao lado dos corpos dos invasores. O sequestro da princesa talvez tenha sido apenas o primeiro movimento de algo maior."
    },
    {
        speaker: "Narrador",
        text: "Enquanto a névoa se fecha ao redor do caminho, rumores de soldados infiltrados e generais estrangeiros começam a se confirmar. Cada batalha aproxima o reino de uma guerra que ninguém estava preparado para enfrentar."
    },
    {
        speaker: "Hidden War",
        text: "A fronteira entre resgate e massacre desapareceu. O destino da princesa agora carrega o futuro de todo o reino. A guerra oculta começou."
    }
];

export class StoryIntroScene extends Scene {
    constructor() {
        super("StoryIntroScene");
    }

    create() {
        this.currentPage = 0;
        this.currentText = "";
        this.isTyping = false;
        this.typeEvent = null;

        this.cameras.main.fadeIn(700, 0, 0, 0);
        this.createAtmosphere();
        this.createStoryPanel();
        this.showPage(0);

        this.input.on("pointerdown", () => this.advanceStory());
        this.input.keyboard.on("keydown-SPACE", () => this.advanceStory());
        this.input.keyboard.on("keydown-ENTER", () => this.advanceStory());
    }

    createAtmosphere() {
        const { width, height } = this.scale;

        const sky = this.add.graphics();
        sky.fillGradientStyle(0x0d1024, 0x0d1024, 0x263b3a, 0x14241f, 1);
        sky.fillRect(0, 0, width, height);

        this.add.circle(width * 0.78, height * 0.18, 70, 0xd6d1a4, 0.2);
        this.add.circle(width * 0.78, height * 0.18, 45, 0xf4e9b7, 0.18);

        for (let i = 0; i < 24; i += 1) {
            const x = (i * 73) % width;
            const y = height - 155 - ((i * 37) % 120);
            const tree = this.add.graphics();
            tree.fillStyle(i % 2 === 0 ? 0x07140f : 0x0a1d15, 0.92);
            tree.fillTriangle(x - 46, y + 145, x, y, x + 46, y + 145);
            tree.fillRect(x - 8, y + 88, 16, 112);
            tree.setDepth(1 + (i % 3));
        }

        for (let i = 0; i < 7; i += 1) {
            const mist = this.add.ellipse(130 + i * 195, height - 115 - (i % 2) * 42, 360, 84, 0xb7d0c7, 0.09);
            mist.setDepth(8);
            this.tweens.add({
                targets: mist,
                x: mist.x + 34,
                alpha: 0.15,
                duration: 2600 + i * 260,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            });
        }

        this.add.rectangle(0, height - 76, width * 2, 152, 0x07120e, 0.86).setOrigin(0, 0.5).setDepth(9);

        this.add.text(width / 2, 58, "HIDDEN WAR", {
            fontFamily: "Georgia, serif",
            fontSize: "46px",
            color: "#f5e7b2",
            stroke: "#1b0d08",
            strokeThickness: 6,
            letterSpacing: 8
        }).setOrigin(0.5).setDepth(12);

        this.add.text(width / 2, 104, "A Convocação e a Fronteira", {
            fontFamily: "Georgia, serif",
            fontSize: "22px",
            color: "#d7c59a",
            stroke: "#0b0b12",
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(12);
    }

    createStoryPanel() {
        const { width, height } = this.scale;
        const panelX = width / 2;
        const panelY = height - 178;
        const panelWidth = Math.min(1040, width - 120);
        const panelHeight = 230;

        const shadow = this.add.rectangle(panelX + 10, panelY + 12, panelWidth, panelHeight, 0x000000, 0.45)
            .setDepth(18);
        shadow.setStrokeStyle(4, 0x000000, 0.3);

        const bubble = this.add.graphics().setDepth(20);
        bubble.fillStyle(0xefe0b2, 0.96);
        bubble.fillRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 22);
        bubble.lineStyle(5, 0x6f4628, 1);
        bubble.strokeRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 22);
        bubble.lineStyle(2, 0xf8edc8, 0.9);
        bubble.strokeRoundedRect(panelX - panelWidth / 2 + 10, panelY - panelHeight / 2 + 10, panelWidth - 20, panelHeight - 20, 16);
        bubble.fillTriangle(panelX - 350, panelY + panelHeight / 2 - 4, panelX - 290, panelY + panelHeight / 2 - 4, panelX - 332, panelY + panelHeight / 2 + 42);
        bubble.lineStyle(5, 0x6f4628, 1);
        bubble.strokeTriangle(panelX - 350, panelY + panelHeight / 2 - 4, panelX - 290, panelY + panelHeight / 2 - 4, panelX - 332, panelY + panelHeight / 2 + 42);

        this.speakerText = this.add.text(panelX - panelWidth / 2 + 44, panelY - panelHeight / 2 + 28, "", {
            fontFamily: "Georgia, serif",
            fontSize: "25px",
            color: "#6b2f16",
            fontStyle: "bold"
        }).setDepth(22);

        this.bodyText = this.add.text(panelX - panelWidth / 2 + 44, panelY - panelHeight / 2 + 72, "", {
            fontFamily: "Arial, sans-serif",
            fontSize: "25px",
            color: "#2a1b12",
            lineSpacing: 8,
            wordWrap: { width: panelWidth - 88 }
        }).setDepth(22);

        this.progressText = this.add.text(panelX + panelWidth / 2 - 44, panelY + panelHeight / 2 - 32, "", {
            fontFamily: "Arial, sans-serif",
            fontSize: "17px",
            color: "#7e5936"
        }).setOrigin(1, 0.5).setDepth(22);

        this.nextHint = this.add.text(panelX, panelY + panelHeight / 2 - 32, "Clique, Espaço ou Enter para continuar", {
            fontFamily: "Arial, sans-serif",
            fontSize: "18px",
            color: "#7e5936",
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(22);

        this.tweens.add({
            targets: this.nextHint,
            alpha: 0.35,
            duration: 850,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
    }

    showPage(pageIndex) {
        const page = STORY_PAGES[pageIndex];
        this.currentText = page.text;
        this.speakerText.setText(page.speaker);
        this.bodyText.setText("");
        this.progressText.setText(`${pageIndex + 1}/${STORY_PAGES.length}`);
        this.typeText(page.text);
    }

    typeText(text) {
        this.isTyping = true;
        let visibleCharacters = 0;

        if (this.typeEvent) {
            this.typeEvent.remove(false);
        }

        this.typeEvent = this.time.addEvent({
            delay: 20,
            repeat: text.length - 1,
            callback: () => {
                visibleCharacters += 1;
                this.bodyText.setText(text.slice(0, visibleCharacters));

                if (visibleCharacters >= text.length) {
                    this.isTyping = false;
                }
            }
        });
    }

    advanceStory() {
        if (this.isTyping) {
            if (this.typeEvent) {
                this.typeEvent.remove(false);
            }
            this.bodyText.setText(this.currentText);
            this.isTyping = false;
            return;
        }

        this.currentPage += 1;

        if (this.currentPage >= STORY_PAGES.length) {
            this.cameras.main.fadeOut(650, 0, 0, 0);
            this.cameras.main.once("camerafadeoutcomplete", () => {
                this.scene.start("Fase1Scene");
            });
            return;
        }

        this.showPage(this.currentPage);
    }
}