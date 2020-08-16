import { IAnnotationsUIHandler } from "./Interfaces/IAnnotationsUIHandler";
import { PointF2D } from "../../../Common/DataObjects/PointF2D";
import { GraphicalComment } from "../..";
import { EngravingRules } from "../EngravingRules";
import { OSMDAnnotationsManager } from "./OSMDAnnotationsManager";
import { OSMDColor } from "../../../Common/DataObjects";
import { CommentInputUI } from "./CommentInputUI";
import { CommentStylingUI } from "./CommentStylingUI";
import { AGraphicalAnnotation } from "./Interfaces/AGraphicalAnnotation";

export class OSMDAnnotationsUIHandler implements IAnnotationsUIHandler {
    private container: HTMLElement;
    private commentInput: CommentInputUI;
    private commentStylingBox: CommentStylingUI;
    private rules: EngravingRules;
    private aManager: OSMDAnnotationsManager;
    private isTouchDevice: boolean;
    //Millis of how long is valid for the next click of a double click
    private readonly DOUBLE_CLICK_WINDOW: number = 200;

    constructor(container: HTMLElement, uIUrl: string, rules: EngravingRules, aManager: OSMDAnnotationsManager) {
        this.rules = rules;
        this.container = container;
        this.aManager = aManager;
        this.isTouchDevice = this.isTouch();
    }

    private isTouch(): boolean {
        if (("ontouchstart" in window) || (window as any).DocumentTouch) {
            return true;
        }
        // include the 'heartz' as a way to have a non matching MQ to help terminate the join
        // https://git.io/vznFH
        const prefixes: string[] = ["-webkit-", "-moz-", "-o-", "-ms-"];
        const query: string = ["(", prefixes.join("touch-enabled),("), "heartz", ")"].join("");
        return window.matchMedia(query).matches;
    }

    public initialize(): Promise<any> {
        this.commentInput = new CommentInputUI(undefined, this.isTouchDevice);
        this.commentStylingBox = new CommentStylingUI(undefined,  this.isTouchDevice);
        this.commentStylingBox.registerListenerObject(this);
        this.listenForClick();
        return new Promise(function(mainResolve: (value?: any) => void, mainReject: (reason?: any) => void): void {
            mainResolve();
        });
    }

    public getOSMDCoordinates(clickLocation: PointF2D): PointF2D {
        const sheetX: number = (clickLocation.x - this.container.offsetLeft) / 10;
        const sheetY: number = (clickLocation.y - this.container.offsetTop) / 10;
        return new PointF2D(sheetX, sheetY);
    }

    public getAbsolutePageCoordinates(sheetLocation: PointF2D): PointF2D {
        const x: number = (sheetLocation.x * 10 + this.container.offsetLeft);
        const y: number = (sheetLocation.y * 10 + this.container.offsetTop);
        return new PointF2D(x, y);
    }

    private clickTimeout: NodeJS.Timeout;
    private lastClick: number = 0;

    private listenForClick(): void {
        const downEventName: string = this.isTouchDevice ? "ontouchend" : "onmouseup";
        const self: OSMDAnnotationsUIHandler = this;
        this.container[downEventName] = function(clickEvent: MouseEvent | TouchEvent): void {
            event.preventDefault();
            const currentTime: number = new Date().getTime();
            const clickLength: number = currentTime - self.lastClick;
            clearTimeout(self.clickTimeout);
            let x: number = 0;
            let y: number = 0;
            if (self.isTouchDevice && clickEvent instanceof TouchEvent) {
                x = clickEvent.touches[0].pageX;
                y = clickEvent.touches[0].pageY;
            } else if (clickEvent instanceof MouseEvent) {
                x = clickEvent.pageX;
                y = clickEvent.pageY;
            }
            const clickLocation: PointF2D = new PointF2D(x, y);
            if (clickLength < self.DOUBLE_CLICK_WINDOW && clickLength > 0) {
                //double click
                self.container[downEventName] = undefined;
                self.doubleClickBehavior(clickLocation);
            } else {
                //single click
                self.clickTimeout = setTimeout(function(): void {
                    clearTimeout(self.clickTimeout);
                    self.container[downEventName] = undefined;
                    self.commentInput.show(clickLocation);
                    self.commentStylingBox.show();
                },                             self.DOUBLE_CLICK_WINDOW);
            }
            self.lastClick = currentTime;
        };
    }

    private doubleClickBehavior(clickLocation: PointF2D): void {
        //TODO: Edit existing annotations functionality
        const sheetLocation: PointF2D = this.getOSMDCoordinates(clickLocation);
        const annotation: AGraphicalAnnotation =  this.aManager.getNearestAnnotation(sheetLocation);
        if (annotation instanceof GraphicalComment) {
            //TODO: Need to render more specifically.
            this.commentInput.show(clickLocation);
            this.commentInput.FontColor = annotation.FontColor.toString();
            this.commentInput.FontSize = annotation.FontSize * 10;
            //this.commentInput.FontFamily = annotation.Font;
            this.commentInput.TextValue = annotation.TextContent;
            //TODO: Need to hide the rendered comment object
        }
    }

    public onColorChange(ev: Event): void {
        this.commentInput.FontColor = (ev.target as HTMLInputElement).value;
    }

    public onSizeChange(ev: Event): void {
        this.commentInput.FontSize = parseFloat((ev.target as HTMLInputElement).value);
    }

    public onAdd(ev: MouseEvent): void {
        const comment: GraphicalComment = new GraphicalComment(this.rules, this.commentInput.TextValue);
        const clickLocation: PointF2D = this.commentInput.Location;
        const sheetLocation: PointF2D = this.getOSMDCoordinates(clickLocation);
        //TODO: This needs to be on the annotation container, and needs to be relative to measure/note
        //comment.GraphicalLabel.PositionAndShape.AbsolutePosition = sheetLocation;
        const colorArray: string[] = this.commentInput.FontColor.match(/\d{1,3}/g);
        if (colorArray && colorArray.length === 3) {
            comment.FontColor = new OSMDColor(parseInt(colorArray[0], 10), parseInt(colorArray[1], 10), parseInt(colorArray[2], 10));
        } else {
            comment.FontColor = new OSMDColor(0, 0, 0);
        }
        comment.FontSize = ((this.commentInput.FontSize) / 10);
        comment.GraphicalLabel.Label.fontFamily = this.commentInput.FontFamily;
        this.aManager.addComment(comment, sheetLocation);
        this.commentInput.hideAndClear();
    }

    public onCancel(ev: MouseEvent): void {
        this.commentInput.hideAndClear();
    }
}
