import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NodeService} from '../services/remote/node.service';
import {CommunicationService} from '../services/local/communication.service';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {StartSearchingService} from '../services/local/start-searching.service';
import {environment} from '../../environments/environment';
import * as booleanParser from 'boolean-parser';
import {InputAnalysisService} from '../services/local/input-analysis.service';

@Component({
    selector: 'app-search-input',
    templateUrl: './search-input.component.html',
    styleUrls: ['./search-input.component.css']
})
export class SearchInputComponent implements OnInit {

    constructor(private nodeService: NodeService,
                private startSearchingService: StartSearchingService,
                private communicationService: CommunicationService,
                private inputAnalysis: InputAnalysisService) {
    }

    faSearch = faSearch;
    searchKey: any;
    @Output() searchKeyEmmit = new EventEmitter<any>();
    result: any;
    windowSuggestion = false;
    semanticValue: boolean;
    formatSimpleSearch = /[!@#$%^&_\-=\[\]{};:\\,<>\/?]+/;
    formatSemanticSearch = /[!@#$%^&_\-=\[\]{};:\\,<>\/?]+/;
    alertSearch = false;
    alertSemanticSearch = false;
    semSearchImg: string = environment.imagePath + environment.semSearchImg;

    ngOnInit(): void {
        // const str = 'fff (gg tt gg) hhh (jj vv + cc gg) lll + kkk + rrr bee*';
        // console.log(str);
        // this.inputAnalysis.getAnalysis(str).then((response) => console.log(response));
    }

    // by entering a letter on the form, a request will be sent to the node server and then it will be sent to suggestion-window
    onWindowSuggestKey(value): void {
        if (value !== undefined) {
            (document.getElementById('searchField') as HTMLInputElement).value = value;
            this.searchKey = value;
            this.alertSearch = this.formatSimpleSearch.test(this.searchKey);
            this.alertSemanticSearch = false;
            this.startSearching(this.semanticValue);
            this.windowSuggestion = false;
        }
    }

    // by clicking on the search button, this method will be called
    onSearch(): void {
        this.semanticValue = false;
        this.alertSearch = this.formatSimpleSearch.test(this.searchKey);
        this.alertSemanticSearch = false;
        this.startSearching(this.semanticValue);
    }

// by clicking on the semantic search button, this method will be called
    semantic(): void {
        this.semanticValue = true;
        this.alertSearch = false;
        this.alertSemanticSearch = this.formatSemanticSearch.test(this.searchKey);
        this.startSearching(this.semanticValue);

        const subject = this.communicationService.getSearchKey();
        subject.next(this.searchKey);
        subject.subscribe(value => {
            this.searchKey = value;
        });

    }

    startSearching(semantic: boolean): void {
        if (this.searchKey.endsWith('*') && this.searchKey.length < 6 && semantic === true) {
            alert(environment.textAlertWordLength);
        }else {
            this.inputAnalysis.getAnalysis2(this.searchKey, semantic).then((response) => {
                console.log(response);
                const keyAndSemantic = [response, semantic];
                // console.log(keyAndSemantic);
                this.searchKeyEmmit.emit(keyAndSemantic);
            });
            // const keyAndSemantic = [this.searchKey, semantic];
            // this.searchKeyEmmit.emit(keyAndSemantic);
        }
    }

    onSuggest(): void {
        this.nodeService.suggestSimple(this.searchKey).subscribe(data => {
            this.communicationService.setSuggest(data.suggest[0].options);
            this.windowSuggestion = data.suggest[0].options.length !== 0;
        });
    }

}
