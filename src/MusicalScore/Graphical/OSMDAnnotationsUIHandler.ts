import { IAnnotationsUIHandler } from "../Interfaces/IAnnotationsUIHandler";
import { IGraphicalAnnotation } from "../Interfaces/IGraphicalAnnotation";
import { PointF2D } from "../../Common/DataObjects/PointF2D";
import { Fraction } from "../../Common";
import { AJAX } from "../../OpenSheetMusicDisplay";
import { GraphicalComment } from "..";
import { EngravingRules } from "./EngravingRules";

export class OSMDAnnotationsUIHandler implements IAnnotationsUIHandler {
    private container: HTMLElement;
    //TODO make a promise and wait for it in showUI. Don't want to bother atm
    private uiElement: HTMLElement;
    //TODO: Render this unnecessary. Use enums
    private rules: EngravingRules;

    constructor(container: HTMLElement, uIUrl: string, rules: EngravingRules) {
        this.rules = rules;
        this.container = container;
        const self: OSMDAnnotationsUIHandler = this;
        AJAX.ajax(uIUrl).then(function(result: string): void {
            self.uiElement = document.createElement("div");
            self.uiElement.innerHTML = result;
            self.container.appendChild(self.uiElement);
        }).catch(function(reason: any): void {
            console.error("Error retrieving annotations UI");
        });
    }

    public showUI(annotationRenderArea: PointF2D, xPosition: Fraction): Promise<IGraphicalAnnotation> {
        this.uiElement.classList.add("show");
        const self: OSMDAnnotationsUIHandler = this;
        const resultPromise: Promise<IGraphicalAnnotation> =
        new Promise(function(resolve: (result: IGraphicalAnnotation) => void, reject: (reason: any) => void): void {
            document.getElementById("add-comment").onclick = function(ev: MouseEvent): void {
                const commentValue: string = (document.getElementById("comment") as any).value;
                resolve(new GraphicalComment(self.rules, commentValue, undefined, xPosition));
            };
        });
        return resultPromise;
    }
}
