import { AUIController } from "./Interfaces/AUIController";
export class CommentStylingUIEvents {

}
export class CommentStylingUI extends AUIController {
    public readonly ValidEvents: string[] = [
        "onColorChange",
        "onSizeChange",
        "onAdd",
        "onCancel"
    ];
    private stylingUIContainerElement: HTMLDivElement;
    private colorInputElement: HTMLInputElement;
    private fontSizeInputElement: HTMLInputElement;
    private addCommentButton: HTMLButtonElement;
    private cancelCommentButton: HTMLButtonElement;

    protected initialize(): void {
        this.stylingUIContainerElement = document.createElement("div");
        this.stylingUIContainerElement.classList.add("annotations-ui-container");
        this.stylingUIContainerElement.classList.add("hide");

        const heading: HTMLHeadingElement = document.createElement("h5");
        heading.innerText = "Style Comment";

        this.colorInputElement = document.createElement("input");
        this.colorInputElement.type = "color";
        this.colorInputElement.value = "#000000";
        this.colorInputElement.classList.add("font-color");
        this.colorInputElement.classList.add("input");

        this.fontSizeInputElement = document.createElement("input");
        this.fontSizeInputElement.type = "number";
        this.fontSizeInputElement.min = "0";
        this.fontSizeInputElement.max = "72";
        this.fontSizeInputElement.classList.add("font-size");
        this.fontSizeInputElement.classList.add("input");
        this.fontSizeInputElement.placeholder = "Font Size";

        this.addCommentButton = document.createElement("button");
        this.addCommentButton.innerText = "Add Comment";
        this.addCommentButton.classList.add("add-comment");
        this.addCommentButton.classList.add("button");

        this.cancelCommentButton = document.createElement("button");
        this.cancelCommentButton.innerText = "Cancel";
        this.cancelCommentButton.classList.add("cancel");
        this.cancelCommentButton.classList.add("button");

        this.stylingUIContainerElement.appendChild(heading);
        this.stylingUIContainerElement.appendChild(this.colorInputElement);
        this.stylingUIContainerElement.appendChild(this.fontSizeInputElement);
        this.stylingUIContainerElement.appendChild(this.addCommentButton);
        this.stylingUIContainerElement.appendChild(this.cancelCommentButton);

        this.parentElement.appendChild(this.stylingUIContainerElement);
    }

    public hideAndClear(): void {
        this.stylingUIContainerElement.classList.add("hide");
        this.colorInputElement.value = "";
        this.fontSizeInputElement.value = "";
    }

    public show(): void {
        this.stylingUIContainerElement.classList.remove("hide");
        const self: CommentStylingUI = this;
        this.addCommentButton.onclick = function(ev: MouseEvent): void {
            this.onclick = undefined;
            self.eventListener.onAdd(ev);
            self.hideAndClear();
        };
        this.cancelCommentButton.onclick = function(ev: MouseEvent): void {
            this.onclick = undefined;
            self.eventListener.onCancel(ev);
            self.hideAndClear();
        };
        this.fontSizeInputElement.onchange = undefined;
        this.colorInputElement.onchange = function(ev: Event): void {
            self.eventListener.onColorChange(ev);
        };
        this.fontSizeInputElement.onchange = undefined;
        this.fontSizeInputElement.onchange = function(ev: Event): void {
            self.eventListener.onSizeChange(ev);
        };
    }
}
