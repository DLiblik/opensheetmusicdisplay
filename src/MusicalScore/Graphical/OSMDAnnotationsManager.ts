import { GraphicalMusicSheet, GraphicalComment, GraphicalVoiceEntry, GraphicalLayers } from ".";
import { IAnnotationsManager } from "../Interfaces/IAnnotationsManager";
import { EngravingRules } from "./EngravingRules";
import { VexFlowMusicSheetDrawer } from "./VexFlow";
import { AnnotationsSheet } from "./AnnotationsSheet";
import { IAnnotationsUIHandler } from "../Interfaces/IAnnotationsUIHandler";
import { IGraphicalAnnotation } from "../Interfaces/IGraphicalAnnotation";
import { PointF2D } from "../../Common/DataObjects/PointF2D";

export class OSMDAnnotationsManager implements IAnnotationsManager {
    private graphic: GraphicalMusicSheet;
    private annotationSheet: AnnotationsSheet;
    private uiController: IAnnotationsUIHandler;
    public drawer: VexFlowMusicSheetDrawer;

    constructor(graphic: GraphicalMusicSheet, rules: EngravingRules, drawer: VexFlowMusicSheetDrawer) {
        this.graphic = graphic;
        this.annotationSheet = new AnnotationsSheet();
        this.graphic.GetCalculator.AddAnnotationSheet(this.annotationSheet);
        this.drawer = drawer;
    }

    public initialize(uiController: IAnnotationsUIHandler): void {
        this.uiController = uiController;
    }

    public handleClick(absoluteClickLocation: PointF2D, sheetClickLocation: PointF2D, gve: GraphicalVoiceEntry): void {
        this.uiController.showUI(absoluteClickLocation,
                                 gve.parentStaffEntry.getAbsoluteTimestamp()).then((result: IGraphicalAnnotation) => {
            if (result instanceof GraphicalComment) {
                this.annotationSheet.AddCommentToStaffLine(gve.parentStaffEntry.parentMeasure.ParentStaff.idInMusicSheet, result);
                this.graphic.reCalculate();
                this.drawer.initializeForDrawingPage(gve.notes[0].ParentMusicPage);
                this.drawer.drawLabel(result.GraphicalLabel, GraphicalLayers.Notes);
            } else {
                //Marked Area, etc.
            }
        }).catch((reason: any) => {
            console.error("UI Manager returned Error");
        });
    }
}
