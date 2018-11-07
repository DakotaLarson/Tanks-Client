import { PerspectiveCamera} from "three";
import EventHandler from "../../../EventHandler";
import Camera from "../Camera";

export default class SingleplayerCamera extends Camera {

    private usingTools: boolean;

    constructor(camera: PerspectiveCamera) {
        super(camera);
        this.usingTools = false;
    }

    public enable() {
        super.enable();
        this.controls.zoomOnly = false;
        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK, this.onToggleToOther);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_GAMESPAWN, this.onToggleToOther);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_INITIALSPAWN, this.onToggleToOther);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_TEAM_A, this.onToggleToOther);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_TEAM_B, this.onToggleToOther);

        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA, this.onToggleToCamera);

        EventHandler.addListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onArenaSceneUpdate);

        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        this.usingTools = false;
        this.attachChild(this.controls);
    }

    public disable() {
        super.disable();
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK, this.onToggleToOther);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_GAMESPAWN, this.onToggleToOther);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_INITIALSPAWN, this.onToggleToOther);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_TEAM_A, this.onToggleToOther);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_TEAM_B, this.onToggleToOther);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA, this.onToggleToCamera);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onArenaSceneUpdate);

        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        this.detachChild(this.controls);
    }

    private onToggleToCamera() {
        this.usingTools = false;
        this.attachChild(this.controls);
    }

    private onToggleToOther() {
        this.usingTools = true;
        this.detachChild(this.controls);
    }

    private onGameMenuOpen() {
        if (!this.usingTools) {
            this.detachChild(this.controls);
        }
    }

    private onGameMenuClose() {
        if (!this.usingTools) {
            this.attachChild(this.controls);
        }
    }
}
