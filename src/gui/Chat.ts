import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";
import Options from "../Options";
import PacketSender from "../PacketSender";

export default class Chat extends ChildComponent {

    private static readonly MAX_MESSAGE_COUNT = 100;
    private static readonly MAX_VISIBLE_COUNT = 10;
    private static readonly MAX_PREVIEW_COUNT = 5;

    private container: HTMLElement;
    private messageContainer: HTMLElement;
    private inputElt: HTMLInputElement;
    private previewContainer: HTMLElement;

    private messages: HTMLElement[];
    private messageOffset: number;
    private listenerAdded: boolean;

    constructor(parent: HTMLElement) {
        super();

        this.container = DomHandler.getElement(".chat-container", parent);
        this.messageContainer = DomHandler.getElement(".chat-message-container", this.container);
        this.inputElt = DomHandler.getElement(".chat-input", this.container) as HTMLInputElement;
        this.previewContainer = DomHandler.getElement(".chat-preview-container", parent);

        this.messages = [];
        this.messageOffset = 0;
        this.listenerAdded = false;

        Globals.setGlobal(Globals.Global.CHAT_OPEN, false);

    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
        EventHandler.addListener(this, EventHandler.Event.CHAT_UPDATE, this.onChatUpdate);
        EventHandler.addListener(this, EventHandler.Event.DOM_BLUR, this.hideChat);
        this.previewContainer.style.display = "block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);
        EventHandler.removeListener(this, EventHandler.Event.CHAT_UPDATE, this.onChatUpdate);
        EventHandler.removeListener(this, EventHandler.Event.DOM_BLUR, this.hideChat);
        this.clearMessages();

        this.hideChat();

        this.messages = [];
        this.previewContainer.style.display = "";
    }

    private onKeyUp(event: KeyboardEvent) {
        if (event.code === Options.options.chatOpen.code && !Globals.getGlobal(Globals.Global.GAME_MENU_OPEN) && !Globals.getGlobal(Globals.Global.CHAT_OPEN)) {
            this.showChat();
        } else if (event.code === "Escape" && Globals.getGlobal(Globals.Global.CHAT_OPEN) && !Globals.getGlobal(Globals.Global.GAME_MENU_OPEN)) {
            this.hideChat();
        } else if (event.code === "Enter" && Globals.getGlobal(Globals.Global.CHAT_OPEN) && !Globals.getGlobal(Globals.Global.GAME_MENU_OPEN)) {
            this.sendMessage();
            this.hideChat();
        }
    }

    private onChatUpdate(data: any) {
        const newMessageElt = this.constructChatMessage(data);

        this.messages.push(newMessageElt);
        const messageCount = this.messages.length;
        const extraCount = messageCount - Chat.MAX_MESSAGE_COUNT;
        if (extraCount > 0) {
            this.messages.splice(0, extraCount);
        }

        if (!Globals.getGlobal(Globals.Global.CHAT_OPEN)) {
            const previewMessageElt = newMessageElt.cloneNode(true) as HTMLElement;
            this.previewContainer.appendChild(previewMessageElt);
            this.removeOldPreviewMessages();
            setTimeout(() => {
                if (this.previewContainer.contains(previewMessageElt)) {
                    previewMessageElt.style.opacity = "0";
                    setTimeout(() => {
                        if (this.previewContainer.contains(previewMessageElt)) {
                            this.previewContainer.removeChild(previewMessageElt);
                        }
                    }, 500);
                }
            }, 5000);
        }
    }

    private sendMessage() {
        const message = this.inputElt.value.trim();
        if (message) {
            PacketSender.sendChatMessage(message);
        }
    }

    private showChat() {
        this.hidePreview();
        this.setMessages();
        EventHandler.addListener(this, EventHandler.Event.DOM_WHEEL, this.onWheel);
        this.listenerAdded = true;
        this.container.style.display = "flex";
        this.inputElt.focus();
        Globals.setGlobal(Globals.Global.CHAT_OPEN, true);
        EventHandler.callEvent(EventHandler.Event.CHAT_OPEN);
    }

    private hideChat() {
        this.inputElt.value = "";
        this.messageOffset = 0;
        if (this.listenerAdded) {
            EventHandler.removeListener(this, EventHandler.Event.DOM_WHEEL, this.onWheel);
            this.listenerAdded = false;
        }
        this.container.style.display = "";
        this.previewContainer.style.display = "block";
        Globals.setGlobal(Globals.Global.CHAT_OPEN, false);
        EventHandler.callEvent(EventHandler.Event.CHAT_CLOSE);
    }

    private hidePreview() {
        while (this.previewContainer.firstChild) {
            this.previewContainer.removeChild(this.previewContainer.firstChild);
        }
        this.previewContainer.style.display = "";
    }

    private clearMessages() {
        while (this.messageContainer.firstChild) {
            this.messageContainer.removeChild(this.messageContainer.firstChild);
        }
    }

    private constructChatMessage(data: any) {
        const elements = [];
        for (const segment of data) {
            const element = document.createElement("span");
            element.textContent = segment.text;
            element.style.color = this.getCSSColorString(segment.color);
            elements.push(element);
        }

        const messageElt = document.createElement("div");
        messageElt.classList.add("chat-message");
        for (const element of elements) {
            messageElt.appendChild(element);
        }

        return messageElt;
    }

    private getCSSColorString(value: number) {
        let cssValue = value.toString(16);
        while (cssValue.length < 6) {
            cssValue = "0" + cssValue;
        }
        return "#" + cssValue;
    }

    private removeOldPreviewMessages() {
        while (this.previewContainer.childElementCount > Chat.MAX_PREVIEW_COUNT) {
            this.previewContainer.removeChild(this.previewContainer.firstChild as Node);
        }
    }

    private setMessages() {
        this.clearMessages();
        const messageCount = this.messages.length;
        if (messageCount) {
            // for (let i = messageCount - this.messageOffset - 1; i  > Math.min(Chat.MAX_VISIBLE_COUNT, messageCount); i --) {
            //     this.messageContainer.insertBefore(this.messages[i], this.messageContainer.firstChild);
            // }
            for (let i = 0; i < Math.min(Chat.MAX_VISIBLE_COUNT, messageCount); i ++) {
                this.messageContainer.insertBefore(this.messages[messageCount - i - 1 - this.messageOffset], this.messageContainer.firstChild);
            }
        }

    }

    private onWheel(event: MouseWheelEvent) {
        if (event.deltaY > 0) {
            this.messageOffset = Math.max(this.messageOffset - 1, 0);
        } else if (event.deltaY < 0) {
            this.messageOffset = Math.min(this.messageOffset + 1, Math.max(this.messages.length - Chat.MAX_VISIBLE_COUNT, 0));
        }
        this.setMessages();
    }
}