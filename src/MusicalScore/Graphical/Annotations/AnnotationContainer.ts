import { IGraphicalAnnotation } from "./Interfaces/IGraphicalAnnotation";
import { PointF2D } from "../../../Common/DataObjects/PointF2D";

export class AnnotationContainer {
    public AnnotationObject: IGraphicalAnnotation;
    public ClickLocation: PointF2D;
    public SheetClickLocation: PointF2D;
}
