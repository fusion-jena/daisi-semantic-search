import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
	
  //simple query explanations	
  simpleQueryExplanations: Object[] = [];

  //extended query explanations
  extendedQueryExplanations: Object[] = [];

  //SPARQL queries for search
  sparqlInQuery: Object[] = [];  

  //resultExplanations
  resultExplanations: Object[] = []; 

  //SPARQL queries in result
  sparqlInResult: Object[] = []; 

   originalQuery: string;
    
   fullQuery: string; 
   component: string;

  addSimpleQueryExplanation(message: Object) {
    this.simpleQueryExplanations.push(message);
  }
  
  addExtendedQueryExplanation(message: Object) {
    this.extendedQueryExplanations.push(message);
  }
  
  addSparqlInQuery(message: Object) {
    this.sparqlInQuery.push(message);
  }

  addSparqlInResult(message: Object) {
    this.sparqlInResult.push(message);
  }

  addResultExplanation(message: Object) {
    this.resultExplanations.push(message);
  }

  clear() {
    this.resultExplanations = [];
    this.simpleQueryExplanations = [];
    this.extendedQueryExplanations = [];
	this.sparqlInQuery = [];
	this.sparqlInResult = [];
	this.fullQuery = "";
	this.originalQuery = "";
	this.component = "";
  }

  getSimpleQueryExplanations(): Object[]{ 
	return this.simpleQueryExplanations;
  }
  getExtendedQueryExplanations(): Object[]{ 
	return this.extendedQueryExplanations;
  }
  getSparqlInQuery(): Object[]{ 
	return this.sparqlInQuery;
  }
  getResultExplanations(): Object[]{ 
	return this.resultExplanations;
  }
  getSparqlInResult(): Object[]{ 
	return this.sparqlInResult;
  }
  setOriginalQuery(originalQuery: string): void {
        this.originalQuery = originalQuery;
  }

	getOriginalQuery(): string {
	    return this.originalQuery;
	}
	setFullQuery(fullQuery: string): void {
	    this.fullQuery=fullQuery;
	}

	getFullQuery(): string{
	    return this.fullQuery;
	}
	setComponent(component: string): void {
	    this.component=component;
	}

	getComponent(): string{
	    return this.component;
	}
}