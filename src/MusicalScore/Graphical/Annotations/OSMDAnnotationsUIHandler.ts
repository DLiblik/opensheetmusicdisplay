import { IAnnotationsUIHandler } from "../../Interfaces/IAnnotationsUIHandler";
import { PointF2D } from "../../../Common/DataObjects/PointF2D";
import { AJAX } from "../../../OpenSheetMusicDisplay";
import { GraphicalComment } from "../..";
import { EngravingRules } from "../EngravingRules";
import { AnnotationContainer } from "./AnnotationContainer";
import { GraphicalVoiceEntry } from "../GraphicalVoiceEntry";
import { OSMDAnnotationsManager } from "./OSMDAnnotationsManager";
import { OSMDColor } from "../../../Common/DataObjects";
import { CommentInputUIContainer } from "./CommentInputUIContainer";

export class OSMDAnnotationsUIHandler implements IAnnotationsUIHandler {
    private container: HTMLElement;
    private uiPromise: Promise<HTMLElement>;
    private uiElement: HTMLElement;
    private commentInput: CommentInputUIContainer;
    private currentColor: OSMDColor;
    private currentSize: number;
    private currentFontFamily: string;
    private rules: EngravingRules;
    private aManager: OSMDAnnotationsManager;
    private isTouchDevice: boolean;

    constructor(container: HTMLElement, uIUrl: string, rules: EngravingRules, aManager: OSMDAnnotationsManager) {
        this.rules = rules;
        this.container = container;
        this.aManager = aManager;
        this.currentColor = new OSMDColor(0, 0, 0);
        this.currentSize = 12;
        this.currentFontFamily = "Times New Roman";
        this.isTouchDevice = this.isTouch();
        this.commentInput = new CommentInputUIContainer(undefined, this.isTouchDevice);
        const self: OSMDAnnotationsUIHandler = this;

        this.uiPromise = new Promise<HTMLElement>(function(resolveUIPromise: (value?: HTMLElement) => void, rejectUIPromise: (reason?: any) => void): void {
            AJAX.ajax(uIUrl).then(function(result: string): void {
                self.uiElement = document.createElement("div");
                self.uiElement.innerHTML = result;
                self.container.appendChild(self.uiElement);
                resolveUIPromise(self.uiElement);
            }).catch(function(reason: any): void {
                console.error("Error retrieving annotations UI HTML", reason);
                rejectUIPromise("AJAX Error retrieving annotations UI HTML: " + reason);
            });
        });
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
        const self: OSMDAnnotationsUIHandler = this;
        this.uiPromise.then(function(value: HTMLElement): void {
            const rInput: HTMLInputElement = document.getElementById("r") as HTMLInputElement;
            const gInput: HTMLInputElement = document.getElementById("g") as HTMLInputElement;
            const bInput: HTMLInputElement = document.getElementById("b") as HTMLInputElement;
            const fontSize: HTMLInputElement = document.getElementById("font-size") as HTMLInputElement;
            rInput.onchange = function(ev: Event): void {
                self.currentColor.red = parseInt((this as HTMLInputElement).value, 10);
                self.commentInput.FontColor = self.currentColor.toString();
            };
            gInput.onchange = function(ev: Event): void {
                self.currentColor.green = parseInt((this as HTMLInputElement).value, 10);
                self.commentInput.FontColor = self.currentColor.toString();
            };
            bInput.onchange = function(ev: Event): void {
                self.currentColor.blue = parseInt((this as HTMLInputElement).value, 10);
                self.commentInput.FontColor = self.currentColor.toString();
            };
            fontSize.onchange = function(ev: Event): void {
                self.currentSize = parseInt((this as HTMLInputElement).value, 10);
                self.commentInput.FontSize = self.currentSize;
            };
            self.listenForClick();
        });
        return this.uiPromise;
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
            self.showUI();
        };
    }

    private hideUI(): void {
        this.uiElement.classList.remove("show");
    }

    /*private getPlacementForVoiceEntry(voiceEntry: GraphicalVoiceEntry, width: number = 20): PointF2D {
        const yPlacement: number = this.aManager.getYPlacementForVoiceEntry(voiceEntry, width / 10);
        return this.getAbsolutePageCoordinates(new PointF2D(voiceEntry.PositionAndShape.AbsolutePosition.x, yPlacement));
    }*/
    private showUI(): void {
        this.uiElement.classList.add("show");
        const self: OSMDAnnotationsUIHandler = this;
        document.getElementById("add-comment").onclick = function(ev: MouseEvent): void {
            this.onclick = undefined;
            const annotationContainer: AnnotationContainer = new AnnotationContainer();
            const comment: GraphicalComment = new GraphicalComment(self.rules, self.commentInput.TextValue);
            annotationContainer.ClickLocation = self.commentInput.Location;
            annotationContainer.SheetClickLocation = self.getOSMDCoordinates(annotationContainer.ClickLocation);
            //TODO: This needs to be on the annotation container, and needs to be relative to measure/note
            comment.GraphicalLabel.PositionAndShape.AbsolutePosition = annotationContainer.SheetClickLocation;
            comment.FontColor = self.currentColor;
            comment.FontSize = self.currentSize;
            comment.GraphicalLabel.Label.fontFamily = self.currentFontFamily;
            const nearestVoiceEntry: GraphicalVoiceEntry = self.aManager.getNearestVoiceEntry(annotationContainer.SheetClickLocation);
            if (nearestVoiceEntry) {
                comment.AssociatedVoiceEntry = nearestVoiceEntry;
            }
            annotationContainer.AnnotationObject = comment;
            self.aManager.addStafflineComment(annotationContainer);
            self.hideUI();
            self.commentInput.hideAndClear();
            self.listenForClick();
        };
        document.getElementById("cancel").onclick = function(ev: MouseEvent): void {
            this.onclick = undefined;
            self.hideUI();
            self.commentInput.hideAndClear();
            self.listenForClick();
        };
    }
}
