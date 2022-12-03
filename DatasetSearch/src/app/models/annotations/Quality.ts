import {Annotation} from './Annotation';
import { AnnotationInstance } from './AnnotationInstance';

export class Quality extends AnnotationInstance<any> {

    URI: string;
    synonyms: string[];
 
  constructor (options: {} = {}) {
     super(options);
     this.URI = options['URI'] === undefined ? undefined : options['URI'];   

  }

  getURI(): string {
      return this.URI;
  }
  
    addSynonym(synonym: string){
	  this.synonyms.push(synonym);
    }
    setSynonyms(synonyms:string []){
	  this.synonyms = synonyms;
    }
    getSynonyms(): string[]{
	    return this.synonyms;
    }

 
}


