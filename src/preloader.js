// Class to preload all the assets
// Remember you can load this assets in another scene if you need it
export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: "Preloader" });
    }

    preload() {
        this.loadPhasesMap();
        this.loadPlayerAssets();
        this.loadLogo();

        // Event to update the loading bar
        this.load.on("progress", (progress) => {
            console.log("Loading: " + Math.round(progress * 100) + "%");
        });
    }

    loadPhasesMap() {
        this.load.setPath("assets/map");
        
        this.load.image("tilesFase1", "spritesheet_floresta.png");
        this.load.tilemapTiledJSON("mapaFloresta", "mapa1_floresta.json");
        
        this.load.image("tilesFase2", "spritesheet_ossos.png");
        this.load.tilemapTiledJSON("mapaOssos", "mapa2_ossos.json"); 
    }

    loadPlayerAssets() {
        this.load.setPath("assets/tiny_swords_free_pack/Units/Black Units/Warrior");
        this.load.spritesheet("warrior-idle", "Warrior_Idle.png", {
            frameWidth: 192,
            frameHeight: 192,
        });
        this.load.spritesheet("warrior-run", "Warrior_Run.png", {
            frameWidth: 192,
            frameHeight: 192,
        });
        
        this.load.setPath("assets/tiny_swords_free_pack/Units/Black Units/Archer");
        this.load.spritesheet("archer-idle", "Archer_Idle.png", {
            frameWidth: 192,
            frameHeight: 192,
        });
        this.load.spritesheet("archer-run", "Archer_Run.png", {
            frameWidth: 192,
            frameHeight: 192,
        });

        this.load.setPath("assets/tiny_swords_free_pack/Units/Black Units/Lancer");
        this.load.spritesheet("lancer-idle", "Lancer_Idle.png", {
            frameWidth: 320,
            frameHeight: 320,
        });
        this.load.spritesheet("lancer-run", "Lancer_Run.png", {
            frameWidth: 320,
            frameHeight: 320,
        });

        this.load.setPath("assets/tiny_swords_free_pack/Units/Black Units/Monk");
        this.load.spritesheet("monk-idle", "Idle.png", {
            frameWidth: 192,
            frameHeight: 192,
        });
        this.load.spritesheet("monk-run", "Run.png", {
            frameWidth: 192,
            frameHeight: 192,
        });

        this.loadPlayerAvatars();
    }

    loadPlayerAvatars() {
        this.load.setPath("assets/tiny_swords_free_pack/UI Elements/UI Elements/Human Avatars")
        this.load.image("warrior-avatar", "Avatars_01.png");
        this.load.image("lancer-avatar", "Avatars_02.png");
        this.load.image("archer-avatar", "Avatars_03.png");
        this.load.image("monk-avatar", "Avatars_04.png");

    }

    loadLogo() {
        this.load.setPath("assets/tiny_swords_free_pack/UI Elements/UI Elements/Human Avatars")
        this.load.image("logo", "Avatars_01.png");
    }

    create() {
        // When all the assets are loaded go to the next scene
        this.scene.start("SplashScene");
    }
}