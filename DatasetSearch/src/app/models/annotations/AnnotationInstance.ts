
export abstract class AnnotationInstance<T> {

    content: string;
    start: number;
    end: number;
    synonyms:string[];



  constructor (options: {content?: string, start?: number, end?: number}) {

     this.content = options.content === undefined ? undefined : options.content;
     this.start = options.start === undefined ? undefined : options.start;
     this.end = options.end === undefined ? undefined : options.end;
     this.synonyms=[];
     

  }
  
  addSynonym(synonym:string){
	this.synonyms.push(synonym);
  }; 

}


