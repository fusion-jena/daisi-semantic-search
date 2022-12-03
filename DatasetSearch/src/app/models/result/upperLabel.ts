// the colorful labels on the upper side of every dataset
export class UpperLabel{
    // the text inside the label
    private innerInfo: string;
    // the tooltip which will be shown by hovering over the label
    private tooltip: string;
    // the color class in the css file to show the color of the label
    private colorClass: string;

    getInnerInfo(): string {
        return this.innerInfo;
    }

    setInnerInfo(innerInfo: string): void {
        this.innerInfo = innerInfo;
    }
    getTooltip(): string {
        return this.tooltip;
    }

    setTooltip(tooltip: string): void {
        this.tooltip = tooltip;
    }
    getColorClass(): string {
        return this.colorClass;
    }

    setColorClass(colorClass: string): void {
        this.colorClass = colorClass;
    }
}
