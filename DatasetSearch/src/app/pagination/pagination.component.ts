import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Result} from '../models/result/result';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Component({
    selector: 'app-pagination',
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnChanges {
    @Input() result!: Result;
    @Output() paginationClicked = new EventEmitter<any>();
    items = [];
    pageOfItems: Array<any>;
    counter = 2;
    entries = 0;
    isSend = false;
    maxPageNum = 10;

    constructor(breakpointObserver: BreakpointObserver) {
        breakpointObserver.observe([
            Breakpoints.HandsetLandscape,
            Breakpoints.HandsetPortrait
        ]).subscribe(result => {
            if (result.matches) {
                this.maxPageNum = 3;
            }
        });
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.result?.currentValue?.getTotalNumber() !== changes?.result?.previousValue?.getTotalNumber()){
            if (!isNaN(changes?.result?.currentValue?.getTotalNumber())){
                this.items = Array(changes?.result?.currentValue?.getTotalNumber()).fill(0);
                this.entries = changes?.result?.currentValue?.getTotalNumber();
            }
        }
    }
    onChangePage(pageOfItems: Array<any>): void {
        // update current page of items
        this.pageOfItems = pageOfItems;
        if (this.isSend) {
            const elements = document.querySelector('.pagination .active');
            const index = Number((elements as HTMLElement).innerText);
            const from = (index - 1) * 10;
            this.paginationClicked.emit(from);
            this.isSend = false;
        }
    }
}
