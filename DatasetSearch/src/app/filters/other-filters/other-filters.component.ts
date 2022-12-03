import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-other-filters',
    templateUrl: './other-filters.component.html',
    styleUrls: ['./other-filters.component.css']
})
export class OtherFiltersComponent implements OnInit {

    constructor() {
    }

    @Input() filter;
    @Input() filterValues;
    @Output() chosenFilter = new EventEmitter<any>();

    ngOnInit(): void {
        this.filterValues.forEach((value) => {
            this.filter.forEach((item) => {
                if (value === item.label) {
                    // console.log(item.label);
                    item.checked = true;
                }
            });
        });
    }

    sendFilter(type, value, label): void {
        const keyAndFilter = [type, value, label];
        this.chosenFilter.emit(keyAndFilter);
    }
}
