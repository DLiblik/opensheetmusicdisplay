import { IGraphicalAnnotation } from "./IGraphicalAnnotation";
import { PointF2D } from "../../Common/DataObjects/PointF2D";
import { Fraction } from "../../Common/DataObjects/Fraction";

export interface IAnnotationsUIHandler {
    showUI(annotationRenderArea: PointF2D, xPosition: Fraction): Promise<IGraphicalAnnotation>;
}
