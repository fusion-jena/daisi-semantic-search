import {Annotation} from './Annotation';
import { AnnotationInstance } from './AnnotationInstance';

export class Organism extends AnnotationInstance<any> {

  scientificName: string;
  URI: string;
  synonyms: string[];

  constructor (options: {} = {}) {
     super(options);
    
     this.scientificName = options['scientificName'] === undefined ? undefined : options['scientificName'];
     this.URI = options['URI'] === undefined ? undefined : options['URI'];
   

  }



  getScientificName(): string {
      return this.scientificName;
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


