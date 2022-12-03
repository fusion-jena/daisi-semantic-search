import { Component, OnInit } from '@angular/core';
import {Result} from '../models/result/result';
import {environment} from '../../environments/environment';
import {StartSearchingService} from '../services/local/start-searching.service';
import {SearchResult} from '../interface/search-result';
import {SearchInput} from '../interface/search-input';
import {CommunicationService} from '../services/local/communication.service';
import {MessageService} from '../services/local/message.service';
import {SemanticAssistantService} from '../services/remote/semantic-assistant.service';
import {GraphDbService} from '../services/remote/graph-db.service';
//import {concatMap, mergeMap, switchMap, tap} from 'rxjs/operators';
import {InputAnalysisService} from '../services/local/input-analysis.service';
import {NodeService} from '../services/remote/node.service';
import {BiodivPreprocessDataService} from '../services/local/biodiv-preprocess-data.service';
import { Annotation } from '../models/annotations/Annotation';
@Component({
  selector: 'app-biodiv2',
  templateUrl: './biodiv2.component.html',
  styleUrls: ['./biodiv2.component.css']
})
export class Biodiv2Component implements OnInit, SearchResult, SearchInput {

  result: Result;
  from = 0;
  operator = environment.defaultOperator;
  //ORsearch = false;
  component = environment.biodiv2;
  //resetFilters = true;
    
  searchKey = "";
  searchKeyAnnotations;

  urlTerm = '/biodiv/search';
  //filters;
  queryExplanations: Object[];
  extendedQueryExplanations: Object[];
  resultExplanations: Object[];
  queryInterpretation: Object[];
  fullQuery:string;

  constructor(private communicationService: CommunicationService,
                private messageService: MessageService,
                 private semanticAssistantService: SemanticAssistantService,
                private graphDbService: GraphDbService,
                private inputAnalysis: InputAnalysisService,
                private nodeService: NodeService,
                private biodivPreprocessDataService: BiodivPreprocessDataService) { }

  ngOnInit(): void {
	this.clear();
	    this.messageService.setComponent(this.component);
        //this.startSearching(this.searchKey);
        this.communicationService.getResult().subscribe(value => {
            if (value !== undefined) {
                this.result = value;
            }
        });
  }

  paginationClicked(from): void {


        this.from = from;
        this.startSearching(this.searchKey);
    }

    radioChanged(radio): void {

        this.operator = radio;
    }
    checkBox(data): void {
    }
    searchKeySubmitted(key): void {
	    
        //this.resetFilters = true;
        this.searchKey = key;    
        this.from = 0;
        //this.filters = [];
        
        this.startSearching(this.searchKey);
    }

    /*startSearching(key): void {
	    
        this.startSearchingService.startSearching(key, this.semantic, this.from, null);
    }*/

async startSearching(searchKey): Promise<void> {
        this.clear();
        let mimirQuery;
        let annots;
        let revisedQueryConcepts;
        if (this.searchKey !== "") {
            //console.log( this.operator);
            const originalQuery = await this.inputAnalysis.prepareQuery(null, searchKey, this.operator);
            mimirQuery = originalQuery;
            console.log(originalQuery);
            //const queryConcepts = await this.inputAnalysis.replaceQueryTermsWithConcepts(null, searchKey, this.operator);
            const queryConcepts = await this.inputAnalysis.replaceQueryTermsWithURIs(searchKey, null);
		     console.log("Query concepts: " + queryConcepts);
		    //let annots = await this.semanticAssistantService.getBiodivAnnotations(queryConcepts);
            //this.resultAnnotations = await this.semanticAssistantService.getOrganismAnnotations(this.cleanString(this.result.getAnnotationText()));
            if(queryConcepts!=null){
	            annots = await this.semanticAssistantService.callSAServiceToObtainTypes(queryConcepts);
	            console.log("Annots: " + annots);
                //if(annots?.length >0){
				    revisedQueryConcepts = this.replaceTypesWithAnnotation(queryConcepts, annots);
		            //console.log("revisedQueryConcepts: " + revisedQueryConcepts);
		            // const body = {queryString: 'replace', from: this.from};
		            // this.nodeServiceSearch(body, termsAndConcepts);
		            mimirQuery = this.inputAnalysis.buildQuery(originalQuery, revisedQueryConcepts,this.operator, false);
				//}
            }
			console.log('final query to Mimir: ' + mimirQuery);
            // log
            //this.messageService.addSimpleQueryExplanation({'query': originalQuery, 'defaultOperator': this.operator});
            this.messageService.addExtendedQueryExplanation({'query': mimirQuery, 'defaultOperator': this.operator});
			this.messageService.setOriginalQuery(originalQuery);
            
            if (originalQuery !== mimirQuery) {
                //this.messageService.addExtendedQueryExplanation({'query': mimirQuery, 'defaultOperator': this.operator});
                this.messageService.setFullQuery(mimirQuery);
                this.fullQuery = mimirQuery;
            }

            const body = {queryString: mimirQuery, from: this.from};
            //const SearchKeyAnnotations = await this.semanticAssistantService.createDefaultAnnotations(queryConcepts);
            const annotationsAndSynonyms = await this.graphDbService.getSynonyms(annots); //reviseQueryConcepts?
           
            this.queryInterpretation = annotationsAndSynonyms;

            //console.log('call to SA service:'+this.cleanString(this.result.getAnnotationText()));
			//this.resultAnnotations = await this.semanticAssistantService.getBiodivAnnotations(this.cleanString(this.result.getAnnotationText()));
            //this.resultAnnotations = await this.semanticAssistantService.getOrganismAnnotations(this.cleanString(this.result.getAnnotationText()));
            
			this.searchKeyAnnotations = annotationsAndSynonyms;
            this.queryExplanations = this.messageService.getSimpleQueryExplanations();
            this.extendedQueryExplanations = this.messageService.getExtendedQueryExplanations();
            this.resultExplanations = this.messageService.getResultExplanations();
			if(environment.loggingFlag){
             	let message = <any>{}; 
                message.action = 'searchButton clicked';
                message.url = this.urlTerm;
                message.component = this.component;
               
                message.originalQuery = originalQuery;
                message.fullQuery = mimirQuery;
                const res = await this.nodeService.log(message);
            
           }
           const request = await this.nodeServiceSearch(body, annotationsAndSynonyms);
        }
       
    }

  


    nodeServiceSearch(body, params): any {
        return new Promise(resolve => {
            this.nodeService.search(this.urlTerm, body, this.biodivPreprocessDataService, params,this.component).then(r => {
                resolve('done');
            });
        });
    }

    

    private clear() {
        this.messageService.clear();
        this.inputAnalysis.clear();
        this.queryInterpretation = [];
        this.fullQuery='';

    }

   private replaceTypesWithAnnotation(queryConcepts, annotations):any{
	  
      if (annotations == undefined || annotations == null || annotations.length == 0){
	    return queryConcepts;
      }
      
      let revisedQueryConcepts = [];
      let revisedQueryConceptsKeys = [];
      let revisedQueryConceptsTerms = [];
      annotations.forEach(annotation =>{
	    const annoType = annotation.type.toLowerCase();
		for(let i = 0; i< queryConcepts.length; i++){
			let keys;
			let obj;
			
			try{
				obj = JSON.parse(queryConcepts[i]);               
                keys = Object.keys(obj);
            }
			catch(error){
				//console.log(error);
				obj = null;
				keys = null;
			}   
				
			let type = keys[0];
			let termObjects = obj[type];
			//no type so far
			
			if(revisedQueryConceptsKeys.indexOf(annoType) < 0 && type === '<annotation>'){
				termObjects.forEach(object =>{
					if (annotation.term === object.term){
						    let o = {};
		                    o[annoType] = [];
                            o[annoType].push(object);						    
		                    revisedQueryConcepts.push(o);	
						    revisedQueryConceptsKeys.push(annoType);
		                    revisedQueryConceptsTerms.push(annotation.term);
					}
				});
			}else if(revisedQueryConceptsKeys.indexOf(annoType) >= 0 && type === '<annotation>'){
					termObjects.forEach(termObject =>{
						if (annotation.term === termObject.term){					    
			            
							for (let j =0; j<revisedQueryConcepts.length;j++){
								 //console.log(revisedQueryConcepts[j]);
				                 //let object = revisedQueryConcepts[j];
								 if (annoType === Object.keys(revisedQueryConcepts[j])[0]){
									
									revisedQueryConcepts[j][annoType].push(termObject);
									
									if(revisedQueryConceptsTerms.indexOf(annotation.term)<0){
										revisedQueryConceptsTerms.push(annotation.term);
									}
								}
					        }
	                    }
                   });
					 
				
			}
			
		};
	  });
      
      //if no annotations could be found in SA service, at least use the Lookup result if available
      queryConcepts.forEach(queryConcept =>{
			let keys;
			let obj;
			
			try{
				obj = JSON.parse(queryConcept);               
                keys = Object.keys(obj);
            }
			catch(error){
				//console.log(error);
				obj = null;
				keys = null;
			}   
				
			let type = keys[0];
			
			type = type.replace(/"/g,"");
			type = type.replace(/'/g,"");
			console.log(type);
			let termObjects = obj[type];
			//no type so far
			if(revisedQueryConceptsKeys.indexOf(type) < 0 && type === '<annotation>'){
				termObjects.forEach(object =>{
					        if(revisedQueryConceptsTerms.indexOf(object.term) < 0){
								let o = {};
			                    o[type] = [];                           
	                            o[type].push(object);						    
			                    revisedQueryConcepts.push(o);	
							    revisedQueryConceptsKeys.push(type);
								revisedQueryConceptsTerms.push(object.term);
						     }
					
				});
			}else if(revisedQueryConceptsKeys.indexOf(type) >= 0 && type === '<annotation>'){
				    let found = false;
					termObjects.forEach(termObject =>{
						   
							for (let j =0; j<revisedQueryConcepts.length;j++){
								 //console.log(revisedQueryConcepts[j]);
				                 //let object = revisedQueryConcepts[j];
								 if (termObject.term === Object.keys(revisedQueryConcepts[j])[1]){
									found = true;
									revisedQueryConcepts[j][type].push(termObject);
								}
					        }
	                        if(!found){
								let o = {};
			                    o[type] = [];
	                            o[type].push(termObject);						    
			                    revisedQueryConcepts.push(o);	
							    revisedQueryConceptsKeys.push(type);

							}
                   });
					 
				
			}
			
	  });
      
      console.log(revisedQueryConcepts);
      return revisedQueryConcepts;

   }
    


}
