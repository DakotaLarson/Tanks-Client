import Component from "../../component/Component";
import DomHandler from "../../DomHandler";
import DOMMutationHandler from "../../DOMMutationHandler";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import Confirmation from "../../gui/Confirmation";
import { IStore, IStoreObject } from "../../interfaces/IStore";
import ColorStore from "./ColorStore";
import CurrencyStore from "./CurrencyStore";
import { ActionState, StoreItem } from "./StoreItem";

export default class Store extends Component {

    private parentElt: HTMLElement;
    private containerElt: HTMLElement;
    private currencyElt: HTMLElement;
    private moreCurrencyBtn: HTMLElement;

    private level: number;
    private currency: number;

    private selectedItem: StoreItem | undefined;
    private storeItems: StoreItem[];

    private colorStore: ColorStore;
    private currencyStore: CurrencyStore;

    private colors: Map<string, IStoreObject>;

    private visible: boolean;

    constructor() {
        super();

        this.parentElt = DomHandler.getElement(".side-panel-store");
        this.containerElt = DomHandler.getElement(".store-container", this.parentElt);
        this.currencyElt = DomHandler.getElement(".store-currency", this.parentElt);
        this.moreCurrencyBtn = DomHandler.getElement(".store-more-currency", this.parentElt);

        this.level = 0;
        this.currency = 0;

        this.storeItems = [];

        this.colorStore = new ColorStore(this.level, this.currency);
        this.currencyStore = new CurrencyStore();

        this.colors = new Map();

        this.visible = false;

    }

    public async enable() {
        EventHandler.addListener(this, EventHandler.Event.STORE_ITEM_PURCHASE, this.onPurchase);
        EventHandler.addListener(this, EventHandler.Event.STORE_ITEM_SELECTION, this.onSelection);
        EventHandler.addListener(this, EventHandler.Event.STORE_ITEM_COLOR_SELECTION, this.onStoreItemColorSelection);
        EventHandler.addListener(this, EventHandler.Event.STORE_ITEM_MORE_COLORS_VIEW, this.onStoreItemMoreColorsView);
        EventHandler.addListener(this, EventHandler.Event.STORE_ITEM_MORE_COLORS_PURCHASE, this.onStoreItemMoreColorsPurchase);
        EventHandler.addListener(this, EventHandler.Event.OVERLAY_CLOSE, this.onOverlayClose);
        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
        EventHandler.addListener(this, EventHandler.Event.PAYMENT_CURRENCY_UPDATE, this.onPaymentCurrencyUpdate);

        this.attachComponent(this.currencyStore);
    }

    public show() {
        DOMMutationHandler.show(this.parentElt);
        EventHandler.callEvent(EventHandler.Event.STORE_OPEN);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);

        this.visible = true;

        const authToken = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        this.updateStore(authToken);
    }

    public hide() {
        DOMMutationHandler.hide(this.parentElt);
        EventHandler.callEvent(EventHandler.Event.STORE_CLOSE);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);

        this.visible = false;
    }

    public updateStats(level: number, currency: number) {
        this.level = level;
        this.currency = currency;

        for (const storeItem of this.storeItems) {
            storeItem.updateStats(level, currency);
        }

        this.colorStore.updateStats(level, currency);

        this.currencyElt.textContent = "Currency: " + this.currency;
    }

    private onPaymentCurrencyUpdate(currency: number) {
        this.updateStats(this.level, currency);
    }

    private onSignIn(token: string) {
        if (this.visible) {
            this.updateStore(token);
        }
    }

    private onSignOut() {
        if (this.visible) {
            this.updateStore();
        }
    }

    private onClick(event: MouseEvent) {
        if (event.target === this.moreCurrencyBtn && !this.moreCurrencyBtn.classList.contains("btn-disabled")) {
            EventHandler.callEvent(EventHandler.Event.CURRENCY_STORE_REQUEST);
        }
    }

    private async onPurchase(storeItem: StoreItem) {
        const confirmation = await Confirmation.confirm("Purchase " + storeItem.title + " for " + storeItem.price + "?");
        if (confirmation) {
            const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
            if (token) {
                const requestStatus = await this.postStore(token, [["purchase", storeItem.title]]);
                if (requestStatus === 200) {

                    storeItem.updateAction(ActionState.SELECT);

                    const newCurrency = this.currency - storeItem.price;
                    this.updateStats(this.level, newCurrency);
                } else {
                    alert("Error purchasing store item: " + requestStatus + ". Please report this.");
                }
            }
        }
    }

    private async onSelection(storeItem: StoreItem) {
        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        if (token) {
            const requestStatus = await this.postStore(token, [["selection", storeItem.title]]);
            if (requestStatus === 200) {
                if (this.selectedItem) {
                    this.selectedItem.updateAction(ActionState.SELECT);
                }

                storeItem.updateAction(ActionState.SELECTED);
                this.propagateSelection(storeItem);

                this.selectedItem = storeItem;
            } else {
                alert("Error selecting store item: " + requestStatus + ". Please report this.");
            }
        }
    }

    private async onStoreItemColorSelection(event: any) {

        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        if (token) {
            const requestStatus = await this.postStore(token, [
                ["selection", event.id],
                ["parent", event.item.title],
                ["position", event.index],
            ]);
            if (requestStatus !== 200) {
                alert("Error selecting store item color: " + requestStatus + ". Please report this.");
            } else {
                this.propagateColorSelection(event.id, event.index);
            }
        }
    }

    private onStoreItemMoreColorsView() {
        this.colorStore.update(this.selectedItem!);
        this.attachChild(this.colorStore);
    }

    private async onStoreItemMoreColorsPurchase(purchase: string) {
        const price = this.colors.get(purchase)!.price;
        const confirmation = await Confirmation.confirm("Purchase " + purchase + " for " + price + "?");
        if (confirmation) {
            const parent = this.selectedItem!;

            const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
            if (token) {
                const requestStatus = await this.postStore(token, [["purchase", purchase], ["parent", parent.title]]);
                if (requestStatus === 200) {
                    this.colorStore.handlePurchase(purchase);
                    parent.addColor(purchase, this.colors.get(purchase)!.detail);

                    const newCurrency = this.currency - price;
                    this.updateStats(this.level, newCurrency);
                } else {
                    alert("Error purchasing store item color: " + requestStatus + ". Please report this.");
                }
            }
        }
    }

    private onOverlayClose() {
        this.detachChild(this.colorStore);
    }

    private async updateStore(token?: string) {
        DOMMutationHandler.clear(this.containerElt);

        if (token) {
            this.moreCurrencyBtn.classList.remove("btn-disabled");
        } else {
            this.moreCurrencyBtn.classList.add("btn-disabled");
        }

        const store = await this.getStore(token);

        this.colors = store.colors;

        this.renderStore(store, token !== undefined);
        this.colorStore.updateColors(store.colors);

    }

    private renderStore(store: IStore, hasToken: boolean) {
        for (const [title, tank] of store.tanks) {
            const storeItem = new StoreItem(tank, title, store.colors, this.level, this.currency, hasToken);
            this.storeItems.push(storeItem);
            this.attachChild(storeItem);

            this.containerElt.appendChild(storeItem.getElement());

            if (tank.selected) {
                this.selectedItem = storeItem;
            }
        }
    }

    private propagateSelection(storeItem: StoreItem) {
        const colors = [];
        for (const colorTitle of storeItem.selectedColors) {
            colors.push(this.colors.get(colorTitle)!.detail);
        }

        EventHandler.callEvent(EventHandler.Event.STORE_ITEM_SELECTION_PROPAGATION, {
            colors,
            id: storeItem.detail,
        });
    }

    private propagateColorSelection(colorTitle: string, index: number) {
        const detail = this.colors.get(colorTitle)!.detail;
        EventHandler.callEvent(EventHandler.Event.STORE_ITEM_COLOR_SELECTION_PROPAGATION, {
            detail,
            index,
        });
    }

    private async getStore(token?: string) {
        const storeData = await this.postStore(token);

        const store: any = {};
        store.colors = new Map(Object.entries(storeData.colors));
        store.tanks = new Map(Object.entries(storeData.tanks));

        return store;
    }

    private async postStore(token?: string, data?: string[][]) {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const body: any = {
            token,
        };
        if (data) {
            for (const pair of data) {
                body[pair[0]] = pair[1];
            }
        }
        const rawBody = JSON.stringify(body);

        const response = await fetch(address + "/store", {
            method: "post",
            mode: "cors",
            credentials: "omit",
            body: rawBody,
            headers: {
                "content-type": "application/json",
            },
        });
        if (data) {
            return response.status;
        }
        return response.json();
    }
}
