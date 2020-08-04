import { GraphicalComment } from "../Graphical/GraphicalComment";
import { Fraction, FontStyleString } from "../../Common";
import { EngravingRules } from "../Graphical/EngravingRules";
import { OSMDColor } from "../../Common/DataObjects";
import { FontString } from "../../Common/Enums/Fonts";
import { AnnotationsSheet } from "../Graphical/Annotations/AnnotationsSheet";

export class OSMDCommentReader {
    private rules: EngravingRules;

    constructor(rules: EngravingRules) {
        this.rules = rules;
        this.rules.ColoringEnabled = true;
    }

    public read(annotationsDoc: XMLDocument): AnnotationsSheet {
        const processedSheet: AnnotationsSheet = new AnnotationsSheet();
        for (const stafflineNode of annotationsDoc.childNodes[0].childNodes) {
            if (stafflineNode.nodeName === "staffline" && stafflineNode.hasChildNodes) {
                const staffLineIdx: number = parseInt((stafflineNode as Element).getAttribute("id"), 10);
                const graphicalCommentList: GraphicalComment[] = new Array<GraphicalComment>();
                for (const staffLineChild of stafflineNode.childNodes) {
                    switch (staffLineChild.nodeName) {
                        case "comment": // Handle marked areas as well? eventually
                            graphicalCommentList.push(this.graphicalCommentFromNode(staffLineChild as Element));
                            break;
                        default:
                            break;
                    }
                }
                processedSheet.setStaffLineComments(staffLineIdx, graphicalCommentList);
            }
        }
        return processedSheet;
    }

    private graphicalCommentFromNode(node: Element): GraphicalComment {
        let comment: GraphicalComment = undefined;
        const locationNode: Element = node.getElementsByTagName("location")[0];
        let num: number = 0;
        let denom: number = 0;
        let whole: number = 0;
        if (locationNode.hasAttribute("num")) {
            num = parseInt(locationNode.getAttribute("num"), 10);
        }
        if (locationNode.hasAttribute("denom")) {
            denom = parseInt(locationNode.getAttribute("denom"), 10);
        }
        if (locationNode.hasAttribute("whole")) {
            whole = parseInt(locationNode.getAttribute("whole"), 10);
        }
        let r: number = 0;
        let g: number = 0;
        let b: number = 0;
        if (node.hasAttribute("r")) {
            r = parseInt(node.getAttribute("r"), 10);
        }
        if (node.hasAttribute("g")) {
            g = parseInt(node.getAttribute("g"), 10);
        }
        if (node.hasAttribute("b")) {
            b = parseInt(node.getAttribute("b"), 10);
        }
        let size: number = 12;
        if (node.hasAttribute("size")) {
            size = parseInt(node.getAttribute("size"), 10);
        }
        let style: number = undefined;
        if (node.hasAttribute("style")) {
            const styleAttr: string = node.getAttribute("style").trim();
            style = parseInt(node.getAttribute("style"), 10);
            if (isNaN(style)) {
                //Not an int, using string
                if (FontStyleString.hasOwnProperty(styleAttr)) {
                    style = FontStyleString[styleAttr];
                }
            }
        }
        let font: number = undefined;
        if (node.hasAttribute("font")) {
            const fontAttr: string = node.getAttribute("font").trim();
            font = parseInt(node.getAttribute("font"), 10);
            if (isNaN(font)) {
                //Not an int, using string
                if (FontString.hasOwnProperty(fontAttr)) {
                    font = FontString[fontAttr];
                }
            }
        }
        const text: string = node.textContent.trim();

        const timestamp: Fraction = new Fraction(num, denom, whole);
        comment = new GraphicalComment(this.rules, text, size, font, new OSMDColor(r, g, b), style);
        comment.Location = timestamp;
        return comment;
    }
}
