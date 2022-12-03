import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {faQuoteLeft} from '@fortawesome/free-solid-svg-icons';
import {faVolumeUp} from '@fortawesome/free-solid-svg-icons';
import {faVideo} from '@fortawesome/free-solid-svg-icons';
import {faImage} from '@fortawesome/free-solid-svg-icons';
import {CitationComponent} from '../../citation/citation.component';
import {CommunicationService} from '../../services/local/communication.service';
import {DomSanitizer} from '@angular/platform-browser';
import {MatDialog} from '@angular/material/dialog';
import {Hit} from '../../models/result/hit';
import {ViewEncapsulation} from '@angular/core';
import {environment} from '../../../environments/environment';
import {NodeService} from '../../services/remote/node.service';
import {SemanticAssistantService} from '../../services/remote/semantic-assistant.service';
import {MessageService} from '../../services/local/message.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {UtilityService} from '../../services/utility.service';
@Component({
    selector: 'app-result-item',
    templateUrl: './result-item.component.html',
    styleUrls: ['./result-item.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class ResultItemComponent implements OnInit {
    @Input() item: Hit;
    @Input() itemId;
    @Input() component;
    faVolumeUp = faVolumeUp;
    faVideo = faVideo;
    faImage = faImage;
    faQuoteLeft = faQuoteLeft;

    vatImg: string = environment.imagePath + environment.vatImg;
    imagePath: string = environment.imagePath;
    //itemTitleWithEntities: Hit;
    //titleWithHighlights = '';
    //descriptionWithHighlights = [];
    showBiodiv = false;
    @Output() checkBoxItem = new EventEmitter<any>();

    constructor(private communicationService: CommunicationService, private utilityService: UtilityService,private spinner: NgxSpinnerService, private semanticAssistantService: SemanticAssistantService, private nodeService: NodeService, private messageService: MessageService, private sanitizer: DomSanitizer, public dialog: MatDialog) {
    }

    ngOnInit(): void {
	  /*this.communicationService.getHitWithBiodivEntities().subscribe(value => {
            if (value !== undefined) {
                this.itemTitleWithEntities = value;
            }
        });*/
    }

    openDialog(i): void {

        this.communicationService.setCitation(i);
        const dialogRef = this.dialog.open(CitationComponent, {
            data: this.item
        });
    }

    sanitize(url: string): any {
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }

    checkBox(key, value): void {
        this.item.setCheckbox(value.checked);
        this.checkBoxItem.emit(this.item);
    }
    async clickOnTitle(id,title,url,rank): Promise<void>{
	  console.log(title);
      //this.stripHtml(title);
      if(environment.loggingFlag){
             	let message = <any>{}; 
                message.action = 'Dataset clicked';
                message.id = id;
                message.url = url;
                message.rank = rank;
                message.component = this.component;
                message.originalQuery = this.messageService.getOriginalQuery();
                message.fullQuery = this.messageService.getFullQuery();
                try{
					const res = await this.nodeService.log(message);
				}catch(e){
				   console.log(e);
	               
			   }
            
           }
    }

    stripHtml(html: string) {
	    var div = document.createElement("DIV");
	
	    div.innerHTML = html;
	
	    let cleanText = div.innerText;
        console.log('clean Title:'+cleanText);
	
	    div = null; // prevent mem leaks
	
	    return cleanText;
    }

    async showBiodivEntities(item):  Promise<void>{

	   this.showBiodiv = true;
       this.spinner.show();
       if(environment.loggingFlag){
             	let message = <any>{}; 
                message.action = 'Show Biodiv clicked';              
                message.component = this.component;
                message.originalQuery = this.messageService.getOriginalQuery();
                message.fullQuery = this.messageService.getFullQuery();
                message.item = item.getId();
				try{
                	const res = this.nodeService.log(message);
                }catch(e){
				   console.log(e);
	               //this.spinner.hide(); 
			   }
            
           }
       //if biodiv title is not defined call SA service
       if(item.getBiodivTitle() == undefined){
	       //get highlights for the title
           //let cleanValue = item.getCleanTitle().replace(/[\[\]\/]/g,' ');
           let cleanValue = item.getCleanTitle().replace(/[\[\]\/]/g,' ');;
	       let resultTitleOrg = [];
           let resultTitleBiodiv = [];
				
		   try{	
				 resultTitleOrg = await this.semanticAssistantService.getOrganismAnnotations(cleanValue);
			     //this.spinner.hide();

			   }catch(e){
				   console.log(e);
	               //this.spinner.hide(); 
			   }
           try{
	       		resultTitleBiodiv = await this.semanticAssistantService.getBiodivAnnotations(cleanValue);
                //this.spinner.hide();
			  }catch(e){
				   console.log(e);
	               //this.spinner.hide(); 
			   }
           //await this.delay(2000);
	       let titleOrg = '';
	       let titleBiodiv = '';
           let titleArray = [];
	       resultTitleOrg?.forEach(object =>{
		        let found = false;
                let index = 0;
				titleOrg = titleOrg + ' ' + object.type;
				let URIs = '';
				let start = '';
				let end = '';
				object.instances?.forEach(instance =>{
					let o = {};
					o[instance.start] = {'start':instance.start, 'end':instance.end, 'content':instance.content, 'URI':instance.URI};
					titleOrg = titleOrg + ' | '+instance.content;
					titleOrg = titleOrg + ' | '+instance.start;
					titleOrg = titleOrg + ' | '+instance.end;
					titleOrg = titleOrg + ' |  '+instance.URI;
					let URItoDisplay = this.utilityService.splitURI(instance.URI);
					let URIlink = this.utilityService.replaceURI(instance.URI);
					if(URIs === '')
							URIs = '<a href="'+URIlink+'" target="_blanck" title="Link to Terminology: '+URItoDisplay[0]+', ID:'+URItoDisplay[1]+'" >'+URItoDisplay[0]+'_'+URItoDisplay[1]+'</a><br>';
					else
						URIs = URIs + '<br><a href="'+URIlink+'" target="_blanck" title="Link to Terminology: '+URItoDisplay[0]+', ID:'+URItoDisplay[1]+'" >'+URItoDisplay[0]+'_'+URItoDisplay[1]+'</a><br>';
					start = instance.start;
					end = instance.end;
				});
				for (let i =0; i< titleArray.length; i++){
					let o = titleArray[i];
					if(o.start === start && o.end === end && o.type === object.type){
							found = true; index = i;
							break;
					}
				};
			
				if(!found)
				  titleArray.push({'start':start, 'end':end, 'URIs':URIs,'type':object.type});
			    else{
				  let o = titleArray[index];
		          o.URIs = o.URIs + URIs;
			    }
					
			})
	       //this.communicationService.setHitWithBiodivEntities(result);
		   //this.titleWithHighlights = titleOrg;

           
	       resultTitleBiodiv?.forEach(object =>{
		        
				titleBiodiv = titleBiodiv + ' ' + object.type;
				let URIs = '';
				let start = '';
				let end = '';
				let index =0;
				let found = false;
				object.instances?.forEach(instance =>{
					
					titleBiodiv = titleBiodiv + ' | '+instance.content;
					titleBiodiv = titleBiodiv + ' | '+instance.start;
					titleBiodiv = titleBiodiv + ' | '+instance.end;
					titleBiodiv = titleBiodiv + ' |  '+instance.URI;
					let URItoDisplay = this.utilityService.splitURI(instance.URI);
					let URIlink = this.utilityService.replaceURI(instance.URI);
					if(URIs === '')
							URIs = '<a href="'+URIlink+'" target="_blanck" title="Link to Terminology: '+URItoDisplay[0]+', ID:'+URItoDisplay[1]+'" >'+URItoDisplay[0]+'_'+URItoDisplay[1]+'</a><br>';
					else
						URIs = URIs + '<br><a href="'+URIlink+'" target="_blanck" title="Link to Terminology: '+URItoDisplay[0]+', ID:'+URItoDisplay[1]+'" >'+URItoDisplay[0]+'_'+URItoDisplay[1]+'</a><br>';
					start = instance.start;
					end = instance.end;
			
					
				});
				for (let i =0; i< titleArray.length; i++){
					let o = titleArray[i];
					if(o.start === start && o.end === end && o.type === object.type){
							found = true; index = i;
							break;
					}
				};
			
				if(!found)
				  titleArray.push({'start':start, 'end':end, 'URIs':URIs,'type':object.type});
			    else{
				  let o = titleArray[index];
		          o.URIs = o.URIs + URIs;
			    }
				//titleArray.push({'start':start, 'end':end, 'URIs':URIs,'type':object.type});
				
					
			});
			
			
			 
			
			titleArray.sort(function(a, b){return a.start-b.start || a.end - b.end});
			
			let finalTitleArray = this.determineSameStartValues(titleArray);
			
			let newTitle;
			
			if(this.component == environment.biodiv2)
			  	newTitle= this.highlightEntitiesExtendedInformation(cleanValue, finalTitleArray);
			else
				newTitle = this.highlightEntitiesSimpleInformation(cleanValue, finalTitleArray);
			//console.log(newTitle);
		    
			item.setBiodivTitle(newTitle);
            console.log('Entities in title: '+titleOrg + ', '+titleBiodiv);
 			//item.setBiodivTitle(titleOrg + ', '+titleBiodiv);
	      // this.titleWithHighlights = this.titleWithHighlights + titleBiodiv;
       }
       
        //get highlights for the description
       
       item.getDescription()?.forEach(async desc =>{
	       if(desc.getBiodivValue() == undefined){
		       let descOrg = '';
			   let descBiodiv = '';
		       let descArray = [];
		       //let cleanValue = desc.getCleanValue().replace(/[\[\]\/,-><:_,-]/g,' ');
               let cleanValue = desc.getCleanValue().replace(/[\[\]\\\/]/g,' ');
               let resultDescOrg=[];
               let resultDescBiodiv=[];
			   try{
				   
				   resultDescOrg = await this.semanticAssistantService.getOrganismAnnotations(cleanValue);
	               //await this.delay(2000);
	               //console.log(resultDescOrg);
                   //this.spinner.hide();
			   }catch(e){
				   console.log(e);
	               //this.spinner.hide(); 
			   }
               try{
		       		resultDescBiodiv = await this.semanticAssistantService.getBiodivAnnotations(cleanValue);
		       		//console.log(resultDescBiodiv);
                    //this.spinner.hide();
				}catch(e){
				   console.log(e); 
	               //this.spinner.hide();
			   }
			   //await this.delay(2000);
		       resultDescOrg?.forEach(object =>{
			          let found = false;
	                let index = 0;
	
					let URIs = '';
					let start = '';
					let end = '';
					descOrg = descOrg + ' ' + object.type;
					object.instances?.forEach(instance =>{
						descOrg = descOrg + ' | '+instance.content;
						descOrg = descOrg + ' | '+instance.start;
						descOrg = descOrg + ' | '+instance.end;
						descOrg = descOrg + ' |  '+instance.URI;
						let URItoDisplay = this.utilityService.splitURI(instance.URI);
						let URIlink = this.utilityService.replaceURI(instance.URI);
						if(URIs === '')
							URIs = '<a href="'+URIlink+'" target="_blanck" title="Link to Terminology: '+URItoDisplay[0]+', ID:'+URItoDisplay[1]+'" >'+URItoDisplay[0]+'_'+URItoDisplay[1]+'</a><br>';
						else
							URIs = URIs + '<br><a href="'+URIlink+'" target="_blanck" title="Link to Terminology: '+URItoDisplay[0]+', ID:'+URItoDisplay[1]+'" >'+URItoDisplay[0]+'_'+URItoDisplay[1]+'</a><br>';
						start = instance.start;
						end = instance.end;
					});
					
					for (let i =0; i< descArray.length; i++){
						let o = descArray[i];
						if(o.start === start && o.end === end && o.type === object.type){
								found = true; index = i;
								break;
						}
					};
				
					if(!found)
					  descArray.push({'start':start, 'end':end, 'URIs':URIs,'type':object.type});
				    else{
					  let o = descArray[index];
			          
			          o.URIs = o.URIs + URIs;
				    }
			
				});
				
				
				resultDescBiodiv?.forEach(object =>{
			        let found = false;
	                let index = 0;
	
					let URIs = '';
					let start = '';
					let end = '';	
					//descBiodiv = descBiodiv + ' ' + object.type;
					object.instances?.forEach(instance =>{
						descBiodiv = descBiodiv + ' | '+instance.content;
						descBiodiv = descBiodiv + ' | '+instance.start;
						descBiodiv = descBiodiv + ' | '+instance.end;
						descBiodiv = descBiodiv + ' |  '+instance.URI;
						let URItoDisplay = this.utilityService.splitURI(instance.URI);
						let URIlink = this.utilityService.replaceURI(instance.URI);
						if(URIs === '')
							URIs = '<a href="'+URIlink+'" target="_blanck" title="Link to Terminology: '+URItoDisplay[0]+', ID:'+URItoDisplay[1]+'" >'+URItoDisplay[0]+'_'+URItoDisplay[1]+'</a><br>';
						else
							URIs = URIs + '<br><a href="'+URIlink+'" target="_blanck" title="Link to Terminology: '+URItoDisplay[0]+', ID:'+URItoDisplay[1]+'" >'+URItoDisplay[0]+'_'+URItoDisplay[1]+'</a><br>';
						start = instance.start;
						end = instance.end;
					});
					for (let i =0; i< descArray.length; i++){
						let o = descArray[i];
						if(o.start === start && o.end === end && o.type === object.type){
								found = true; index = i;
								break;
						}
					};
				
					if(!found)
					  descArray.push({'start':start, 'end':end, 'URIs':URIs,'type':object.type});
				    else{
					  let o = descArray[index];
			          o.URIs = o.URIs + URIs;
				    }
				});
				
				//desc.setBiodivValue(descOrg + ', '+ descBiodiv);
				descArray.sort(function(a, b){return a.start-b.start || a.end - b.end});
			    let finalDescArray = this.determineSameStartValues(descArray);
				
				let newDesc;
				if(this.component == environment.biodiv2)
				  	newDesc= this.highlightEntitiesExtendedInformation(cleanValue, finalDescArray);
				else
					newDesc = this.highlightEntitiesSimpleInformation(cleanValue, finalDescArray);
				desc.setBiodivValue(newDesc);
			    
				//this.descriptionWithHighlights.push(desc);
		   }
		});
      
       //this.communicationService.setHitWithBiodivEntities(result);
	   
       
      
        this.spinner.hide();
      
    }

   
    
  
  hideBiodivButtonClicked(): void {
    this.showBiodiv = false;
    //this.titleWithHighlights = '';
    //this.descriptionWithHighlights=[];
    
  }
  /*updateInnerHtml(testItem, $event){
	 console.log(testItem);
     console.log($event.target);

   }*/

  highlightEntitiesExtendedInformation(stringToHighlight, objectArray):string{
	
   //console.log(objectArray);
   const result = objectArray.reduceRight((r, { start: s, end: e, URIs:u, type:t}) =>r.substring(0, s)+ '<div class="biodivEntities-tooltip">'+r.substring(s, e)+'<div class="tooltiptext">'+'<div class="categoryTooltiptext"><b>Category:</b> ' + t + '</div><div></div>'+u+'</div></div>'+r.substring(e), stringToHighlight);
   /*const result = objectArray.reduceRight(function(r, { start: s, end: e, URIs:u, type:t}) {
	console.log(s + '|'+e);
	
		r?.substring(0, s)+ '<div class="bio-div-tooltip">'+r?.substring(s, e)+'<div class="tooltiptext">'+'<div><b>Category: ' + t + '</b></div><div><span><i>URI:</i></span></div>'+u+'</div></div>'+r?.substring(e)
	
	}, stringToHighlight);*/
   
   
   /// console.log(result);
  			
			
		
	return result;
  }
  highlightEntitiesSimpleInformation(stringToHighlight,objectArray):void{
	//console.log(objectArray);
   const result = objectArray.reduceRight((r, { start: s, end: e, URIs:u, type:t}) =>r.substring(0, s)+ '<div class="biodivEntities-tooltip">'+r.substring(s, e)+'<div class="tooltiptext">'+'<div class="categoryTooltiptext"><b>Category:</b> ' + t + '</div></div></div>'+r.substring(e), stringToHighlight);
   
    //console.log(result);
  			
			
		
	return result;
  }
 



  determineSameStartValues(titleArray):any {

    let finalTitleArray = [];
    
    //if there is only one item in the array - nothing to do - return
    if(titleArray.length == 1)
		return titleArray;
	let nextentry;
	
    for(let i = 0; i<titleArray.length;i++) {
	    let entry = titleArray[i];
        if(i+1 <titleArray.length)
        	nextentry = titleArray[i+1];
        
					
		//same start values? then take the second (larger) span and add the URI of the shorter span
		if(entry.start == nextentry?.start){
			nextentry.URIs = nextentry.URIs + '<br><div class="categoryTooltiptext"><b>Category:</b> ' + entry.type + '</div><div></div>' + entry.URIs;
            					
		}
		else if(entry.end == nextentry?.end){
				entry.URIs = entry.URIs + '<br><div class="categoryTooltiptext"><b>Category:</b> ' + nextentry.type + '</div><div></div>' + nextentry.URIs;
				finalTitleArray.push(entry);
				i++;
		}
		else{
			finalTitleArray.push(entry);
		}
		
       
    }
    return finalTitleArray;
}

 clickToURI(uri){
   console.log(uri + ' clicked');	
 }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}