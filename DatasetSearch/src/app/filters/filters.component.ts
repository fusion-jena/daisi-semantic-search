import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CommunicationService} from '../services/local/communication.service';
import {Result} from '../models/result/result';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Component({
    selector: 'app-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnChanges {
    @Input() result: Result;
    chosenFilter: Array<object> = [];
    filterValues: Array<string> = [];
    @Output() filters = new EventEmitter<any>();
    @Input() resetFilters: boolean;
    openChart = true;
    constructor(breakpointObserver: BreakpointObserver, private communicationService: CommunicationService) {
        breakpointObserver.observe([
            Breakpoints.HandsetLandscape,
            Breakpoints.HandsetPortrait
        ]).subscribe(result => {
            if (result.matches) {
                this.openChart = false;
            }
        });
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.resetFilters?.currentValue === true){
            this.clearAllFilters();
        }
    }

    sendFilter(keyAndFacet): void {
        const key = keyAndFacet[0];
        const facet = keyAndFacet[1];
        const label = keyAndFacet[2];
        const facetObg = {};
        facetObg[facet] = key;
        let FilterExist = false;
        let index: number;
        this.chosenFilter.forEach((value, i) => {
            // @ts-ignore
            if (value?.term[facet] === key) {
                FilterExist = true;
                index = i;
            }
        });
        if (FilterExist) {
            this.chosenFilter.splice(Number(index), 1);
            this.filterValues.splice(Number(index), 1);
        } else {
            this.chosenFilter.push({term: facetObg});
            if (label !== undefined) {
                this.filterValues.push(label);
            } else {
                this.filterValues.push(key);
            }
        }
        this.startSearching();
    }

    startSearching(): void {
        this.filters.emit(this.chosenFilter);
        // console.log(this.chosenFilter);
        // console.log(this.filterValues);
    }

    removeFilter(i): void {
        this.communicationService.setRemovedFilter([this.filterValues[i]]);
        this.filterValues.splice(i, 1);
        this.chosenFilter.splice(i, 1);
        this.startSearching();
    }

    clearAllFilters(): void {
        this.communicationService.setRemovedFilter(this.filterValues);
        this.chosenFilter = [];
        this.filterValues = [];
        this.communicationService.setFilter(this.chosenFilter);
    }

    onClearAllFilters(): void {
        this.clearAllFilters();
        this.startSearching();
    }

    applyDate(dates, datePicker): void {
        // console.log(dates);
        const start = dates[0];
        const end = dates[1];
        if (start !== undefined || end !== undefined) {
            // tslint:disable-next-line:forin
            for (const i in this.filterValues){
                datePicker.inputs.forEach((input) => {
                    if (this.filterValues[i] === input.name) {
                        this.chosenFilter.splice(Number(i), 1);
                        this.filterValues.splice(Number(i), 1);
                    }
                });
            }
            if (datePicker.type === 'collection') {
                if (start !== undefined) {
                    const date = {
                        range: {maxDateTime: {gte: start}}
                    };
                    this.chosenFilter.push(date);
                    this.filterValues.push('Collection start date');
                }
                if (end !== undefined) {
                    const date = {
                        range: {minDateTime: {lte: end}}
                    };
                    this.chosenFilter.push(date);
                    this.filterValues.push('Collection end date');
                }
            }
            if (datePicker.type === 'publication') {
                if (start !== undefined) {
                    const date = {
                        range: {citation_yearFacet: {gte: start}}
                    };
                    this.chosenFilter.push(date);
                    this.filterValues.push('Publication start date');
                }
                if (end !== undefined) {
                    const date = {
                        range: {citation_yearFacet: {lte: end}}
                    };
                    this.chosenFilter.push(date);
                    this.filterValues.push('Publication end date');
                }
            }
            this.startSearching();
        }
    }
}
