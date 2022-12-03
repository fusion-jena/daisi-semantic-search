import {Component, Inject, OnInit} from '@angular/core';
import {Citation} from '../models/result/citation';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Hit} from '../models/result/hit';
@Component({
    selector: 'app-citation',
    templateUrl: './citation.component.html',
    styleUrls: ['./citation.component.css']
})
export class CitationComponent implements OnInit {
    result: Citation;

    constructor(@Inject(MAT_DIALOG_DATA) public data: Hit) {
    }
    ngOnInit(): void {
        this.result = this.data.getCitation();
    }
}
