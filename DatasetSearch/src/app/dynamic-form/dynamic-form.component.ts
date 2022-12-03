import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {QuestionControlService} from '../services/local/question-control.service';
import {QuestionBase} from '../form/question-base';
import {FormGroup} from '@angular/forms';
import {environment} from '../../environments/environment';
//import { Term } from '../models/query/term';
import {Observable} from 'rxjs';
import { MatRadioButton, MatRadioChange } from '@angular/material/radio';



@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css'],
  providers: [ QuestionControlService ]
})
export class DynamicFormComponent implements OnInit {

  constructor(private qcs: QuestionControlService) {  }

  semSearchImg: string = environment.imagePath + environment.semSearchImg;

  @Input() questions: QuestionBase<string>[] = [];
  @Input() ORsearch: boolean;
  form: FormGroup;
  terms: Observable<Object[]>;
  
  @Output() searchKey = new EventEmitter<any>();
  @Output() termsEvent = new EventEmitter<Object[]>();
  @Output() radioEvent = new EventEmitter<any>();

  @ViewChild('and') 
  andRB: MatRadioButton;

  @ViewChild('or') 
  orRB: MatRadioButton;  

  ngOnInit(): void {
    this.form = this.qcs.toFormGroup(this.questions);
    //console.log(this.ORsearch);
    /*if(this.ORsearch){
		//this.orRB.checked = true;
		console.log("OR clicked");
	}else{
		//this.andRB.checked = true;
	}*/
  }

  onSubmit(): void {
    this.searchKey.emit(this.form.getRawValue());
  }

  receiveTerms($event) {
       this.terms = $event;

     }
  /*processValues(): string{
    const searchKey = [];
    console.log("value"+this.form.value);
    const values = Object.values(this.form.getRawValue());
    const keys = Object.keys(this.form.getRawValue());
    for (const i in keys) {
      if (values[i] !== ''){
        searchKey.push('(' + values[i] + ' IN {' + keys[i] + '}' + ')');
      }
    }
    return searchKey.join(' AND ');
  }*/
  onSelectionChange(mrChange: MatRadioChange) {
   
   		this.radioEvent.emit(mrChange.value);
   
   } 
}
