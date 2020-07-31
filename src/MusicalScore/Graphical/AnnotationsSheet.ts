import { GraphicalComment } from "../Graphical/GraphicalComment";
import Dictionary from "typescript-collections/dist/lib/Dictionary";

export class AnnotationsSheet {
    private stafflineToCommentMap: Dictionary<number, Array<GraphicalComment>> =
    new Dictionary<number, Array<GraphicalComment>>();

    public AddCommentToStaffLine(stafflineIdx: number, comment: GraphicalComment): void {
        let currentList: Array<GraphicalComment>;
        if (!this.stafflineToCommentMap.containsKey(stafflineIdx)) {
            currentList = new Array<GraphicalComment>();
            this.stafflineToCommentMap.setValue(stafflineIdx, currentList);
        } else {
            currentList = this.stafflineToCommentMap.getValue(stafflineIdx);
        }

        currentList.push(comment);
    }

    public setStaffLineComments(stafflineIdx: number, commentList: Array<GraphicalComment>): Array<GraphicalComment> {
        return this.stafflineToCommentMap.setValue(stafflineIdx, commentList);
    }

    public GetCommentListForStaffLine(stafflineIdx: number): Array<GraphicalComment> {
        return this.stafflineToCommentMap.getValue(stafflineIdx);
    }
}
