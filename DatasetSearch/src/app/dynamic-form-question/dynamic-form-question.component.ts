import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {QuestionBase} from '../form/question-base';
import {FormControl, FormGroup} from '@angular/forms';
import {debounceTime, map, startWith} from 'rxjs/operators';
import {NodeService} from '../services/remote/node.service';
import {Observable} from 'rxjs';
import {CommunicationService} from '../services/local/communication.service';

@Component({
    selector: 'app-dynamic-form-question',
    templateUrl: './dynamic-form-question.component.html',
    styleUrls: ['./dynamic-form-question.component.css']
})
export class DynamicFormQuestionComponent{
    panelOpenState = false;
    isClicked;
    terms: Object[] = [];
    windowSuggestion = false;
    formatSimpleSearch = /[!@#$%^&_\-=\[\]{};:\\,<>\/?]+/;
    //formatSemanticSearch = /[!@#$%^&_\-=\[\]{};:\\,<>\/?]+/;
    alertSearch = false;
    //alertSemanticSearch = false;

    constructor(private nodeService: NodeService, private communicationService: CommunicationService) {
    }

    @Input() question: QuestionBase<string>;
    @Input() form: FormGroup;

    @Output() searchKeyEmmit = new EventEmitter<any>();
    get isValid(): any {
        return this.form.controls[this.question.key].valid;
    }
    validate(value: string) {
        return '"' + value + '"';
    }
    //validation instruction: https://angular-templates.io/tutorials/about/angular-forms-and-validations

    // by entering a letter on the form, a request will be sent to the node server and then it will be sent to suggestion-window
    onWindowSuggestKey(value): void {
        if (value !== undefined) {
            this.form.controls[this.question.key].setValue(value);

            const keyAndSemantic = [value, false];
            
            // console.log(keyAndSemantic);
            this.searchKeyEmmit.emit(keyAndSemantic);
        }
        //console.log('onsuggest: '+value);
        this.windowSuggestion = false;
        this.isClicked = true;
    }

    onSuggest(): void {
        this.form.controls[this.question.key].valueChanges.pipe()
            // ignore new term if same as previous term
            // switch to new search observable each time the term changes
            .subscribe((val: string) => {
                // console.log(val);
                if (val !== null && val !== undefined && val !== '') {
	               
                    const valT = val.replace(/['"]+/g, '');

                    if (valT !== null && valT !== undefined && valT !== '') {
                        this.nodeService.suggestSimple(valT).subscribe(data => {
                            //console.log(data.suggest[0].options);
                            /*let result = data.suggest[0].options;
                            if(result!== undefined && result !== null){
                                result.forEach(term =>{

                                    this.terms.push({'label':term.text});
                                });

                            }*/
                            this.communicationService.setSuggest(data.suggest[0].options);
                            if (!this.isClicked) {
                                this.windowSuggestion = data.suggest[0].options.length !== 0;
                                this.isClicked = false;
                            }
                        });

                    }
                }
            });
    }


}
