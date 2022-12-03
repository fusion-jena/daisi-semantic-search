// the citation for every dataset
export class Citation {
    // the title of the dataset
    private title: string;
    // the name of the authors
    private creator: Array<string>;
    // the publication date
    private date: string;
    private source: string;
    // the url
    private DOI: string;
    private dataCenter: string;

    getTitle(): string {
        return this.title;
    }

    setTitle(title: string): void {
        this.title = title;
    }

    getCreator(): Array<string> {
        return this.creator;
    }

    setCreator(creator: Array<string>): void {
        this.creator = creator;
    }

    getDate(): string {
        return this.date;
    }

    setDate(date: string): void {
        this.date = date;
    }

    getPubYear(): string {
        return this.date?.substring(0, 4);
    }

    getSource(): string {
        return this.source;
    }

    setSource(source: string): void {
        this.source = source;
    }

    getDOI(): string {
        return this.DOI;
    }

    setDOI(DOI: string): void {
        this.DOI = DOI;
    }

    getDataCenter(): string {
        return this.dataCenter.toUpperCase();
    }

    setDataCenter(dataCenter: string): void {
        this.dataCenter = dataCenter;
    }

}
