import { IXMLSerializable } from "../../../Interfaces/IXMLSerializable";
import { GraphicalObject } from "../../GraphicalObject";
import { PointF2D } from "../../../../Common/DataObjects";

export abstract class IGraphicalAnnotation extends GraphicalObject implements IXMLSerializable {
    public abstract SerializeToXML(document: XMLDocument, args: Object): Node;
    protected anchorObject: GraphicalObject;
    public get AnchorObject(): GraphicalObject {
        return this.anchorObject;
    }
    public set AnchorObject(anchorObject: GraphicalObject) {
        this.anchorObject = anchorObject;
        this.PositionAndShape.Parent = anchorObject.PositionAndShape;
    }
    //TODO: I think this will go back in the AnnotationsManager, since we will be reading relative location directly from xml
    public SetAnchorLocation(anchorObject: GraphicalObject, sheetLocation: PointF2D): void {
        const relativeLocation: PointF2D = new PointF2D (sheetLocation.x - anchorObject.PositionAndShape.AbsolutePosition.x,
                                                         sheetLocation.y - anchorObject.PositionAndShape.AbsolutePosition.y);
        this.AnchorObject = anchorObject;
        this.PositionAndShape.RelativePosition = relativeLocation;
    }
}
