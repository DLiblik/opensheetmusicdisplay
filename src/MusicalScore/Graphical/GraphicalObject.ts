import {BoundingBox} from "./BoundingBox";

export class GraphicalObject {

    protected boundingBox: BoundingBox;
    protected internalID: number;
    //Track all graphical objects after creation.
    //After reading this list will be cleared to free up memory
    public static GraphicalObjectList: GraphicalObject[] = [];

    constructor() {
        this.internalID = GraphicalObject.GraphicalObjectList.push(this);
    }

    public get InternalID(): number {
        return this.internalID;
    }

    public get PositionAndShape(): BoundingBox {
        return this.boundingBox;
    }

    public set PositionAndShape(value: BoundingBox) {
        this.boundingBox = value;
    }

}
