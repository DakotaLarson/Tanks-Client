import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";

export default class VotingMenu extends Component {

    private static readonly STARTING_MESSAGE = "Match Starting Up!";
    private static readonly WAITING_MESSAGE = "Waiting for more players...";

    private parentElt: HTMLElement;
    private messageElt: HTMLElement;
    private disconnectElt: HTMLElement;
    private lastMatchStatisticsElt: HTMLElement;
    private recordingElt: HTMLElement;

    constructor(parent: HTMLElement) {
        super();
        this.parentElt = DomHandler.getElement(".section-voting", parent);
        this.messageElt = DomHandler.getElement(".message", this.parentElt);
        this.disconnectElt = DomHandler.getElement(".option-disconnect", this.parentElt);
        this.lastMatchStatisticsElt = DomHandler.getElement(".last-match-statistics", this.parentElt);
        this.recordingElt = DomHandler.getElement(".recording-start-btn", this.parentElt);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);
        DOMMutationHandler.show(this.parentElt);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);
        DOMMutationHandler.hide(this.parentElt);
        this.clearStats();
        this.updateMessage(true);
        this.recordingElt.textContent = "Record This Match!";
    }

    public updateStatistics(elt: HTMLElement) {
        this.clearStats();
        DOMMutationHandler.add(elt, this.lastMatchStatisticsElt);
    }

    public updateMessage(isStarting: boolean) {
        if (isStarting) {
            this.messageElt.textContent = VotingMenu.STARTING_MESSAGE;
        } else {
            this.messageElt.textContent = VotingMenu.WAITING_MESSAGE;
        }
    }

    private onClick(event: MouseEvent) {
        if (event.target === this.disconnectElt) {
            EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_DISCONNECT_REQUEST);
        } else if (event.target === this.recordingElt) {
            EventHandler.callEvent(EventHandler.Event.RECORDING_REQUEST);
            this.recordingElt.textContent = "Recording This Match!";
        }
    }

    private clearStats() {
        DOMMutationHandler.clear(this.lastMatchStatisticsElt);
    }
}
