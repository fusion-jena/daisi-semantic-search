import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {QuestionBase} from '../form/question-base';
import {Observable, of, zip} from 'rxjs';
import {QuestionService} from '../services/local/question.service';
import {NodeService} from '../services/remote/node.service';
import {BiodivPreprocessDataService} from '../services/local/biodiv-preprocess-data.service';
import {CommunicationService} from '../services/local/communication.service';
import {SearchResult} from '../interface/search-result';
//import {SearchInput} from '../interface/search-input';
import {Result} from '../models/result/result';
import {SemanticAssistantService} from '../services/remote/semantic-assistant.service';
import {GraphDbService} from '../services/remote/graph-db.service';
import {concatMap, mergeMap, switchMap, tap} from 'rxjs/operators';
import {InputAnalysisService} from '../services/local/input-analysis.service';
import {environment} from '../../environments/environment';
import {UtilityService} from '../services/utility.service';
import {MessageService} from '../services/local/message.service';
import {FormControl} from '@angular/forms';


@Component({
    selector: 'app-bio-div',
    templateUrl: './bio-div.component.html',
    styleUrls: ['./bio-div.component.css'],
    providers: [QuestionService]
})
export class BioDivComponent implements OnInit, SearchResult {

    constructor(service: QuestionService,
                private nodeService: NodeService,
                private communicationService: CommunicationService,
                private biodivPreprocessDataService: BiodivPreprocessDataService,
                private semanticAssistantService: SemanticAssistantService,
                private graphDbService: GraphDbService,
                private inputAnalysis: InputAnalysisService,
                public utility: UtilityService,
                private messagesService: MessageService) {
        this.questions$ = service.getQuestions();
        this.questions = service.getQuestions();
    }

    private questions: QuestionBase<any>[];
    urlTerm = '/biodiv/search';

    questions$: Observable<QuestionBase<any>[]>;
    from = 0;
    operator = environment.defaultOperator;
    result: Result;
    searchKey;
    searchKeyAnnotations;
    resultAnnotations;
    queryExplanations: Object[];
    extendedQueryExplanations: Object[];
    resultExplanations: Object[];
    type = ['Organism', 'Environment', 'Quality', 'Process', 'Material'];
    toppings = new FormControl();
    selectedType;
    ORsearch = false;
    component = environment.biodiv1;
    fullQuery:string;

    ngOnInit(): void {
        this.search('');
        this.clear();
        this.messagesService.setComponent(this.component);
        this.communicationService.setResult(undefined);
        this.communicationService.getResult().subscribe(value => {
            if (value !== undefined) {
                this.result = value;
                // console.log(this.result);
            }
        });


    }

    /*searchKeySubmitted(key): void {
	    
        //this.resetFilters = true;
        this.searchKey = key;    
        this.from = 0;
        //this.filters = [];
        
        this.startSearching(this.searchKey);
    }*/
    // tslint:disable-next-line:typedef
    changeType(types) {
        let finalAnnotations = [];
        types.value.forEach(type => {
            this.resultAnnotations.forEach(annotation => {
                if (annotation.type === type){
                    finalAnnotations.push(annotation);
                }
            });
        });
        finalAnnotations = finalAnnotations.concat(this.searchKeyAnnotations);
        this.communicationService.getOriginalResult().subscribe(value => {
            if (value !== undefined) {
                let results: Result;
                results = this.biodivPreprocessDataService.getResult(value, finalAnnotations,this.component);
                this.communicationService.setResult(results);
                // console.log(this.result);
            }
        });
        // this.getAnnotations(this.searchKey, this.cleanString(this.result.getAnnotationText()));
    }

    search(searchKey): void {

        this.searchKey = searchKey;
        this.from = 0;


        this.startSearching(searchKey);

    }

    cleanString(s) {
        const regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
        return s.replace(regex, '');
    }

    processValues(arr): string {
        const searchKey = [];
        const values = Object.values(arr);
        const keys = Object.keys(arr);
        for (const i in keys) {
            if (values[i] !== '') {
                searchKey.push('(' + values[i] + ' IN {' + keys[i] + '}' + ')');
            }
        }


        return searchKey.join(' AND ');
    }

    checkBox(data): void {
    }

    paginationClicked(from): void {


        this.from = from;
        this.startSearching(this.searchKey);
    }

    ORclicked(OR): void {

        this.operator = OR;
        this.ORsearch = true;

        this.startSearching(this.searchKey);

    }

    radioChanged(radio): void {

        this.operator = radio;
    }

    async startSearching(searchKey): Promise<void> {
        this.clear();
        let mimirQuery;
        if (this.searchKey !== '') {

            console.log(searchKey);
            const originalQuery = await this.inputAnalysis.prepareQuery(Object.keys(searchKey), searchKey, this.operator);
            console.log('original query:'+originalQuery);
            mimirQuery = originalQuery;
            const queryConcepts = await this.inputAnalysis.replaceQueryTermsWithConcepts(Object.keys(searchKey), searchKey, this.operator);

            console.log("Query concepts: "+queryConcepts);
            // const body = {queryString: 'replace', from: this.from};
            // this.nodeServiceSearch(body, termsAndConcepts);
            if(queryConcepts!=null){
	            mimirQuery = this.inputAnalysis.buildQuery(originalQuery, queryConcepts, this.operator, false);
	            console.log('final query to Mimir: ' + mimirQuery);
			}
            // log
            this.messagesService.addSimpleQueryExplanation({'query': originalQuery, 'defaultOperator': this.operator});
            
            this.messagesService.setOriginalQuery(originalQuery);
            this.messagesService.setFullQuery(mimirQuery);

            if (originalQuery !== mimirQuery) {
	            if(mimirQuery.match(/http:.*/)){
		            console.log(mimirQuery+ '2');
                	//this.messagesService.addExtendedQueryExplanation({'query': mimirQuery, 'defaultOperator': this.operator});
                	
                	this.fullQuery = mimirQuery;
                }
            }

            const body = {queryString: mimirQuery, from: this.from};
            const SearchKeyAnnotations = await this.semanticAssistantService.createDefaultAnnotations(queryConcepts);
            const annotationsAndSynonyms = await this.graphDbService.getSynonyms(SearchKeyAnnotations);
           
            //console.log('call to SA service:'+this.cleanString(this.result.getAnnotationText()));
			//this.resultAnnotations = await this.semanticAssistantService.getBiodivAnnotations(this.cleanString(this.result.getAnnotationText()));
            //this.resultAnnotations = await this.semanticAssistantService.getOrganismAnnotations(this.cleanString(this.result.getAnnotationText()));
            
			this.searchKeyAnnotations = annotationsAndSynonyms;
            this.queryExplanations = this.messagesService.getSimpleQueryExplanations();
            this.extendedQueryExplanations = this.messagesService.getExtendedQueryExplanations();
            this.resultExplanations = this.messagesService.getResultExplanations();
			if(environment.loggingFlag){
             	let message = <any>{}; 
                message.action = 'searchButton clicked';
                message.url = this.urlTerm;
                message.component = this.component;
                message.searchKey = searchKey;
                message.originalQuery = originalQuery;
                message.fullQuery = mimirQuery;
                const res = await this.nodeService.log(message);
            
           }
           const request = await this.nodeServiceSearch(body, annotationsAndSynonyms,this.component);
        }
        // });

        /* const body = {queryString: this.processValues(this.searchKey), from: this.from};
        if (this.searchKey !== '') {
            const annotations = await this.semanticAssistantService.getBiodivAnnotations(Object.values(this.searchKey).join(' '));
            const annotationsAndSynonyms = await this.graphDbService.getSynonyms(annotations);
            this.nodeServiceSearch(body, annotationsAndSynonyms);
            
        } else {
            this.nodeServiceSearch(body, {});
        } */
    }

    // filterAnnotations(allAnnotations, SearchKeyAnnotations): any {
    //     const finalAnnotations = allAnnotations;
    //     allAnnotations.forEach((annotation, index) => {
    //         SearchKeyAnnotations.forEach(SearchKeyAnnotation => {
    //             if (annotation.instances[0].content === SearchKeyAnnotation.instances[0].content) {
    //                 finalAnnotations.splice(index, 1);
    //             }
    //         });
    //     });
    //     return finalAnnotations;
    // }

// async getAnnotations(searchKey, annotation): Promise<void> {
//         if (this.searchKey !== '') {
//             const originalQuery = await this.inputAnalysis.prepareQuery(Object.keys(searchKey), searchKey, this.operator);
//             const queryConcepts = await this.inputAnalysis.replaceQueryTermsWithConcepts(Object.keys(searchKey), searchKey, this.operator);
//             const mimirQuery = this.inputAnalysis.buildQuery(originalQuery, queryConcepts, this.operator, false);
//             const body = {queryString: mimirQuery, from: this.from};
//             const annotations = await this.semanticAssistantService.getBiodivAnnotations(annotation);
//             this.nodeServiceSearch(body, annotations);
//             return annotations;
//         }
//     }


    nodeServiceSearch(body, params,component): any {
        return new Promise(resolve => {
            this.nodeService.search(this.urlTerm, body, this.biodivPreprocessDataService, params,component).then(r => {
                resolve('done');
            });
        });
    }

    

    private clear() {
        this.messagesService.clear();
        this.inputAnalysis.clear();
        this.fullQuery = "";

    }


}
