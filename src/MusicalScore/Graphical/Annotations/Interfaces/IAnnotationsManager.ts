import { AnnotationContainer } from "../AnnotationContainer";
import { GraphicalComment, GraphicalVoiceEntry } from "../../..";
import { PointF2D } from "../../../../Common/DataObjects";

export interface IAnnotationsManager {
  calculateCommentWidth(comment: GraphicalComment): number;
  getNearestVoiceEntry(sheetLocation: PointF2D): GraphicalVoiceEntry;
  addStafflineComment(annotation: AnnotationContainer): void;
}
