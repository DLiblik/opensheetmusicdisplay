import { IXMLSerializable } from "../../../Interfaces/IXMLSerializable";
import { GraphicalVoiceEntry } from "../..";
import { PointF2D } from "../../../../Common/DataObjects";

export abstract class IGraphicalAnnotation implements IXMLSerializable {
    public abstract SerializeToXML(document: XMLDocument, args: Object): Node;
    protected relativeLocation: PointF2D;
    public get RelativeLocation(): PointF2D {
        return this.relativeLocation;
    }
    protected associatedVoiceEntry: GraphicalVoiceEntry;
    public get AssociatedVoiceEntry(): GraphicalVoiceEntry {
        return this.associatedVoiceEntry;
    }
    public SetAnchorLocation(gve: GraphicalVoiceEntry, sheetPosition: PointF2D): void {
        this.associatedVoiceEntry = gve;
        this.relativeLocation = new PointF2D (sheetPosition.x - this.associatedVoiceEntry.PositionAndShape.AbsolutePosition.x,
                                              sheetPosition.y - this.associatedVoiceEntry.PositionAndShape.AbsolutePosition.y);
    }
}
