import { GraphicalLabel } from "./GraphicalLabel";
import { Label } from "../Label";
import { TextAlignmentEnum } from "../../Common/Enums/TextAlignment";
import { OSMDColor } from "../../Common/DataObjects/OSMDColor";
import { FontStyles } from "../../Common/Enums/FontStyles";
import { Fonts } from "../../Common/Enums/Fonts";
import { EngravingRules } from "./EngravingRules";
import { BoundingBox, GraphicalStaffEntry } from "..";
import { Fraction } from "../../Common";

export class GraphicalComment {

    private associatedStaffEntry: GraphicalStaffEntry;
    private graphicalLabel: GraphicalLabel;
    public get GraphicalLabel(): GraphicalLabel {
        return this.graphicalLabel;
    }
    public get PositionAndShape(): BoundingBox {
        return this.GraphicalLabel.PositionAndShape;
    }
    public set PositionAndShape(bb: BoundingBox) {
        this.GraphicalLabel.PositionAndShape = bb;
    }
    public setLabelPositionAndShapeBorders(): void {
        this.GraphicalLabel.setLabelPositionAndShapeBorders();
    }
    public position: Fraction;
    //private stafflineIndex: number;
    //private musicSystemId: number;

    //TODO Getters and setters for these? Definitely want options
    constructor(rules: EngravingRules, text: string,
                associatedStaffEntry: GraphicalStaffEntry = undefined,
                position: Fraction = associatedStaffEntry?.getAbsoluteTimestamp(),
                fontSize: number = 12, font: Fonts = Fonts.TimesNewRoman,
                fontColor: OSMDColor = new OSMDColor(255, 0, 0),
                fontStyle: FontStyles = FontStyles.Regular) {

        this.position = position;
        if (associatedStaffEntry) {
            this.associatedStaffEntry = associatedStaffEntry;
            //TODO: Make this coloring a drawing rule
            for (const gve of this.associatedStaffEntry.graphicalVoiceEntries) {
                for (const note of gve.parentVoiceEntry.Notes) {
                    note.NoteheadColor = fontColor.toString();
                    note.StemColorXml = fontColor.toString();
                }
            }
        }
        fontSize /= 10;
        const innerLabel: Label = new Label(text, TextAlignmentEnum.LeftTop, font, true);
        innerLabel.fontHeight = fontSize;
        innerLabel.color = fontColor;
        innerLabel.fontStyle = fontStyle;
        this.graphicalLabel = new GraphicalLabel(innerLabel, fontSize, innerLabel.textAlignment, rules, undefined);
    }

    public SerializeToXML(document: XMLDocument): Node {
        const color: OSMDColor = this.graphicalLabel.Label.color;
        const node: HTMLElement = document.createElement("comment");
        const textNode: Node = document.createTextNode(this.graphicalLabel.Label.text);
        node.appendChild(textNode);
        const locNode: HTMLElement = document.createElement("location");
        locNode.setAttribute("num", this.position.Numerator.toString());
        locNode.setAttribute("denom", this.position.Denominator.toString());
        node.appendChild(locNode);
        node.setAttribute("r", color.red.toString());
        node.setAttribute("g", color.green.toString());
        node.setAttribute("b", color.blue.toString());
        const thisLabel: Label = this.GraphicalLabel.Label;
        node.setAttribute("size", this.graphicalLabel.Label.fontHeight.toString());
        if (thisLabel.fontStyle) {
            node.setAttribute("style", this.graphicalLabel.Label.fontStyle.toString());
        }
        if (thisLabel.fontFamily) {
            node.setAttribute("font", this.graphicalLabel.Label.fontFamily.toString());
        }
        return node;
    }
}
