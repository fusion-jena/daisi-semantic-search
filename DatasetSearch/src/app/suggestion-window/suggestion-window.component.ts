import {Component, EventEmitter, HostListener, OnInit, Output} from '@angular/core';
import {CommunicationService} from '../services/local/communication.service';

@Component({
    selector: 'app-suggestion-window',
    templateUrl: './suggestion-window.component.html',
    styleUrls: ['./suggestion-window.component.css']
})
export class SuggestionWindowComponent implements OnInit {
    suggest: any;
    constructor(private communicationService: CommunicationService) {
    }
    @Output() windowSuggestKey = new EventEmitter<any>();
    @Output() isClicked = new EventEmitter<any>();
    ngOnInit(): void{
        this.communicationService.getSuggest().subscribe(suggest => this.suggest = suggest);
    }
    chooseSuggestion(suggestionKey): void{
        this.windowSuggestKey.emit(suggestionKey);
    }
    @HostListener('document:click', ['$event'])
    documentClick(event: MouseEvent): void {
        this.isClicked.emit();
    }

}
