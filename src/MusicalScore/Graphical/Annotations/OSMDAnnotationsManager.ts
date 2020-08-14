import { GraphicalMusicSheet, GraphicalComment, GraphicalVoiceEntry, GraphicalLayers, MusicSheetCalculator, SkyBottomLineCalculator, StaffLine } from "..";
import { EngravingRules } from "../EngravingRules";
import { VexFlowMusicSheetDrawer } from "../VexFlow";
import { AnnotationsSheet } from "./AnnotationsSheet";
import { PointF2D } from "../../../Common/DataObjects";
import { GraphicalStaffEntry } from "../..";

export class OSMDAnnotationsManager {
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

    public addComment(comment: GraphicalComment, sheetLocation: PointF2D): void {
        const nearestVoiceEntry: GraphicalVoiceEntry = this.getNearestVoiceEntry(sheetLocation);
        if (nearestVoiceEntry) {
            const relativeLocation: PointF2D = new PointF2D (sheetLocation.x - nearestVoiceEntry.PositionAndShape.AbsolutePosition.x,
                                                             sheetLocation.y - nearestVoiceEntry.PositionAndShape.AbsolutePosition.y);
            comment.AnchorObject = nearestVoiceEntry.parentStaffEntry;
            comment.Location = nearestVoiceEntry.parentStaffEntry.getAbsoluteTimestamp();
            comment.PositionAndShape.RelativePosition = relativeLocation;
        }
        comment.setLabelPositionAndShapeBorders();
        this.annotationSheet.AddCommentToStaffLine(nearestVoiceEntry.parentStaffEntry.parentMeasure.ParentStaff.idInMusicSheet, comment);
        this.graphic.reCalculate();
        this.drawer.initializeForDrawingPage(nearestVoiceEntry.notes[0].ParentMusicPage);
        this.drawer.drawLabel(comment.GraphicalLabel, GraphicalLayers.Notes);
    }
}
