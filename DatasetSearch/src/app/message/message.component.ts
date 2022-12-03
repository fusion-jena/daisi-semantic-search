import { Component, Input,OnInit } from '@angular/core';
import {environment} from '../../environments/environment';
import {NodeService} from '../services/remote/node.service';
import {MessageService} from '../services/local/message.service';

@Component({
  selector: 'app-messages',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {

  @Input() queryExplanations = [];
  @Input() extendedQueryExplanations = [];
  @Input() resultExplanations = [];
  @Input() component = '';
  @Input() fullQuery = '';
  constructor(private nodeService: NodeService, private messageService: MessageService) { }
  
  showMore = false;
  showHelp = false;
  componentUI = '';
  

  isCollapsed = false;
  ngOnInit() {
	this.componentUI = this.component;
	
  }
  
  async showMoreClicked(): Promise<void> {
    this.showMore = true;
   // console.log('showMore is true');
    if(environment.loggingFlag){
             	let message = <any>{}; 
                message.action = 'Explanation clicked';              
                message.component = this.component;
                message.originalQuery = this.messageService.getOriginalQuery();
                message.fullQuery = this.messageService.getFullQuery();
                const res = await this.nodeService.log(message);
            
           }
    
  }
  hideClicked(): void {
    this.showMore = false;
    console.log('showMore is false');
    
  }

  async showHelpClicked(): Promise<void> {
    this.showHelp = true;
    if(environment.loggingFlag){
             	let message = <any>{}; 
                message.action = 'Help clicked';              
                message.component = this.component;
                message.originalQuery = this.messageService.getOriginalQuery();
                message.fullQuery = this.messageService.getFullQuery();
                const res = await this.nodeService.log(message);
            
           }
    
  }
  hideHelpClicked(): void {
    this.showHelp = false;
    
    
  }
   /*async clickOnHelp(): Promise<void>{
	  //console.log("ID clicked: "+id + ", URL: "+url);
      if(environment.loggingFlag){
             	let message = <any>{}; 
                message.action = 'Help clicked';              
                message.component = this.component;
                message.originalQuery = this.messageService.getOriginalQuery();
                message.fullQuery = this.messageService.getFullQuery();
                const res = await this.nodeService.log(message);
            
           }
    }
    async clickOnExplanation(): Promise<void>{
	  //console.log("ID clicked: "+id + ", URL: "+url);
      if(environment.loggingFlag){
             	let message = <any>{}; 
                message.action = 'Explanation clicked';              
                message.component = this.component;
                message.originalQuery = this.messageService.getOriginalQuery();
                message.fullQuery = this.messageService.getFullQuery();
                const res = await this.nodeService.log(message);
            
           }
    }*/

}