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

        // Load all the assets
        this.load.setPath("assets");
        this.load.image("logo", "logo.png");
        this.load.image("floor");
        this.load.image("background", "background.png");

        this.load.image("player", "player/player.png");
        this.load.atlas("propulsion-fire", "player/propulsion/propulsion-fire.png", "player/propulsion/propulsion-fire_atlas.json");
        this.load.animation("propulsion-fire-anim", "player/propulsion/propulsion-fire_anim.json");

        // Bullets
        this.load.image("bullet", "player/bullet.png");
        this.load.image("flares")

        this.load.setPath("assets/tiny_swords_free_pack/Units/Red Units/Pawn");
        this.load.spritesheet("pawn_enemy_red", "Pawn_Idle.png", {
            frameWidth: 192,
            frameHeight: 192,
        });

        this.load.setPath("assets/tiny_swords_free_pack/Units/Blue Units/Lancer");
        this.load.spritesheet("lancer_enemy_blue", "Lancer_Idle.png", {
            frameWidth: 192,
            frameHeight: 192,
        });

        this.load.setPath("assets");

        // Fonts
        this.load.bitmapFont("pixelfont", "fonts/pixelfont.png", "fonts/pixelfont.xml");
        this.load.image("knighthawks", "fonts/knight3.png");

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