import { GraphicalMusicSheet, GraphicalComment, GraphicalVoiceEntry, GraphicalLayers, MusicSheetCalculator, SkyBottomLineCalculator, StaffLine } from "..";
import { IAnnotationsManager } from "../../Interfaces/IAnnotationsManager";
import { EngravingRules } from "../EngravingRules";
import { VexFlowMusicSheetDrawer } from "../VexFlow";
import { AnnotationsSheet } from "./AnnotationsSheet";
import { AnnotationContainer } from "./AnnotationContainer";
import { PointF2D } from "../../../Common/DataObjects";
import { GraphicalStaffEntry } from "../..";

export class OSMDAnnotationsManager implements IAnnotationsManager {
    private graphic: GraphicalMusicSheet;
    private annotationSheet: AnnotationsSheet;
    public drawer: VexFlowMusicSheetDrawer;

    constructor(graphic: GraphicalMusicSheet, rules: EngravingRules, drawer: VexFlowMusicSheetDrawer) {
        this.graphic = graphic;
        this.annotationSheet = new AnnotationsSheet();
        this.graphic.GetCalculator.AddAnnotationSheet(this.annotationSheet);
        this.drawer = drawer;
    }

    public calculateCommentWidth(comment: GraphicalComment): number {
        const widthToHeightRatio: number =
        MusicSheetCalculator.TextMeasurer.computeTextWidthToHeightRatio(
           comment.GraphicalLabel.Label.text, comment.Font, comment.FontStyle,
           comment.GraphicalLabel.Label.fontFamily, comment.FontSize);
        return comment.FontSize * widthToHeightRatio;
    }

    //From Fraction to fraction
    public getYPlacementForVoiceEntry(voiceEntry: GraphicalVoiceEntry, width: number = 2): number {
        if (!voiceEntry || !voiceEntry) {
            return;
        }
        const parentStaffLine: StaffLine = voiceEntry.parentStaffEntry.parentMeasure.ParentStaffLine;
        const sbc: SkyBottomLineCalculator = parentStaffLine.SkyBottomLineCalculator;
        const gse: GraphicalStaffEntry = voiceEntry.parentStaffEntry;
        const start: number = gse.PositionAndShape.RelativePosition.x + gse.parentMeasure.PositionAndShape.RelativePosition.x;
        const end: number = start + width;
        return parentStaffLine.PositionAndShape.AbsolutePosition.y + sbc.getSkyLineMinInRange(start, end);
    }

    public getNearestVoiceEntry(sheetLocation: PointF2D): GraphicalVoiceEntry {
        return this.graphic.GetNearestVoiceEntry(sheetLocation);
    }

    public addStafflineComment(annotationContainer: AnnotationContainer): void {
        if (!(annotationContainer.AnnotationObject instanceof GraphicalComment)) {
            throw new Error("Object Not Instance of GraphicalComment.");
        }
        const comment: GraphicalComment = annotationContainer.AnnotationObject as GraphicalComment;
        comment.AssociatedVoiceEntry = this.graphic.GetNearestVoiceEntry(annotationContainer.SheetClickLocation);
        this.annotationSheet.AddCommentToStaffLine(comment.AssociatedVoiceEntry.parentStaffEntry.parentMeasure.ParentStaff.idInMusicSheet, comment);
        this.graphic.reCalculate();
        this.drawer.initializeForDrawingPage(comment.AssociatedVoiceEntry.notes[0].ParentMusicPage);
        this.drawer.drawLabel(comment.GraphicalLabel, GraphicalLayers.Notes);
    }
}
