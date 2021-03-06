import EventHandler from "./EventHandler";

const gameCanvas = document.querySelector("#game-canvas") as HTMLCanvasElement;

const guiBlockers: Set<HTMLElement> = new Set();

let guiInterference: boolean = false;

export default class DomHandler {
    public static getDisplayDimensions() {
        return displayDimensions;
    }

    public static requestPointerLock() {
        if (gameCanvas) {
            gameCanvas.requestPointerLock();
        } else {
            (document.documentElement as HTMLElement).requestPointerLock();
        }
    }

    public static exitPointerLock() {
        nextPointerLockExitInvoked = true;
        document.exitPointerLock();
    }

    public static hasPointerLock() {
        return document.pointerLockElement !== null;
    }

    public static requestFullscreen() {
        (document.documentElement as HTMLElement).requestFullscreen();
    }

    public static exitFullscreen() {
        document.exitFullscreen();
    }

    public static getElement(query: string, parent?: HTMLElement): HTMLElement {
        let elt: HTMLElement;

        if (parent) {
            elt = parent.querySelector(query) as HTMLElement;
        } else {
            elt = document.querySelector(query) as HTMLElement;
        }
        return elt;
    }
    public static getElements(query: string, parent?: HTMLElement): NodeListOf<HTMLElement> {
        if (parent) {
            return parent.querySelectorAll(query);
        } else {
            return document.querySelectorAll(query);
        }
    }

    public static getCanvas() {
        return gameCanvas;
    }

    public static getMouseCoordinates() {
        return mousePosition;
    }

    public static addGUIMouseBlocker(element: HTMLElement) {
        guiBlockers.add(element);
    }

    public static removeGUIMouseBlocker(element: HTMLElement) {
        guiBlockers.delete(element);
    }

    public static setInterference(interference: boolean) {
        guiInterference = interference;
    }

  public static createElement(tagName: string, classList?: string[], textContent?: string, id?: string) {
        const elt = document.createElement(tagName);

        if (classList) {
            for (const cls of classList) {
                elt.classList.add(cls);
            }
        }

        if (textContent) {
            elt.textContent = textContent;
        }

        if (id) {
            elt.id = id;
        }

        return elt;
    }
}

let nextPointerLockExitInvoked = false;

const displayDimensions = {
    width: window.innerWidth,
    height: window.innerHeight,
};

const mousePosition = {
    x: 0,
    y: 0,
};

const events = new Map([
    ["resize", EventHandler.Event.DOM_RESIZE],
    ["mousemove", EventHandler.Event.DOM_MOUSEMOVE],
    ["keydown", EventHandler.Event.DOM_KEYDOWN],
    ["keyup", EventHandler.Event.DOM_KEYUP],
    ["pointerlockerror", EventHandler.Event.DOM_POINTERLOCKERROR],
    ["blur", EventHandler.Event.DOM_BLUR],
    ["focus", EventHandler.Event.DOM_FOCUS],
    ["wheel", EventHandler.Event.DOM_WHEEL],
    ["touchstart", EventHandler.Event.DOM_TOUCHSTART],
    ["touchmove", EventHandler.Event.DOM_TOUCHMOVE],
    ["touchend", EventHandler.Event.DOM_TOUCHEND],
    ["beforeunload", EventHandler.Event.DOM_BEFOREUNLOAD],
    ["visibilitychange", EventHandler.Event.DOM_VISIBILITYCHANGE],
]);

const windowEventTitles = ["resize", "blur", "focus", "click", "beforeunload"];
const guiBlockedEvents = new Map([
    ["mouseup", [EventHandler.Event.DOM_GUI_MOUSEUP, EventHandler.Event.DOM_MOUSEUP]],
    ["mousedown", [EventHandler.Event.DOM_GUI_MOUSEDOWN, EventHandler.Event.DOM_MOUSEDOWN]],
    ["click", [EventHandler.Event.DOM_GUI_CLICK, EventHandler.Event.DOM_CLICK]],
    ["contextmenu", [EventHandler.Event.DOM_GUI_CLICK, EventHandler.Event.DOM_CLICK]],
 ]);

const eventsIterator = events.entries();
let eventsNext = eventsIterator.next();

while (!eventsNext.done) {
    const eventTitle = eventsNext.value[0];
    const eventHandlerEvent = eventsNext.value[1];

    if (windowEventTitles.includes(eventTitle)) {
        window.addEventListener(eventTitle, (event) => {
            EventHandler.callEvent(eventHandlerEvent, event);
        });
    } else {
        document.addEventListener(eventTitle, (event) => {
            EventHandler.callEvent(eventHandlerEvent, event);
        });
    }
    eventsNext = eventsIterator.next();
}

const guiBlockedEventsIterator = guiBlockedEvents.entries();
let guiBlockedEventsNext = guiBlockedEventsIterator.next();

while (!guiBlockedEventsNext.done) {
    const eventTitle = guiBlockedEventsNext.value[0];
    const eventList = guiBlockedEventsNext.value[1];

    const handler = (event: any) => {
        DomHandler.setInterference(false);
        EventHandler.callEvent(eventList[0], event); // Call GUI Event
        if (event.button === 0 && eventTitle === "click") {
            EventHandler.callEvent(EventHandler.Event.DOM_GUI_CLICK_PRIMARY, event);
        }
        if (!guiInterference) {
            EventHandler.callEvent(eventList[1], event); // Call regular event
            if (event.button === 0 && eventTitle === "click") {
                EventHandler.callEvent(EventHandler.Event.DOM_CLICK_PRIMARY, event);
            }
        }
        DomHandler.setInterference(false);
    };

    if (windowEventTitles.includes(eventTitle)) {
        window.addEventListener(eventTitle, handler);
    } else {
        document.addEventListener(eventTitle, handler);
    }
    guiBlockedEventsNext = guiBlockedEventsIterator.next();
}

document.addEventListener("pointerlockchange", () => {
    if (DomHandler.hasPointerLock()) {
        EventHandler.callEvent(EventHandler.Event.DOM_POINTERLOCK_ENABLE);
    } else {
        if (nextPointerLockExitInvoked) {
            EventHandler.callEvent(EventHandler.Event.DOM_POINTERLOCK_DISABLE_INVOKED);
            nextPointerLockExitInvoked = false;
        } else {
            EventHandler.callEvent(EventHandler.Event.DOM_POINTERLOCK_DISABLE);
        }
    }
});

const onFullscreenChange = () => {
    // @ts-ignore
    if (document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement) {
        EventHandler.callEvent(EventHandler.Event.DOM_FULLSCREEN_ENABLED);
    } else {
        EventHandler.callEvent(EventHandler.Event.DOM_FULLSCREEN_DISABLED);
    }
};

document.addEventListener("fullscreenchange", onFullscreenChange);
document.addEventListener("webkitfullscreenchange", onFullscreenChange);
document.addEventListener("mozfullscreenchange", onFullscreenChange);
document.addEventListener("msfullscreenchange", onFullscreenChange);

// @ts-ignore
document.exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;

const docElt = document.documentElement as HTMLElement;
// @ts-ignore
docElt.requestFullscreen = docElt.requestFullscreen || docElt.mozRequestFullScreen || docElt.webkitRequestFullscreen || docElt.msRequestFullscreen;

EventHandler.addListener(undefined, EventHandler.Event.DOM_RESIZE, () => {
    displayDimensions.width = window.innerWidth;
    displayDimensions.height = window.innerHeight;
}, EventHandler.Level.LOW);

EventHandler.addListener(undefined, EventHandler.Event.DOM_MOUSEMOVE, (event) => {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
}, EventHandler.Level.LOW);

document.oncontextmenu = () => false;
document.addEventListener("keydown", (event) => {
    if ((document.activeElement as Element).nodeName !== "INPUT") {
        event.preventDefault();

    }
});
