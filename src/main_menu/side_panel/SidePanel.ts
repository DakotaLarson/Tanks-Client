import ChildComponent from "../../component/ChildComponent";
import DomHandler from "../../DomHandler";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import RankCalculator from "../../RankCalculator";
import ArenaCreator from "./creator/ArenaCreator";
import PlayerFinder from "./PlayerFinder";
import PlayerStats from "./PlayerStats";

export default class SidePanel extends ChildComponent {

    private topContainer: HTMLElement;

    private playerStats: PlayerStats;
    private playerFinder: PlayerFinder;
    private arenaCreator: ArenaCreator;

    private lastAttachedChild: ChildComponent | undefined;

    private usernameElt: HTMLElement;

    private dataContainer: HTMLElement;
    private levelElt: HTMLElement;
    private rankElt: HTMLElement;

    private messageElt: HTMLElement;

    private statsBtn: HTMLElement;
    private findBtn: HTMLElement;
    private createBtn: HTMLElement;

    private backBtn: HTMLElement;

    constructor(menuElt: HTMLElement) {
        super();

        this.topContainer = DomHandler.getElement(".side-panel-top", menuElt);

        this.playerStats = new PlayerStats(menuElt);
        this.playerFinder = new PlayerFinder(menuElt);
        this.arenaCreator = new ArenaCreator(menuElt);

        this.usernameElt = DomHandler.getElement(".side-panel-username", this.topContainer);

        this.dataContainer = DomHandler.getElement(".data-container", this.topContainer);
        this.levelElt = DomHandler.getElement(".side-panel-level", this.topContainer);
        this.rankElt = DomHandler.getElement(".side-panel-rank", this.topContainer);

        this.messageElt = DomHandler.getElement(".side-panel-message", this.topContainer);

        this.statsBtn = DomHandler.getElement("#side-panel-stats", this.topContainer);
        this.findBtn = DomHandler.getElement("#side-panel-find", this.topContainer);
        this.createBtn = DomHandler.getElement("#side-panel-create", this.topContainer);

        this.backBtn = DomHandler.getElement(".side-panel-back", menuElt);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
        EventHandler.addListener(this, EventHandler.Event.USERNAME_UPDATE, this.onUsernameUpdate);

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onStatsClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onFindClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onCreateClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onBackClick);

        const authToken = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        if (authToken) {
            this.onSignIn(authToken);
        } else {
            this.onSignOut();
        }
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.removeListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
        EventHandler.removeListener(this, EventHandler.Event.USERNAME_UPDATE, this.onUsernameUpdate);

        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onStatsClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onFindClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onCreateClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onBackClick);

        this.attach(undefined);
    }

    private onSignIn(token: string) {
        this.updateStats(token);
        this.messageElt.style.display = "none";

        if (this.lastAttachedChild) {
            this.attach(undefined);
        }
    }

    private onSignOut() {
        this.updateStats();
        this.messageElt.style.display = "";

        if (this.lastAttachedChild) {
            this.attach(undefined);
        }
    }

    private onUsernameUpdate(username?: string) {
        if (username) {
            this.usernameElt.style.display = "block";
            this.usernameElt.textContent = username;
        } else {
            this.usernameElt.style.display = "";
        }
    }

    private onStatsClick(event: MouseEvent) {
        if (event.target === this.statsBtn && !this.statsBtn.classList.contains("disabled")) {
            this.attach(this.playerStats);
        }
    }

    private onFindClick(event: MouseEvent) {
        if (event.target === this.findBtn) {
            this.attach(this.playerFinder);
        }
    }

    private onCreateClick(event: MouseEvent) {
        if (event.target === this.createBtn) {
            this.attach(this.arenaCreator);
        }
    }

    private onBackClick(event: MouseEvent) {
        if (event.target === this.backBtn) {
            this.attach(undefined);
        }
    }

    private async updateStats(token?: string) {
        if (token) {
            const stats = await this.retrieveStats(token);
            this.updateRankAndLevel(stats);
            this.dataContainer.style.display = "grid";
            this.statsBtn.classList.remove("disabled");
            this.playerStats.updateStats(stats);
        } else {
            this.dataContainer.style.display = "";
            this.statsBtn.classList.add("disabled");
            this.playerStats.updateStats(undefined);
        }
    }

    private updateRankAndLevel(stats: any) {
        const data = RankCalculator.getData(stats.points);
        this.rankElt.textContent = data.rank;
        this.levelElt.textContent = data.level;
    }

    private async retrieveStats(authToken: string) {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const body = JSON.stringify({
            token: authToken,
        });

        try {
            const response = await fetch(address + "/playerstats", {
                method: "post",
                mode: "cors",
                credentials: "omit",
                body,
                headers: {
                    "content-type": "application/json",
                },
            });
            return response.json();
        } catch (err) {
            console.error(err);
        }
    }

    private attach(child: ChildComponent | undefined) {
        if (child) {

            this.attachChild(child);
            this.topContainer.style.display = "none";
            this.backBtn.style.display = "inline-block";
            this.lastAttachedChild = child;

        } else {
            // back button clicked

            if (this.lastAttachedChild) {
                this.detachChild(this.lastAttachedChild);
                this.lastAttachedChild = undefined;
            }

            this.topContainer.style.display = "block";
            this.backBtn.style.display = "none";

        }
    }
}