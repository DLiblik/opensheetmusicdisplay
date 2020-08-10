import { IAnnotationsUIHandler } from "./Interfaces/IAnnotationsUIHandler";
import { PointF2D } from "../../../Common/DataObjects/PointF2D";
import { GraphicalComment } from "../..";
import { EngravingRules } from "../EngravingRules";
import { AnnotationContainer } from "./AnnotationContainer";
import { GraphicalVoiceEntry } from "../GraphicalVoiceEntry";
import { OSMDAnnotationsManager } from "./OSMDAnnotationsManager";
import { OSMDColor } from "../../../Common/DataObjects";
import { CommentInputUI } from "./CommentInputUI";
import { CommentStylingUI } from "./CommentStylingUI";
import { resolve } from "path";

export class OSMDAnnotationsUIHandler implements IAnnotationsUIHandler {
    private container: HTMLElement;
    private commentInput: CommentInputUI;
    private commentStylingBox: CommentStylingUI;
    private rules: EngravingRules;
    private aManager: OSMDAnnotationsManager;
    private isTouchDevice: boolean;

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
            resolve();
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

    private listenForClick(): void {
        const self: OSMDAnnotationsUIHandler = this;
        this.container.onmousedown = (clickEvent: MouseEvent) => {
            self.container.onmousedown = undefined;
            const clickLocation: PointF2D = new PointF2D(clickEvent.pageX, clickEvent.pageY);
            self.commentInput.show(clickLocation);
            self.commentStylingBox.show();
        };
    }

    public onColorChange(ev: Event): void {
        this.commentInput.FontColor = (ev.target as HTMLInputElement).value;
    }

    public onSizeChange(ev: Event): void {
        this.commentInput.FontSize = parseInt((ev.target as HTMLInputElement).value, 10);
    }

    public onAdd(ev: MouseEvent): void {
        const annotationContainer: AnnotationContainer = new AnnotationContainer();
        const comment: GraphicalComment = new GraphicalComment(this.rules, this.commentInput.TextValue);
        annotationContainer.ClickLocation = this.commentInput.Location;
        annotationContainer.SheetClickLocation = this.getOSMDCoordinates(annotationContainer.ClickLocation);
        //TODO: This needs to be on the annotation container, and needs to be relative to measure/note
        comment.GraphicalLabel.PositionAndShape.AbsolutePosition = annotationContainer.SheetClickLocation;
        const colorArray: string[] = this.commentInput.FontColor.match(/\d{1,3}/g);
        if (colorArray.length === 3) {
            comment.FontColor = new OSMDColor(parseInt(colorArray[0], 10), parseInt(colorArray[1], 10), parseInt(colorArray[2], 10));
        }
        comment.FontSize = this.commentInput.FontSize;
        comment.GraphicalLabel.Label.fontFamily = this.commentInput.FontFamily;
        const nearestVoiceEntry: GraphicalVoiceEntry = this.aManager.getNearestVoiceEntry(annotationContainer.SheetClickLocation);
        if (nearestVoiceEntry) {
            comment.AssociatedVoiceEntry = nearestVoiceEntry;
        }
        annotationContainer.AnnotationObject = comment;
        this.aManager.addStafflineComment(annotationContainer);
        this.commentInput.hideAndClear();
    }

    public onCancel(ev: MouseEvent): void {
        this.commentInput.hideAndClear();
    }
}
