import Component from "./component/Component";
import EventHandler from "./EventHandler";

export default class Options extends Component {

    public static options: any;

    constructor() {
        super();
        const rawOptions = localStorage.getItem("userOptions");
        if (rawOptions) {
            Options.options = JSON.parse(rawOptions);
        } else {
            Options.options = {};
        }
        if (!("chatEnabled" in Options.options)) {
            Options.options.chatEnabled = true;
        }
        if (!("killfeedEnabled" in Options.options)) {
            Options.options.killfeedEnabled = true;
        }
        if (!("metricsEnabled" in Options.options)) {
            Options.options.metricsEnabled = true;
        }
        if (!("gridlinesEnabled" in Options.options)) {
            Options.options.gridlinesEnabled = false;
        }
        if (!("lazyCamera" in Options.options)) {
            Options.options.lazyCamera = true;
        }
        if (!("autofixCamera" in Options.options)) {
            Options.options.autofixCamera = true;
        }
        if (!("fireworksEnabled" in Options.options)) {
            Options.options.fireworksEnabled = true;
        }
        if (!("gameTipsEnabled" in Options.options)) {
            Options.options.gameTipsEnabled = true;
        }
        if (!("touchEnabled" in Options.options)) {
            Options.options.touchEnabled = true;
        }
        if (!("forward" in Options.options)) {
            Options.options.forward = {
                key: "w",
                code: "KeyW",
                isMouse: false,
            };
        }
        if (!("backward" in Options.options)) {
            Options.options.backward = {
                key: "s",
                code: "KeyS",
                isMouse: false,
            };
        }
        if (!("left" in Options.options)) {
            Options.options.left = {
                key: "a",
                code: "KeyA",
                isMouse: false,
            };
        }
        if (!("right" in Options.options)) {
            Options.options.right = {
                key: "d",
                code: "KeyD",
                isMouse: false,
            };
        }
        if (!("shoot" in Options.options)) {
            Options.options.shoot = {
                key: 0,
                code: 0,
                isMouse: true,
            };
        }
        if (!("reload" in Options.options)) {
            Options.options.reload = {
                key: "r",
                code: "KeyR",
                isMouse: false,
            };
        }
        if (!("ram" in Options.options)) {
            Options.options.ram = {
                key: "e",
                code: "KeyE",
                isMouse: false,
            };
        }
        if (!("chatOpen" in Options.options)) {
            Options.options.chatOpen = {
                key: "Enter",
                code: "Enter",
                isMouse: false,
            };
        }

        if (!("playerList" in Options.options)) {
            Options.options.playerList = {
                key: "Tab",
                code: "Tab",
                isMouse: false,
            };
        }

        if (!("chatOpacity" in Options.options)) {
            Options.options.chatOpacity = 0.75;
        }

        if (!("musicVolume" in Options.options)) {
            Options.options.musicVolume = 0.5;
        }

        if (!("effectsVolume" in Options.options)) {
            Options.options.effectsVolume = 0.5;
        }
        if (!("engineVolume" in Options.options)) {
            Options.options.engineVolume = 0.5;
        }

        if (!("rotationSensitivity" in Options.options)) {
            Options.options.rotationSensitivity = 1.2;
        }

        localStorage.setItem("userOptions", JSON.stringify(Options.options));
    }

    // key = human readable
    // code = more precise
    public enable() {
        EventHandler.addListener(this, EventHandler.Event.OPTIONS_UPDATE, this.onOptionsUpdate);
    }

    public onOptionsUpdate(event: any) {
        const attribute = event.attribute;
        const data = event.data;
        const rawOptions = localStorage.getItem("userOptions");
        if (rawOptions) {
            const storedOptions = JSON.parse(rawOptions);
            storedOptions[attribute] = data;
            Options.options[attribute] = data;
            localStorage.setItem("userOptions", JSON.stringify(storedOptions));
        }
    }
}
