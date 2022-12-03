import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import {NodeService} from '../services/remote/node.service';
import {Result} from '../models/result/result';
import {CommunicationService} from '../services/local/communication.service';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-context-box',
  templateUrl: './context-box.component.html',
  styleUrls: ['./context-box.component.css']
})
export class ContextBoxComponent implements OnInit {

  @ViewChild('contentEditable') public ele: ElementRef;

  @Input()
  term: string = "placeholder";

  @Input()
  termData = [];

  displayData = [];

  searchData = [];

  singleClick: boolean = true;
  loading = false;
  searchUri;
  showSearchInformation = false;
  icon = "expand_less";
  searchClass = "linkWidgetBlue";

  infoText = environment.textTSWidgetInfo;

  constructor(private nodeService: NodeService,
              private communicationService: CommunicationService) { }

  ngOnInit(): void {
    this.filter(this.term);

    // Make the Term + the Data to Display UpperCase

    this.term = this.term[0].toUpperCase() + this.term.slice(1);

    if (this.displayData != undefined){
        this.displayData.forEach(function (value) {
          value.label = value.label[0].toUpperCase() + value.label.slice(1);
        });
    }
  }

  /* We use the CommunicationService to forward the clicked
   * key to the search bar
   */

  onDoubleClick(label: string){
    this.singleClick = false;

    var subject = this.communicationService.getSearchKey();
    subject.next(subject.getValue() + " " + label);

    this.searchClass = "linkWidgetBlue";
  }

  /* In onClick we check if the user only clicked once
   * this is done with a timeout set to 200ms
   * if the user presses again in that time frame we don't
   * open the window/link
   */

  onClick(url: string){
    this.singleClick = true;
    this.searchClass = "linkWidgetBlue unselectable";
    setTimeout(()=>{
        if(this.singleClick){
             window.open(url, "_blank");
             // alternative: window.location.href = url;
             this.searchClass = "linkWidgetBlue";
        }
     },200);
  }

  narrow(source: string, uri: string){
    this.showSearchInformation = false;
    this.searchData = undefined;
    this.searchUri = uri;
    this.loading = true;

    this.nodeService.narrow(source, uri).subscribe(value => {
      if (value !== undefined) {
          this.searchData = value.results;
          this.loading = false;
          this.showSearchInformation = true;
          this.icon = "expand_less";
      }
    });
  }

  broad(source: string, uri: string){
    this.showSearchInformation = false;
    this.searchData = undefined;
    this.searchUri = uri;
    this.loading = true;

    this.nodeService.broad(source, uri).subscribe(value => {
      if (value !== undefined) {
          this.searchData = value.results;
          this.loading = false;
          this.showSearchInformation = true;
          this.icon = "expand_less";
      }
    });
  }

  filter(term: string) {


    for(var t in this.termData){
      // First check the labels for our term
      if((this.termData[t].label.toString().toLowerCase()+ 's').includes(term.toLowerCase())){
        this.displayData.push(this.termData[t]);
      }else

      /* Now check the synonyms/commonNames for the term,
       * if found, add it to the list of displayed data
       */

      if(this.termData[t].synonyms != undefined){
        for(var syn in this.termData[t].synonyms){
          if((this.termData[t].synonyms[syn].toString().toLowerCase()+ 's').includes(term.toLowerCase())){
            this.displayData.push(this.termData[t]);
            break;
          }
        }
      }else

      if(this.termData[t].commonNames != undefined) {
        for(var syn in this.termData[t].commonNames){
          if((this.termData[t].commonNames[syn].toString().toLowerCase()+ 's').includes(term.toLowerCase())){
            this.displayData.push(this.termData[t]);
            break;
          }
        }
      }
    }
  }



}
