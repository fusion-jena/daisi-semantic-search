import {Component, EventEmitter, OnInit, Input, Output, ViewChild} from '@angular/core';
import {NodeService} from '../services/remote/node.service';
import {CommunicationService} from '../services/local/communication.service';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {environment} from '../../environments/environment';

import { MatRadioButton, MatRadioChange } from '@angular/material/radio';
import {MessageService} from '../services/local/message.service';
import {UtilityService} from '../services/utility.service';
@Component({
  selector: 'app-search-input-semantic',
  templateUrl: './search-input-semantic.component.html',
  styleUrls: ['./search-input-semantic.component.css']
})
export class SearchInputSemanticComponent implements OnInit {

  constructor(private nodeService: NodeService,
                private communicationService: CommunicationService,
                private messageService: MessageService, private utilityService: UtilityService) {
    }

    faSearch = faSearch;
    searchKey: any;
    
    result: any;
    windowSuggestion = false;
    semanticValue: boolean;
    formatSimpleSearch = /[!@#$%^&_\-=\[\]{};:\\,<>\/?]+/;
    formatSemanticSearch = /[!@#$%^&_\-=\[\]{};:\\,<>\/?]+/;
    alertSearch = false;
    alertSemanticSearch = false;
    semSearchImg: string = environment.imagePath + environment.semSearchImg;
    placeholder = "search for species, habitats and data parameters, e.g., bees AND grassland";
    showMore = false;
    revisedQueryInterpretation = [];

      @ViewChild('and') 
	  andRB: MatRadioButton;
	
	  @ViewChild('or') 
	  orRB: MatRadioButton; 
    @Input() component='';
    @Input() ORsearch: boolean;
    @Input() queryInterpretation: Object[];
    @Output() searchKeyEmit = new EventEmitter<any>();
    @Output() radioEvent = new EventEmitter<any>();
  
  ngOnInit(): void {
	this.revisedQueryInterpretation = [];
	/*if(this.queryInterpretation!=null){
		this.queryInterpretation?.forEach(component =>{
			let c = {'type':component["type"],'term':component["term"],'icon':component["icon"]};
			let i = [];
			let instances = component["instances"];
			instances?.forEach(instance =>{
				let ru = this.utilityService.replaceURI(instance["URI"]);
				let ra = this.utilityService.splitURI(instance["URI"]);
				let o = {'URI':ru, 'terminology':ra[0],'ID':ra[1]};
				i.push(o); 
			});
			c["instances"] = i;
			this.revisedQueryInterpretation.push(c);
		});
	 
	}*/
  }
   // by entering a letter on the form, a request will be sent to the node server and then it will be sent to suggestion-window
    onWindowSuggestKey(value): void {
	    this.revisedQueryInterpretation = [];
        this.showMore = false;
        if (value !== undefined) {
            (document.getElementById('searchField') as HTMLInputElement).value = value;
            this.searchKey = value;
            //this.alertSearch = this.formatSimpleSearch.test(this.searchKey);
            //this.alertSemanticSearch = false;
            //this.startSearching(this.semanticValue);
            this.windowSuggestion = false;
        }
    }


    onSubmit(data): void {
	  this.revisedQueryInterpretation = [];
      this.showMore = false;
	  console.log('Key: '+data.biodiv2semanticInput);
      this.searchKeyEmit.emit(data.biodiv2semanticInput);
    }

    onSuggest(): void {
	    this.revisedQueryInterpretation = [];
        this.showMore = false;
        this.nodeService.suggestSimple(this.searchKey).subscribe(data => {
            this.communicationService.setSuggest(data.suggest[0].options);
            this.windowSuggestion = data.suggest[0].options.length !== 0;
        });
    }
    onSelectionChange(mrChange: MatRadioChange) {
   
   		this.radioEvent.emit(mrChange.value);
   
   } 


 
  async queryInterpretationClicked(): Promise<void> {
    this.showMore = true;
    if(this.queryInterpretation!=null){
		this.queryInterpretation?.forEach(component =>{
			let c = {'type':component["type"],'term':component["term"],'icon':component["icon"]};
			let i = [];
			let instances = component["instances"];
			instances?.forEach(instance =>{
				let ru = this.utilityService.replaceURI(instance["URI"]);
				let ra = this.utilityService.splitURI(instance["URI"]);
				let o = {'URI':ru, 'terminology':ra[0],'ID':ra[1]};
				i.push(o); 
			});
			c["instances"] = i;
			this.revisedQueryInterpretation.push(c);
		});
	 
	}
   // console.log('showMore is true');
    if(environment.loggingFlag){
             	let message = <any>{}; 
                message.action = 'Query interpretation clicked';              
                message.component = this.component;
                message.originalQuery = this.messageService.getOriginalQuery();
                message.fullQuery = this.messageService.getFullQuery();
                const res = await this.nodeService.log(message);
            
           }
    
  }
  hideQueryInterpretationClicked(): void {
    this.showMore = false;
    this.revisedQueryInterpretation = [];
    
  }
  

}
