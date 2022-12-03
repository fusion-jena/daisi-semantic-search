import {Component, Input, OnInit, Output} from '@angular/core';
import {CommunicationService} from '../../services/local/communication.service';
import {EventEmitter} from '@angular/core';
import {Aggregation} from '../../models/result/aggregation';


@Component({
    selector: 'app-filter-box',
    templateUrl: './filter-box.component.html',
    styleUrls: ['./filter-box.component.css']
})
export class FilterBoxComponent implements OnInit {
    @Input() filters: Aggregation;
    @Output() chosenFacet = new EventEmitter<any>();
    showMore = false;

    constructor(private communicationService: CommunicationService) {
    }

    ngOnInit(): void {
        const filter = this.communicationService.getFilter();
        if (filter !== undefined) {
            filter.forEach(result => {
                this.filters.getFacets().forEach(item => {
                    this.checkFilter(item, result, this.filters.getId() + 'Facet');
                });
            });
        }
    }

    showLess(i): boolean {
        if (this.showMore === true) {
            return true;
        }
        return i < 5;
    }

    checkFilter(item, value, facet): void {
        if (value.hasOwnProperty('term')) {
            if (item.getKey() === value.term[facet]) {
                item.setChecked(true);
            }
        }
    }

    sendFacet(key, facet): void {
        const keyAndFacet = [key, facet];
        this.chosenFacet.emit(keyAndFacet);
    }
}
