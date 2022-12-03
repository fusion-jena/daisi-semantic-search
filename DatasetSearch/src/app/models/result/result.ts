import {Aggregation} from './aggregation';
import {Hit} from './hit';

// the response from server
export class Result {
    // the response from server contains several datasets
    private hits: Hit[];
    // the extended semantic keys related to the search key
    private semanticKeys: [];
    private termData: [];
    // the number of founded datasets related to the search key
    private totalNumber: number;
    // filters which contains facets(it changes in every request)
    private aggregations: Aggregation[];
    // the filters which don't change by new request
    private otherFilters: Array<any>;
    private datePickers: Array<any>;
    private annotationText: string;

    private highlighting: string[] = [];

    getHits(): Hit[] {
        return this.hits;
    }

    setHits(hits: Hit[]): void {
        this.hits = hits;
    }

    getOtherFilters(): Array<any> {
        return this.otherFilters;
    }

    setOtherFilters(otherFilters: Array<any>): void {
        this.otherFilters = otherFilters;
    }

    getDatePickers(): Array<any> {
        return this.datePickers;
    }

    setDatePickers(datePickers: Array<any>): void {
        this.datePickers = datePickers;
    }

    getSemanticKeys(): string[] {
        return this.semanticKeys;
    }

    setSemanticKeys(semanticKeys: []): void {
        this.semanticKeys = semanticKeys;
    }

    getTermData(): string[] {
        return this.termData;
    }

    setTermData(termData: []): void {
        this.termData = termData;
    }

    getAggregations(): Aggregation[] {
        return this.aggregations;
    }

    setAggregations(aggregations: Aggregation[]): void {
        this.aggregations = aggregations;
    }

    getTotalNumber(): number {
        return this.totalNumber;
    }

    setTotalNumber(totalNumber: number): void {
        this.totalNumber = totalNumber;
    }

    getAnnotationText(): string {
        return this.annotationText;
    }

    setAnnotationText(annotationText: string): void {
        this.annotationText = annotationText;
    }

   getHighlighting(): string[] {
        return this.highlighting;
    }
   setHighlighting(highlighting: string[]): void{
        this.highlighting = highlighting;
    }
}
