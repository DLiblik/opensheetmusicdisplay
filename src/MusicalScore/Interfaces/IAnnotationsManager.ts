import { GraphicalVoiceEntry } from "../Graphical";
import { IAnnotationsUIHandler } from "./IAnnotationsUIHandler";
import { PointF2D } from "../../Common/DataObjects/PointF2D";

export interface IAnnotationsManager {
  initialize(uiController: IAnnotationsUIHandler): void;
  //When a user clicks on or near a note (Graphical Voice Entry)
  handleClick(absoluteClickLocation: PointF2D, sheetClickLocation: PointF2D, nearestVoiceEntry: GraphicalVoiceEntry): void;
}
