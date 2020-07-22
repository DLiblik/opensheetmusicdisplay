import { GraphicalComment } from "../Graphical/GraphicalComment";
import Dictionary from "typescript-collections/dist/lib/Dictionary";
import { Fraction } from "../../Common";
import { EngravingRules } from "../Graphical/EngravingRules";
import { OSMDColor } from "../../Common/DataObjects";
import { StaffLine, BoundingBox } from "..";

export class OSMDCommentReaderCalculator {
    private xmlDoc: XMLDocument;
    private rules: EngravingRules;
    private systemToStafflineToCommentMap: Dictionary<number, Dictionary<number, Array<GraphicalComment>>> =
    new Dictionary<number, Dictionary<number, Array<GraphicalComment>>>();

    constructor(rules: EngravingRules, xmlDoc: XMLDocument) {
        this.xmlDoc = xmlDoc;
        this.rules = rules;
        this.rules.ColoringEnabled = true;

        this.read();
    }

    private read(): void {
        for (const systemNode of this.xmlDoc.childNodes[0].childNodes) {
            if (systemNode.nodeName === "system" && systemNode.hasChildNodes) {
                const systemId: number = parseInt((systemNode as Element).getAttribute("id"), 10);
                this.systemToStafflineToCommentMap.setValue(systemId, new Dictionary<number, Array<GraphicalComment>>());
                for (const stafflineNode of systemNode.childNodes) {
                    if (stafflineNode.nodeName === "staffline" && stafflineNode.hasChildNodes) {
                        const staffLineIdx: number = parseInt((stafflineNode as Element).getAttribute("id"), 10);
                        const stafflineToCommentMap: Dictionary<number, Array<GraphicalComment>> = this.systemToStafflineToCommentMap.getValue(systemId);
                        const graphicalCommentList: GraphicalComment[] = new Array<GraphicalComment>();
                        stafflineToCommentMap.setValue(staffLineIdx, graphicalCommentList);
                        for (const staffLineChild of stafflineNode.childNodes) {
                            switch (staffLineChild.nodeName) {
                                case "comment": // Handle marked areas as well? eventually
                                    graphicalCommentList.push(this.graphicalCommentFromNode(staffLineChild as Element));
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
            }
        }
    }

    public GetStafflineComments(musicSystemId: number, stafflineIdx: number, staffline: StaffLine): GraphicalComment[] {
        let commentList: GraphicalComment[] = undefined;

        if (this.systemToStafflineToCommentMap.containsKey(musicSystemId)) {
            const stafflineMapping: Dictionary<number, Array<GraphicalComment>> = this.systemToStafflineToCommentMap.getValue(musicSystemId);
            if (stafflineMapping.containsKey(stafflineIdx)) {
                commentList = stafflineMapping.getValue(stafflineIdx);
                if (commentList) {
                    for (const comment of commentList) {
                        comment.PositionAndShape = new BoundingBox(comment, staffline.PositionAndShape);
                    }
                }
            }
        }

        return commentList;
    }

    private graphicalCommentFromNode(node: Element): GraphicalComment {
        let comment: GraphicalComment = undefined;
        const locationNode: Element = node.getElementsByTagName("location")[0];
        const num: number = parseInt(locationNode.getAttribute("num"), 10);
        const denom: number = parseInt(locationNode.getAttribute("denom"), 10);
        const r: number = parseInt(node.getAttribute("r"), 10);
        const g: number = parseInt(node.getAttribute("g"), 10);
        const b: number = parseInt(node.getAttribute("b"), 10);
        const size: number = parseInt(node.getAttribute("size"), 10);
        let style: number = undefined;
        if (node.hasAttribute("style")) {
            style = parseInt(node.getAttribute("style"), 10);
        }
        let font: number = undefined;
        if (node.hasAttribute("font")) {
            font = parseInt(node.getAttribute("font"), 10);
        }
        const text: string = node.textContent.trim();

        const timestamp: Fraction = new Fraction(num, denom);
        comment = new GraphicalComment(this.rules, text, undefined, timestamp, size, font, new OSMDColor(r, g, b), style);

        return comment;
    }
}
