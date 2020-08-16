import { PointF2D } from "../../../Common/DataObjects/PointF2D";
import { AUIController } from "./Interfaces/AUIController";

export class CommentInputUI extends AUIController {
    public ValidEvents: string[];
    private commentInputContainerElement: HTMLSpanElement;
    private commentInputDragger: HTMLElement;
    private commentInputElement: HTMLTextAreaElement;
    private textMeasureElement: HTMLSpanElement;

    protected initialize(): void {
        //TODO: Seperate View from Controller? (like UI Handler now has)
        this.commentInputContainerElement = document.createElement("span");
        this.commentInputContainerElement.classList.add("comment-input-container", "hide");
        this.commentInputContainerElement.style.position = "absolute";
        this.commentInputContainerElement.style.top = "0px";
        this.commentInputContainerElement.style.left = "0px";

        this.commentInputDragger = document.createElement("i");
        this.commentInputDragger.classList.add("comment-input-dragger", "arrows", "alternate", "icon");

        this.commentInputElement = document.createElement("textarea");
        this.commentInputElement.classList.add("comment-input");
        this.commentInputElement.style.lineHeight = "1.15";
        this.commentInputElement.style.resize = "none";
        this.commentInputElement.style.overflow = "hidden";

        this.textMeasureElement = document.createElement("span");
        this.textMeasureElement.style.position = "absolute";
        this.textMeasureElement.style.visibility = "hidden";
        this.textMeasureElement.style.zIndex = "-99999";
        this.textMeasureElement.style.lineHeight = "1.15";

        this.commentInputContainerElement.appendChild(this.commentInputDragger);
        this.commentInputContainerElement.appendChild(this.commentInputElement);

        this.parentElement.appendChild(this.commentInputContainerElement);
        this.parentElement.appendChild(this.textMeasureElement);
        this.defaultValues();
    }

    private defaultValues(): void {
        this.FontSize = 14;
        this.FontFamily = "Times New Roman";
        this.LineHeight = 1.15;
    }

    private lineHeight: number = 1.15;
    public set LineHeight(height: number) {
        this.lineHeight = height;
        this.textMeasureElement.style.lineHeight = this.lineHeight.toString();
        this.commentInputElement.style.lineHeight = this.lineHeight.toString();
        this.resize();
    }
    public get LineHeight(): number {
        return this.lineHeight;
    }

    private fontSize: number = 14;
    public set FontSize(size: number) {
        this.fontSize = size;
        const fontSizeString: string = this.fontSize + "px";
        this.textMeasureElement.style.fontSize = fontSizeString;
        this.commentInputElement.style.fontSize = fontSizeString;
        this.resize();
    }
    public get FontSize(): number {
        return this.fontSize;
    }

    public set FontFamily(family: string) {
        this.textMeasureElement.style.fontFamily = family;
        this.commentInputElement.style.fontFamily = family;
        this.resize();
    }
    public get FontFamily(): string {
        return this.commentInputElement.style.fontFamily;
    }

    public set FontColor(color: string) {
        this.commentInputElement.style.color = color;
    }
    public get FontColor(): string {
        return this.commentInputElement.style.color;
    }
    public get TextValue(): string {
        return this.commentInputElement.value;
    }
    public set TextValue(value: string) {
     this.commentInputElement.value = value;
     this.resize();
    }

    private xLocation: number = 0;
    private yLocation: number = 0;
    public get Location(): PointF2D {
        return new PointF2D(this.xLocation + this.commentInputDragger.clientWidth, this.yLocation);
    }

    private place(x: number, y: number): void {
        this.commentInputContainerElement.style.top = y + "px";
        this.commentInputContainerElement.style.left = x + "px";
        this.xLocation = x;
        this.yLocation = y;
    }

    private resize(): void {
        this.textMeasureElement.innerHTML = this.commentInputElement.value.replace(/(\r\n|\n|\r)/g, "<br>");
        const width: number = this.textMeasureElement.clientWidth + 14;
        const height: number = this.textMeasureElement.clientHeight + this.fontSize * 1.5;
        this.commentInputElement.style.width = width + "px";
        this.commentInputElement.style.height = height + "px";
    }

    public hideAndClear(): void {
        this.commentInputContainerElement.classList.add("hide");
        this.commentInputElement.value = "";
        this.commentInputElement.style.width = "8px";
        this.defaultValues();
    }

    private pos1: number = 0;
    private pos2: number = 0;
    private pos3: number = 0;
    private pos4: number = 0;

    public show(renderLocation: PointF2D): void {
        this.place(renderLocation.x - this.commentInputDragger.clientWidth / 2,
                   renderLocation.y - this.commentInputElement.clientHeight / 2);
        const self: CommentInputUI = this;

        const downEventName: string = this.isTouchDevice ? "ontouchstart" : "onmousedown";
        const upEventName: string = this.isTouchDevice ?  "ontouchend" : "onmouseup";
        const moveEventName: string = this.isTouchDevice ? "ontouchmove" : "onmousemove";
        this.commentInputDragger[downEventName] = function(downEvent: MouseEvent | TouchEvent): void {
            downEvent.preventDefault();
            if (self.isTouchDevice && downEvent instanceof TouchEvent) {
                self.pos3 = downEvent.touches[0].clientX;
                self.pos4 = downEvent.touches[0].clientY;
            } else if (downEvent instanceof MouseEvent) {
                self.pos3 = downEvent.clientX;
                self.pos4 = downEvent.clientY;
            }
            document[upEventName] = function(upEvent: MouseEvent | TouchEvent): void {
                document[upEventName] = undefined;
                document[moveEventName] = undefined;
            };
            // call a function whenever the cursor moves:
            document[moveEventName] = function(mouseMoveEvent: MouseEvent | TouchEvent): void {
                mouseMoveEvent.preventDefault();
                let x: number = 0;
                let y: number = 0;
                if (self.isTouchDevice && mouseMoveEvent instanceof TouchEvent) {
                    x = mouseMoveEvent.touches[0].clientX;
                    y = mouseMoveEvent.touches[0].clientY;
                } else if (mouseMoveEvent instanceof MouseEvent) {
                    x = mouseMoveEvent.clientX;
                    y = mouseMoveEvent.clientY;
                }
                // calculate the new cursor position:
                self.pos1 = self.pos3 - x;
                self.pos2 = self.pos4 - y;
                self.pos3 = x;
                self.pos4 = y;
                // set the element's new position:
                self.place((self.commentInputContainerElement.offsetLeft - self.pos1), (self.commentInputContainerElement.offsetTop - self.pos2));
            };
        };
        this.commentInputElement.oninput = undefined;
        this.commentInputElement.oninput = function(ev: Event): void {
            self.resize();
        };
        this.commentInputContainerElement.classList.remove("hide");
    }
}
