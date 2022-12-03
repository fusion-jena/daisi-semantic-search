import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NodeService} from '../services/remote/node.service';
import {environment} from '../../environments/environment';
import {Basket} from '../models/basket';
import {Hit} from '../models/result/hit';
import {plainToClass} from 'class-transformer';
import {KeycloakService} from 'keycloak-angular';
import {MessageService} from '../services/local/message.service';
@Component({
    selector: 'app-basket-dialog',
    templateUrl: './basket-dialog.component.html',
    styleUrls: ['./basket-dialog.component.css']
})
export class BasketDialogComponent implements OnInit {
    // text for mouseover
    textTooltipBasketVATvisualizable = environment.textTooltipBasketVATvisualizable;
    textTooltipBasketVATnotVisualizable = environment.textTooltipBasketVATnotVisualizable;
    textTooltipBasketDataAvailable = environment.textTooltipBasketDataAvailable;
    textTooltipBasketDataNotAvailable = environment.textTooltipBasketDataNotAvailable;
    textTooltipBasketMetadataAvailable = environment.textTooltipBasketMetadataAvailable;
    textTooltipBasketMetadataNotAvailable = environment.textTooltipBasketMetadataNotAvailable;
    textTooltipBasketMultimediaAvailable = environment.textTooltipBasketMultimediaAvailable;
    textTooltipBasketMultimediaNotAvailable = environment.textTooltipBasketMultimediaNotAvailable;
    textTooltipBasketRemove = environment.textTooltipBasketRemove;
	textTooltipBasketRemoveSure = environment.textTooltipBasketRemoveSure;
    textTooltipBasketEmpty = environment.textTooltipBasketEmpty;
    spinner = false;
    savedData: Array<Hit> = [];
    docIds: Array<Object> = [];
    user;
    basketId: string = "";

    constructor(
        public dialogRef: MatDialogRef<BasketDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data, private nodeService: NodeService,private messageService: MessageService,private keycloakService: KeycloakService) {
	    this.data.forEach(entry =>{
		  this.docIds.push({'id':entry.id});
		});
    }

    ngOnInit(): void {
        this.initializeUserOptions();
        this.basketId = "";
    }

    remove(item): void {
        const index = this.data.indexOf(item);
        if (index >= 0) {
            this.data.splice(index, 1);
        }
    }

    async downloadZip(): Promise<void> {
        this.spinner = true;
        
        const basket = {
            //basket: this.data
            basket: this.docIds
        };
        if(environment.loggingFlag){
             	let message = <any>{}; 
                message.action = 'Download clicked';
                message.basket = this.docIds;
                message.component = this.messageService.component;
                message.originalQuery = this.messageService.getOriginalQuery();
                message.fullQuery = this.messageService.getFullQuery();
                const res = await this.nodeService.log(message);
            
           }
        this.nodeService.basketDownload(basket).subscribe(data => this.downloadSuccess(data),
            err => this.downloadFailed());


    }

    downloadFailed(): void {
        alert(environment.textAlertBasketErrorDownload);
        this.spinner = false;
    }

    downloadSuccess(blob): void {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.click();
        URL.revokeObjectURL(objectUrl);
        this.spinner = false;
    }

    emptyBasket(): void {
        const r = confirm('Are you sure that you want to empty the basket?');
        if (r === true) {
            this.data.splice(0, this.data.length);
            // this.saveBasket();
        }
    }

    saveBasket(): void {
        const basket = new Basket();
        basket.setContent(this.data);
        basket.setUserId(this.user);
        this.nodeService.addToBasket(basket).subscribe(val => {
	       
            this.basketId = JSON.stringify(val.basketId);
        });
        this.savedData = this.data.slice(0);
    }

    checkSaveButton(): boolean {
        if (this.data.length === 0) {
            return true;
        }
        return JSON.stringify(this.data) === JSON.stringify(this.savedData);
    }

    visualize(): void {
        alert(this.basketId);
    }

    private initializeUserOptions(): void {
        try{
            this.user = this.keycloakService.getUsername(); //users don't exist'
            if (this.user !== undefined) {
                this.nodeService.readFromBasket(this.user).subscribe(result => {
                    if (result.length !== 0) {
                        const basket = JSON.parse(result[0]?.basketcontent)?.selected;
                        
						basket.forEach(item => {
                            // too simple!! not every index provides the exact model attributes!! a mapping is required
							const hit: Hit = plainToClass(Hit, item);
							
                            //this.docIds.push({'id':hit.getId(),'rank':hit.getRank()});
                            this.savedData.push(hit);
                        });
                        
                    }
                });
            }else{
                this.user = null;
            }
        }catch{
            this.user = null;
        }
        
    }
    
}
