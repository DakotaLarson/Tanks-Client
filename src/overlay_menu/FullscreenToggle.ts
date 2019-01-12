import Component from "../component/Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class FullscreenToggle extends Component {

    private container: HTMLElement;

    private toggleOnElt: HTMLElement;
    private toggleOffElt: HTMLElement;

    private fullscreenEnabled: boolean;

    constructor(parent: HTMLElement) {
        super();

        this.container = DomHandler.getElement(".fullscreen-toggle", parent);
        this.toggleOnElt = DomHandler.getElement("#fullscreen-toggle-on", this.container);
        this.toggleOffElt = DomHandler.getElement("#fullscreen-toggle-off", this.container);

        this.fullscreenEnabled = false;
    }

    public enable() {
        this.container.style.display = "block";
        this.toggleOnElt.style.display = "block";
        this.fullscreenEnabled = false;
        EventHandler.addListener(this, EventHandler.Event.DOM_GUI_MOUSEDOWN, this.onMousedown);
        EventHandler.addListener(this, EventHandler.Event.DOM_FULLSCREEN_ENABLED, this.onFullscreenEnable);
        EventHandler.addListener(this, EventHandler.Event.DOM_FULLSCREEN_DISABLED, this.onFullscreenDisable);

    }

    private onMousedown(event: MouseEvent) {
        if (event.target === this.container || this.container.contains(event.target as Node)) {
            if (this.fullscreenEnabled) {
                DomHandler.exitFullscreen();
            } else {
                DomHandler.requestFullscreen();
            }
            DomHandler.setInterference(true);
        }
    }

    private onFullscreenEnable() {
        this.toggleOnElt.style.display = "";
        this.toggleOffElt.style.display = "block";

        this.fullscreenEnabled = true;
    }

    private onFullscreenDisable() {
        this.toggleOnElt.style.display = "block";
        this.toggleOffElt.style.display = "";

        this.fullscreenEnabled = false;
    }
}