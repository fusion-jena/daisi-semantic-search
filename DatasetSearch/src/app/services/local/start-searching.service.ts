import { Injectable } from '@angular/core';
import {NodeService} from '../remote/node.service';
import {CommunicationService} from './communication.service';
import {GfbioPreprocessDataService} from './gfbio-preprocess-data.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StartSearchingService {

  constructor(private nodeService: NodeService, private communicationService: CommunicationService,
              private gfbioPreprocessData: GfbioPreprocessDataService) { }
  startSearching(searchKey , semantic, from, filters,component): void{
      let urlTerm: string;
      const urlIndex = environment.context;
      let body: any;
      let key;
      if (semantic === true) {
          key = searchKey;
          urlTerm = environment.semSearchUrl;
      } else {
          key = searchKey.join(' ');
          urlTerm = environment.searchUrl;
      }
      body = JSON.stringify({queryterm: key, from,
          size: 10, filter: filters});
      this.nodeService.search(
          urlIndex + urlTerm,
          body,
          this.gfbioPreprocessData, {semantic},component);
  }
}
