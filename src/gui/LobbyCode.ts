import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class LobbyCode extends ChildComponent {

    private parentElt: HTMLElement;
    private elt: HTMLElement;

    private code: string | undefined;

    constructor() {
        super();

        this.parentElt = DomHandler.getElement(".lobby-code");
        this.elt = DomHandler.getElement(".lobby-code-text", this.parentElt);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.LOBBY_CODE, this.onLobbyCode);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.LOBBY_CODE, this.onLobbyCode);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onClick);
        this.reset();
    }

    private onLobbyCode(code: string) {
        this.elt.textContent = "Lobby Code: " + code;
        this.code = code;
        this.parentElt.style.setProperty("display", "block", "important");
    }

    private onClick(clickEvent: MouseEvent) {
        if (clickEvent.target === this.elt) {

            document.addEventListener("copy", (event: ClipboardEvent) => {
                event.clipboardData!.setData("text/plain", this.code!);
                event.preventDefault();
            }, {
                once: true,
            });

            document.execCommand("copy");
        }
    }

    private reset() {
        this.elt.textContent = "";
        this.parentElt.style.display = "";
        this.code = undefined;
    }
}
