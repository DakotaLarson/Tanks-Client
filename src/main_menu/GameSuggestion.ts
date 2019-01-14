import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";

export default class GameSuggestion extends ChildComponent {

    private static readonly MESSAGE_INTERVAL = 5000;

    private element: HTMLElement;
    private messages: string[];
    private taskId: number | undefined;

    constructor(menu: HTMLElement) {
        super();
        this.element = DomHandler.getElement(".game-suggestion", menu);
        this.messages = [
            "Create an arena and submit your creation on the Discord server",
            "You reload 3x faster when you don't move!",
            "Holding down the secondary mouse button locks the camera!",
            "Press 'Enter' to chat with other players!",
            "Want the full immersive experience? Go fullscreen!",
            "Want to move your turret independently? Switch to standard controls in the options menu!",
            "Pick up powerups to gain an advantage!",
            "Remember you only respawn twice... Be careful!",
            "You are protected for 3 seconds after you spawn. Make it count!",
        ];
    }

    public enable() {
        this.taskId = this.cycleMessages();
    }

    public disable() {
        window.clearInterval(this.taskId);
    }

    private cycleMessages() {
        let messageIndex = this.getRandomInt(0, this.messages.length);
        this.updateMessage(messageIndex);

        return window.setInterval(() => {
            messageIndex = this.getNextMessageIndex(messageIndex);
            this.updateMessage(messageIndex);
        }, GameSuggestion.MESSAGE_INTERVAL);
    }

    private updateMessage(messageIndex: number) {
        this.element.textContent = this.messages[messageIndex];
        this.toggleClasses();
        window.setTimeout(() => {
            this.toggleClasses();
        }, GameSuggestion.MESSAGE_INTERVAL - 1000);
    }

    private getNextMessageIndex(lastMessageIndex: number) {
        let newMessageIndex;
        do {
            newMessageIndex = this.getRandomInt(0, this.messages.length);
        } while (newMessageIndex === lastMessageIndex);
        return newMessageIndex;
    }

    private getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    private toggleClasses() {
        this.element.classList.toggle("game-suggestion-hidden");
        this.element.classList.toggle("game-suggestion-visible");
    }
}
