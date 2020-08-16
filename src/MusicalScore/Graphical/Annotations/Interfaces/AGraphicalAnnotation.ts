import { IXMLSerializable } from "../../../Interfaces/IXMLSerializable";
import { GraphicalObject } from "../../GraphicalObject";
import { Fraction } from "../../../../Common";

export abstract class AGraphicalAnnotation extends GraphicalObject implements IXMLSerializable {
    public abstract SerializeToXML(document: XMLDocument, args: Object): Node;
    public Location: Fraction;
    protected anchorObject: GraphicalObject;
    public get AnchorObject(): GraphicalObject {
        return this.anchorObject;
    }
    public set AnchorObject(anchor: GraphicalObject) {
        this.anchorObject = anchor;
    }
    //public AnchorObjectId: number;
}
