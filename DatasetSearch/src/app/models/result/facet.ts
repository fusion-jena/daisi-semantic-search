// checkbox item in the filter box
export class Facet {
    // the mane of the facet
    private key: string;
    // the number of the available datasets after applying the facet
    private docCount: number;
    // if the facet is activated (by default, it is false)
    private checked = false;

    getKey(): string {
        return this.key;
    }
    setKey(key: string): void {
        this.key = key;
    }
    getChecked(): boolean {
        return this.checked;
    }

    setChecked(check: boolean): void {
        this.checked = check;
    }

    getDocCount(): number {
        return this.docCount;
    }
    setDocCount(docCount: number): void {
        this.docCount = docCount;
    }
}
