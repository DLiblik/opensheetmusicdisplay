import { IAnnotationsUIHandler } from "../../Interfaces/IAnnotationsUIHandler";
import { PointF2D } from "../../../Common/DataObjects/PointF2D";
import { AJAX } from "../../../OpenSheetMusicDisplay";
import { GraphicalComment } from "../..";
import { EngravingRules } from "../EngravingRules";
import { AnnotationContainer } from "./AnnotationContainer";
import { GraphicalVoiceEntry } from "../GraphicalVoiceEntry";
import { OSMDAnnotationsManager } from "./OSMDAnnotationsManager";
import { OSMDColor } from "../../../Common/DataObjects";

export class OSMDAnnotationsUIHandler implements IAnnotationsUIHandler {
    private container: HTMLElement;
    private uiPromise: Promise<HTMLElement>;
    private uiElement: HTMLElement;
    private commentInputElement: HTMLInputElement;
    private textMeasureElement: HTMLSpanElement;
    private currentColor: OSMDColor;
    private currentSize: number;
    private rules: EngravingRules;
    private aManager: OSMDAnnotationsManager;

    constructor(container: HTMLElement, uIUrl: string, rules: EngravingRules, aManager: OSMDAnnotationsManager) {
        this.rules = rules;
        this.container = container;
        this.aManager = aManager;
        this.currentColor = new OSMDColor(0, 0, 0);
        this.currentSize = 12;
        const self: OSMDAnnotationsUIHandler = this;
        this.uiPromise = new Promise<HTMLElement>(function(resolveUIPromise: (value?: HTMLElement) => void, rejectUIPromise: (reason?: any) => void): void {
            AJAX.ajax(uIUrl).then(function(result: string): void {
                self.uiElement = document.createElement("div");
                self.uiElement.innerHTML = result;
                self.container.appendChild(self.uiElement);
                self.commentInputElement = document.getElementById("comment-input") as HTMLInputElement;
                self.textMeasureElement = document.getElementById("measure-text") as HTMLSpanElement;
                resolveUIPromise(self.uiElement);
            }).catch(function(reason: any): void {
                console.error("Error retrieving annotations UI HTML", reason);
                rejectUIPromise("AJAX Error retrieving annotations UI HTML: " + reason);
            });
        });
    }

    private updateCommentStyle(): void {
        this.textMeasureElement.style.font = this.currentSize + "px";
        this.commentInputElement.style.color = this.currentColor.toString();
        this.commentInputElement.style.fontSize = this.currentSize + "px";
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
                self.updateCommentStyle();
            };
            gInput.onchange = function(ev: Event): void {
                self.currentColor.green = parseInt((this as HTMLInputElement).value, 10);
                self.updateCommentStyle();
            };
            bInput.onchange = function(ev: Event): void {
                self.currentColor.blue = parseInt((this as HTMLInputElement).value, 10);
                self.updateCommentStyle();
            };
            fontSize.onchange = function(ev: Event): void {
                self.currentSize = parseInt((this as HTMLInputElement).value, 10);
                self.updateCommentStyle();
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
            const sheetLocation: PointF2D = self.getOSMDCoordinates(clickLocation);
            const nearestVoiceEntry: GraphicalVoiceEntry = self.aManager.getNearestVoiceEntry(sheetLocation);
            self.showCommentBox(clickLocation, sheetLocation, nearestVoiceEntry);
            self.showUI(clickLocation, sheetLocation, nearestVoiceEntry);
        };
    }

    private hideUI(): void {
        this.uiElement.classList.remove("show");
    }

    private getPlacementForVoiceEntry(voiceEntry: GraphicalVoiceEntry, width: number = 20): PointF2D {
        const yPlacement: number = this.aManager.getYPlacementForVoiceEntry(voiceEntry, width / 10);
        return this.getAbsolutePageCoordinates(new PointF2D(voiceEntry.PositionAndShape.AbsolutePosition.x, yPlacement));
    }

    private placeCommentBox(nearestVoiceEntry: GraphicalVoiceEntry): void {
        const placeAt: PointF2D = this.getPlacementForVoiceEntry(nearestVoiceEntry, this.commentInputElement.clientWidth);
        placeAt.y -= (this.commentInputElement.clientHeight + 5);
        this.commentInputElement.style.top = placeAt.y + "px";
        this.commentInputElement.style.left = placeAt.x + "px";
    }

    private hideCommentBox(): void {
        this.commentInputElement.value = "";
        this.commentInputElement.style.width = "8px";
        this.commentInputElement.classList.add("hide");
    }

    private showCommentBox(clickLocation: PointF2D, sheetLocation: PointF2D, nearestVoiceEntry?: GraphicalVoiceEntry): void {
        this.commentInputElement.classList.remove("hide");
        if (nearestVoiceEntry) {
            this.placeCommentBox(nearestVoiceEntry);
            const self: OSMDAnnotationsUIHandler = this;
            this.commentInputElement.oninput = undefined;
            this.commentInputElement.oninput = function(ev: Event): void {
                self.textMeasureElement.textContent = self.commentInputElement.value;
                const width: number = self.textMeasureElement.clientWidth + 8;
                self.commentInputElement.style.width = width + "px";
                self.placeCommentBox(nearestVoiceEntry);
            };
        } else {
            this.commentInputElement.style.top = clickLocation.y.toString() + "px";
            this.commentInputElement.style.left = clickLocation.x.toString() + "px";
        }
    }

    private showUI(clickLocation: PointF2D, sheetLocation: PointF2D, nearestVoiceEntry?: GraphicalVoiceEntry): void {
        this.uiElement.classList.add("show");
        const self: OSMDAnnotationsUIHandler = this;
        const annotationContainer: AnnotationContainer = new AnnotationContainer();
        annotationContainer.ClickLocation = clickLocation;
        annotationContainer.SheetClickLocation = sheetLocation;
        document.getElementById("add-comment").onclick = function(ev: MouseEvent): void {
            this.onclick = undefined;
            const commentValue: string = self.commentInputElement.value;
            const comment: GraphicalComment = new GraphicalComment(self.rules, commentValue);
            comment.FontColor = self.currentColor;
            comment.FontSize = self.currentSize;
            if (nearestVoiceEntry) {
                comment.AssociatedVoiceEntry = nearestVoiceEntry;
            }
            annotationContainer.AnnotationObject = comment;
            self.aManager.addStafflineComment(annotationContainer);
            self.hideUI();
            self.hideCommentBox();
            self.listenForClick();
        };
        document.getElementById("cancel").onclick = function(ev: MouseEvent): void {
            this.onclick = undefined;
            self.hideUI();
            self.hideCommentBox();
            self.listenForClick();
        };
    }
}
