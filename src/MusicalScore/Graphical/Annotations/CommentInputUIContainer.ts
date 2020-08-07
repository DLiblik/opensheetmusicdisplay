import { PointF2D } from "../../../Common/DataObjects/PointF2D";

export class CommentInputUIContainer {
    private parentElement: HTMLElement;
    private commentInputContainerElement: HTMLSpanElement;
    private commentInputDragger: HTMLElement;
    private commentInputElement: HTMLInputElement;
    private textMeasureElement: HTMLSpanElement;
    private isTouch: boolean;

    constructor(parentElement: HTMLElement = document.body, isTouch: boolean = false) {
        this.isTouch = isTouch;
        this.parentElement = parentElement;
        this.commentInputContainerElement = document.createElement("span");
        this.commentInputContainerElement.classList.add("comment-input-container", "hide");
        this.commentInputContainerElement.style.position = "absolute";
        this.commentInputContainerElement.style.top = "0px";
        this.commentInputContainerElement.style.left = "0px";

        this.commentInputDragger = document.createElement("i");
        this.commentInputDragger.classList.add("comment-input-dragger", "arrows", "alternate", "icon");

        this.commentInputElement = document.createElement("input");
        this.commentInputElement.classList.add("comment-input");
        this.commentInputElement.type = "text";
        this.commentInputElement.size = 1;

        this.textMeasureElement = document.createElement("span");
        this.textMeasureElement.style.position = "absolute";
        this.textMeasureElement.style.visibility = "hidden";
        this.textMeasureElement.style.zIndex = "-99999";

        this.commentInputContainerElement.appendChild(this.commentInputDragger);
        this.commentInputContainerElement.appendChild(this.commentInputElement);

        this.parentElement.appendChild(this.commentInputContainerElement);
        this.parentElement.appendChild(this.textMeasureElement);
        this.FontSize = 12;
        this.FontFamily = "Times New Roman";
    }

    private fontSize: number = 12;
    public set FontSize(size: number) {
        this.fontSize = size;
        const fontSizeString: string = this.fontSize + "px";
        this.textMeasureElement.style.fontSize = fontSizeString;
        this.commentInputElement.style.fontSize = fontSizeString;
    }
    public get FontSize(): number {
        return this.fontSize;
    }

    public set FontFamily(family: string) {
        this.textMeasureElement.style.fontFamily = family;
        this.commentInputElement.style.fontFamily = family;
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

    private xLocation: number = 0;
    private yLocation: number = 0;
    public get Location(): PointF2D {
        return new PointF2D(this.xLocation, this.yLocation);
    }

    private place(x: number, y: number): void {
        this.commentInputContainerElement.style.top = y + "px";
        this.commentInputContainerElement.style.left = x + "px";
        this.xLocation = x;
        this.yLocation = y;
    }

    private resize(): void {
        this.textMeasureElement.textContent = this.commentInputElement.value;
        const width: number = this.textMeasureElement.clientWidth + 8;
        this.commentInputElement.style.width = width + "px";
    }

    public hideAndClear(): void {
        this.commentInputElement.value = "";
        this.commentInputElement.style.width = "8px";
        this.commentInputContainerElement.classList.add("hide");
    }

    private pos1: number = 0;
    private pos2: number = 0;
    private pos3: number = 0;
    private pos4: number = 0;

    public show(renderLocation: PointF2D): void {
        this.commentInputContainerElement.classList.remove("hide");
        this.place(renderLocation.x - this.commentInputDragger.clientWidth / 2,
                   renderLocation.y - this.commentInputElement.clientHeight / 2);
        const self: CommentInputUIContainer = this;

        const downEventName: string = this.isTouch ? "ontouchstart" : "onmousedown";
        const upEventName: string = this.isTouch ?  "ontouchend" : "onmouseup";
        const moveEventName: string = this.isTouch ? "ontouchmove" : "onmousemove";
        console.log(downEventName, upEventName, moveEventName);
        this.commentInputDragger[downEventName] = function(downEvent: MouseEvent | TouchEvent): void {
            downEvent.preventDefault();
            if (self.isTouch && downEvent instanceof TouchEvent) {
                self.pos3 = downEvent.touches[0].clientX;
                self.pos4 = downEvent.touches[0].clientY;
            } else if (downEvent instanceof MouseEvent) {
                self.pos3 = downEvent.clientX;
                self.pos4 = downEvent.clientY;
            }
            document[upEventName] = function(upEvent: MouseEvent | TouchEvent): void {
                document[upEventName] = undefined;
                document[moveEventName] = undefined;
                /*let x: number = 0;
                let y: number = 0;
                if (self.isTouch && upEvent instanceof TouchEvent) {
                    x = upEvent.changedTouches[0].clientX;
                    y = upEvent.changedTouches[0].clientY;
                } else if (upEvent instanceof MouseEvent) {
                    x = upEvent.clientX;
                    y = upEvent.clientY;
                }
                //nearestVoiceEntry = self.aManager.getNearestVoiceEntry(self.getOSMDCoordinates(new PointF2D(x, y)));
                console.log("eventup", x, y);*/
            };
            // call a function whenever the cursor moves:
            document[moveEventName] = function(mouseMoveEvent: MouseEvent | TouchEvent): void {
                mouseMoveEvent.preventDefault();
                let x: number = 0;
                let y: number = 0;
                if (self.isTouch && mouseMoveEvent instanceof TouchEvent) {
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
    }
}
