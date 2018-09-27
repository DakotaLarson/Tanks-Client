import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class CooldownBar extends ChildComponent {

    public barContainer: HTMLElement;
    public barParent: HTMLElement;
    public bar: HTMLElement;

    public cooldownTime: number;

    public cooldownStartTime: number;

    constructor(parentElt: HTMLElement, cooldownTime: number) {
        super();

        this.barContainer = DomHandler.getElement(".cooldown-bar-container", parentElt);
        this.barParent = DomHandler.getElement("#cooldown-parent", this.barContainer);
        this.bar = DomHandler.getElement(".cooldown-bar", this.barParent);

        this.cooldownTime = cooldownTime * 1000;

        this.cooldownStartTime = -1;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_SHOOT, this.onShoot);
        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);
        this.barContainer.style.display = "block";
        this.setPercentage(100);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_SHOOT, this.onShoot);
        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onUpdate);
        this.barContainer.style.display = "";
    }

    public onShoot() {
        this.setPercentage(0);
        this.cooldownStartTime = performance.now();
    }

    public onUpdate() {
        if (this.cooldownStartTime > -1) {
            const timeDiff = performance.now() - this.cooldownStartTime;
            let percentage = timeDiff / this.cooldownTime * 100;
            if (percentage >= 100) {
                percentage = 100;
                this.cooldownStartTime = -1;
            }
            this.setPercentage(percentage);
        }
    }

    public setPercentage(percentage: number) {
        this.bar.style.width = "" + percentage + "%";
    }
}
