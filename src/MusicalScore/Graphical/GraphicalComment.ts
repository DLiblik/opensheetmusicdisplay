import { GraphicalLabel } from "./GraphicalLabel";
import { Label } from "../Label";
import { TextAlignmentEnum } from "../../Common/Enums/TextAlignment";
import { OSMDColor } from "../../Common/DataObjects/OSMDColor";
import { FontStyles } from "../../Common/Enums/FontStyles";
import { Fonts } from "../../Common/Enums/Fonts";
import { EngravingRules } from "./EngravingRules";
import { BoundingBox, StaffLine } from "..";
import { Fraction } from "../../Common";
import { IGraphicalAnnotation } from "./Annotations/Interfaces/IGraphicalAnnotation";
import { PointF2D } from "../../Common/DataObjects";

export class GraphicalComment extends IGraphicalAnnotation {
    public Location: Fraction;
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
    public get ParentStaffline(): StaffLine {
        return this.associatedVoiceEntry?.parentStaffEntry?.parentMeasure?.ParentStaffLine;
    }
    public get FontColor(): OSMDColor {
        return this.graphicalLabel.Label.color;
    }
    public set FontColor(color: OSMDColor) {
        this.graphicalLabel.Label.color = color;
    }
    public get FontSize(): number {
        return this.graphicalLabel.Label.fontHeight * 10;
    }
    public set FontSize(fontHeight: number) {
        this.graphicalLabel.Label.fontHeight = fontHeight / 10;
    }
    public get FontStyle(): FontStyles {
        return this.graphicalLabel.Label.fontStyle;
    }
    public set FontStyle(style: FontStyles) {
        this.graphicalLabel.Label.fontStyle = style;
    }
    public get Font(): Fonts {
        return this.graphicalLabel.Label.font;
    }
    public set Font(font: Fonts) {
        this.graphicalLabel.Label.font = font;
    }
    //TODO Getters and setters for these? Definitely want options
    constructor(rules: EngravingRules, text: string,
                fontSize: number = 12, font: Fonts = Fonts.TimesNewRoman,
                fontColor: OSMDColor = new OSMDColor(255, 0, 0),
                fontStyle: FontStyles = FontStyles.Regular) {
        super();
        fontSize /= 10;
        const innerLabel: Label = new Label(text, TextAlignmentEnum.LeftTop, font, true);
        innerLabel.fontHeight = fontSize;
        innerLabel.color = fontColor;
        innerLabel.fontStyle = fontStyle;
        this.graphicalLabel = new GraphicalLabel(innerLabel, fontSize, innerLabel.textAlignment, rules, undefined);
    }
    protected relativeLocation: PointF2D;

    public SerializeToXML(document: XMLDocument): Node {
        const color: OSMDColor = this.graphicalLabel.Label.color;
        const node: HTMLElement = document.createElement("comment");
        const textNode: Node = document.createTextNode(this.graphicalLabel.Label.text);
        node.appendChild(textNode);
        const locNode: HTMLElement = document.createElement("location");
        locNode.setAttribute("num", this.Location.Numerator.toString());
        locNode.setAttribute("denom", this.Location.Denominator.toString());
        const whole: number = this.Location.WholeValue;
        if (whole > 0) {
            locNode.setAttribute("whole", whole.toString());
        }
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
