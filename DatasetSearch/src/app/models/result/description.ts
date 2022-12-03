// the descriptions after the title of the dataset
export class Description {
    // the key of the description
    private title: string;
    // the description value with highlights from the search index and (if available) synonyms = relation to search term
    private value: string; 

    //additional highlighting with biological entities
    private biodivValue: string;

    private cleanValue: string;

    getTitle(): string {
        return this.title;
    }

    setTitle(title: string): void {
        this.title = title;
    }
    getValue(): string {
        return this.value;
    }
    getCleanValue(): string {
        return this.cleanValue;
    }
    getBiodivValue(): string {
        return this.biodivValue;
    }
    setValue(value: string): void {
        this.value = value;
    }
    setCleanValue(value: string): void {
        this.cleanValue = value;
    }
	setBiodivValue(value: string): void {
        this.biodivValue = value;
    }
}
