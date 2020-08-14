import { IXMLSerializable } from "../../../Interfaces/IXMLSerializable";
import { GraphicalObject } from "../../GraphicalObject";
import { Fraction } from "../../../../Common";

export abstract class AGraphicalAnnotation implements IXMLSerializable {
    public abstract SerializeToXML(document: XMLDocument, args: Object): Node;
    public Location: Fraction;
    public AnchorObject: GraphicalObject;
    //public AnchorObjectId: number;
}
