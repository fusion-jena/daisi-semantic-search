import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Result} from '../models/result/result';
import {BasketDialogComponent} from "../basket-dialog/basket-dialog.component";
import {MatDialog} from '@angular/material/dialog';
import {NodeService} from '../services/remote/node.service';
import {Hit} from '../models/result/hit';
import {plainToClass} from 'class-transformer';
import {KeycloakService} from 'keycloak-angular';
import {environment} from '../../environments/environment';

@Component({
    selector: 'app-search-result',
    templateUrl: './search-result.component.html',
    styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit, OnChanges {
    semantic: boolean;
    @Input() result = new Result();
    @Input() component;
    basketValues: Array<Hit> = [];
    @Output() from = new EventEmitter<any>();
    @Output() mapItem = new EventEmitter<any>();
    @Output() ORsearch = new EventEmitter<any>();
    popoverVisible = '';
    user;
    basketId;
    semSearchImg: string = environment.imagePath + environment.semSearchImg;

    constructor(public dialog: MatDialog, private nodeService: NodeService, private keycloakService: KeycloakService) {
    }

    ngOnInit(): void {
        try {
            this.user = this.keycloakService.getUsername();
            if (this.user !== undefined) {
                this.nodeService.readFromBasket(this.user).subscribe(result => {
                    if (result.length !== 0) {
                        const basket = JSON.parse(result[0]?.basketcontent)?.selected;
                        basket.forEach(item => {
                            const hit: Hit = plainToClass(Hit, item);
                            this.basketValues.push(hit);
                        });
                        this.mapItem.emit(this.basketValues);
                    }
                });
            } else {
                this.user = null;
            }
        } catch {
            this.user = null;
        }

        this.basketId = null;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.result?.currentValue !== changes?.result?.previousValue) {
            this.controlCheckboxes(this.basketValues);
        }
    }

    checkBoxClick(item: Hit): void {
        if (item.getCheckBox()) {
            this.basketValues.push(item);
        } else {
            const index = this.basketValues.indexOf(item);
            this.basketValues.splice(index, 1);
        }
        this.mapItem.emit(this.basketValues);
    }

    basketClick(): void {
        const dialogRef = this.dialog.open(BasketDialogComponent, {
            data: this.basketValues,
            disableClose: true
        });
        dialogRef.afterClosed().subscribe(basketValues => {

            this.basketValues = basketValues[0];
            this.result.getHits().forEach(resultValue => {
                resultValue.setCheckbox(false);
            });
            this.controlCheckboxes(this.basketValues);
            this.mapItem.emit(this.basketValues);
        });
    }

    controlCheckboxes(basketValues): void {
        basketValues.forEach(basketValue => {
            const basketId = basketValue.getId();
            this.result.getHits().forEach(resultValue => {
                const resultId = resultValue.getId();
                if (resultId === basketId) {
                    resultValue.setCheckbox(true);
                }
            });
        });
    }

    paginationClicked(from): void {
        this.from.emit(from);
    }

    OR(): void {

        this.ORsearch.emit('OR');
    }
}
