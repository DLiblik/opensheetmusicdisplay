import { PointF2D } from "../../../../Common/DataObjects";

export abstract class AUIController {
    protected parentElement: HTMLElement;
    protected isTouch: boolean;
    protected eventListener: any;
    public readonly abstract ValidEvents: Array<string>;
    protected abstract initialize(): void;
    public abstract show(location?: PointF2D): void;
    public abstract hideAndClear(): void;

    constructor(parentElement: HTMLElement = document.body, isTouch: boolean = false) {
        this.parentElement = parentElement;
        this.isTouch = this.isTouch;
        this.initialize();
    }
    //Need this instead of a callback so we have an object context (can use this keyword)
    public registerListenerObject(listener: any): any {
        let returnObject: any = undefined;
        if (this.eventListener) {
            returnObject = this.eventListener;
        }
        this.eventListener = listener;
        for (const event of this.ValidEvents) {
            if (!this.eventListener || !this.eventListener[event] || typeof this.eventListener[event] !== "function") {
                console.warn("WARN: Listener object does not handle event: " + event);
                this.eventListener[event] = function(ev: Event): void { return; };
            }
        }
        return returnObject;
    }
}
