// it contains the information related to the download of the dataset
export class Linkage {
    private data: string;
    private metadata: string;
    private multimedia: Array<any>;

    getData(): string {
        return this.data;
    }

    setData(data: string): void {
        this.data = data;
    }

    getMetadata(): string {
        return this.metadata;
    }

    setMetadata(metadata: string): void {
        // if(metadata != "undefined" && metadata != null)
        // {
        //     this.metadata = encodeURI(metadata);
        // }else{
        //     this.metadata = null;
        // }

        this.metadata = metadata;
    }
    getMultimedia(): Array<any> {
        return this.multimedia;
    }

    setMultimedia(multimedia: Array<any>): void {
        this.multimedia = multimedia;
    }
}
