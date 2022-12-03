import {Injectable} from '@angular/core';
import {NodeService} from '../remote/node.service';
import fastCartesian from 'fast-cartesian';
import Tokenizr from 'tokenizr';
import {GraphDbService} from '../remote/graph-db.service';
import {QuestionService} from './question.service';
import { QuestionBase } from '../../form/question-base';
import * as LuceneQueryParser from 'lucene-query-parser';
import {environment} from '../../../environments/environment';
import { UtilityService } from '../utility.service';
import {MessageService} from '../local/message.service';

@Injectable({
    providedIn: 'root'
})
export class InputAnalysisService {
	public luceneParser = '';
    //public defaultOperator = ' AND ';
    private questions: QuestionBase<any>[] = [];
    public URIsFound = 0;
    private annotations = environment.annotationTypes;
    public originalQuery = '';
    query: String[] = [];
  URL= '';
  asyncCallsRemaining = 0; 

    constructor(private nodeService: NodeService, private graphDB: GraphDbService, public utility: UtilityService, private questionService: QuestionService, private messageService: MessageService) {
	  this.questions = this.questionService.getQuestions();
    }
    

    async getAnalysis(str, semantic): Promise<Array<string>> {
        // const lexer = new Tokenizr();
        // lexer.rule(/[a-zA-Z_][a-zA-Z0-9_]*/, (ctx, match) => {
        //     ctx.accept('string');
        // });
        // lexer.rule(/"((?:\\"|[^\r\n])*)"/, (ctx, match) => {
        //     ctx.accept('string', match[1].replace(/\\"/g, '"'));
        // });
        // lexer.rule(/((?:\\"|[^\r\n])*)/, (ctx, match) => {
        //     ctx.accept('string', match[1].replace(/\\"/g, '"'));
        // });
        // lexer.rule(/\/\/[^\r\n]*\r?\n/, (ctx, match) => {
        //     ctx.ignore();
        // });
        // lexer.rule(/[ \t\r\n]+/, (ctx, match) => {
        //     ctx.ignore();
        // });
        // lexer.rule(/[+-]+/, (ctx, match) => {
        //     ctx.accept('string');
        // });
        // // lexer.input('\" mooo ggg\" + sea sss');
        // lexer.input(' (mooo ggg) + sea sss');
        // lexer.tokens().forEach((token) => {
        //     console.log(token.toString());
        // });
        // str = str.replaceAll(' + ', '+');
        let numOpenParan = 0;
        const words = str.split(' ');
        let finalString = [];
        let insidePar = '';
        for (let i = 0; i < words.length; i += 1) {
            const word = words[i];
            if (word.indexOf('*') > -1) {
                const star = await this.starAnalysis(word, semantic);
                if (star !== null) {
                    star.unshift(word + ',');
                    finalString = finalString.concat(star);
                }
            }
            numOpenParan = this.getNumParentheses(words[i], numOpenParan);
            if (numOpenParan !== 0) {
                // if (words[i + 1] !== '+' && words[i + 1] !== '|' && words[i] !== '+' && words[i] !== '|'
                //     && i !== words.length - 1) {
                //     words[i] = words[i] + ' ';
                // }
                insidePar = insidePar + ' ' + words[i];
            } else {
                if (insidePar !== '') {
                    insidePar = insidePar + ' ' + words[i];
                    finalString = finalString.concat(insidePar.trim());
                    insidePar = '';
                } else {
                    finalString = finalString.concat(words[i]);
                }
            }
        }
        for (let i = 0; i < finalString.length; i += 1) {
            finalString[i] = finalString[i].replaceAll('+', ' + ');
            finalString[i] = finalString[i].replaceAll('(', '');
            finalString[i] = finalString[i].replaceAll(')', '');
            finalString[i] = finalString[i].replaceAll('\"', '');
            finalString[i] = finalString[i].replaceAll('  ', ' ');
            if (finalString[i] === ' + ') {
                finalString[i] = finalString[i - 1] + ' + ' + finalString[i + 1];
                finalString.splice(i + 1, 1);
                finalString.splice(i - 1, 1);
            }
        }
        return finalString;
    }

    async getAnalysis2(str, semantic): Promise<Array<string>> {
        let words = str.split(' ');
        let isParOpen = 'no';
        let insidePar = '';
        const finalArray = [];
        for (let i = 0; i < words.length; i += 1) {
            const word = words[i];
            if (word.indexOf('*') > -1) {
                const star = await this.starAnalysis(word.slice(0, -1), semantic);
                if (star !== null) {
                    star.unshift(word);
                    words[i] = star;
                }
            }
        }
        for (let i = words.length - 1; i >= 0; i -= 1) {
            if (!Array.isArray(words[i])) {
                isParOpen = this.getIsParOpen(words[i], isParOpen);
                if (isParOpen === 'first' || isParOpen === 'last' || isParOpen === 'middle') {
                    insidePar = words[i] + ' ' + insidePar;
                }
                if (isParOpen === 'first' || isParOpen === 'middle') {
                    words[i + 1] = insidePar.trim();
                    words.splice(i, 1);
                }
                if (isParOpen === 'first') {
                    insidePar = '';
                }
            }
        }
        for (let i = words.length - 1; i >= 0; i -= 1) {
            if (words[i] === '+') {
                if (!Array.isArray(words[i - 1])) {
                    words[i - 1] = [words[i - 1]];
                }
                if (!Array.isArray(words[i + 1])) {
                    words[i + 1] = [words[i + 1]];
                }
                words[i + 1] = fastCartesian([
                    words[i - 1],
                    words[i + 1],
                ]);
                words.splice(i - 1, 2);
            }
        }
        words = words.flat();

        for (let i = 0; i < words.length; i += 1) {
            if (Array.isArray(words[i])) {
                finalArray.push(words[i].join(' + '));
            } else {
                finalArray.push(words[i]);
            }
        }
        return finalArray;
    }

    getIsParOpen(word, isParOpen): string {
        if ((word.startsWith('(') || word.startsWith('\'')) && (word.endsWith(')') || word.endsWith('\''))) {
            return 'no';
        }
        if (word.startsWith('(') || word.startsWith('\'')) {
            return 'first';
        }
        if (word.endsWith(')') || word.endsWith('\'')) {
            return 'last';
        }
        if (isParOpen === 'last') {
            return 'middle';
        }
        return 'no';
    }

    getNumParentheses(word, numOpenParentheses): number {
        if (word.startsWith('(') || word.startsWith('\'')) {
            numOpenParentheses++;
        }
        if (word.endsWith(')') || word.endsWith('\'')) {
            numOpenParentheses--;
        }
        return numOpenParentheses;
    }

    starAnalysis(word, semantic): any {
        return new Promise(resolve => {
            if (!semantic) {
                this.nodeService.suggestSimple(word.slice(0, -1)).subscribe(data => {
                    const keysText = [];
                    const keys = data.suggest[0].options;
                    keys.forEach((element) => {
                        const str = element.text;
                        keysText.push(str);
                    });
                    resolve(keysText);
                });
            } else {
                this.nodeService.suggestTerminology(word.slice(0, -1)).subscribe(data => {
                    const keysText = [];
                    const keys = data.results;
                    keys.forEach((element) => {
                        const str = element.label;
                        keysText.push(str);
                    });
                    resolve(keysText);
                });
            }
        });
    }

/**
   * replaces query terms with URIs from ontologies
   *
   * @param annotations, keys from json string in string[]
   * @param json, form values as json string
   */
  replaceQueryTermsWithConcepts(annotations: string[], json: string, defaultOperator:string):any {
      
	  if(annotations == null)
		return null;
	
      return new Promise((resolve, reject) => {
	      
          this.URIsFound = 0;
          //const ql = this.questionService.getQuestionLabels();
          let terms= [];
          annotations.forEach(annotation => {
	          
              
              let tokenLength = 0;
              let stringToAnalyze = json[annotation];       
              const regex = /[{},/;:_-]+/g;
              if (stringToAnalyze.match(regex)){
					return null;
              }
              try{
					this.luceneParser = LuceneQueryParser.parse(stringToAnalyze);
             		 //console.log(this.luceneParser);
			  }catch(error){
					console.log(error);
					
                 
			   }

			  
          if (this.luceneParser != '' && !this.isEmpty(this.luceneParser)) {
                 /*if (this.originalQuery.length === 0) {
                    this.originalQuery =  '(' + this.initializeQuery(this.luceneParser,defaultOperator) + ')';
                 }else {
                    this.originalQuery = this.originalQuery + ' ' + defaultOperator + ' (' + this.initializeQuery(this.luceneParser,defaultOperator) + ')';
                 }*/

              const t = this.getTermsFromLuceneParser(this.luceneParser);

              //terms.push(t);
              // console.log(t);


               tokenLength = t.length;

              // How many async calls do we have? add queryTerms.length
              this.asyncCallsRemaining = this.asyncCallsRemaining + t.length;

              t.forEach(object => {
                   //const queryTerm = term['term'];
                   let binding;

                   /*const l = this.annotations.filter(function(el) {
                       return el.toLowerCase().indexOf(object.term.toLowerCase()) > -1;
                   });*/

                     this.graphDB.getURL(object.term.toLowerCase()).subscribe(data => {

                         // if queryTerm = annotation name , e.g., Organism: organism --> search for all organism annotation
                         // don't take the URI (even if there is one) - leads to wrong results
                        /* if (l.length > 0) {

                             console.log('queryTerm is an annotation: ' + object.term);
                         }else {*/

                         if (data === null || data === undefined) {
                             console.log('Error');
                           }
                         binding = data['results']['bindings'];
                          //console.log(binding);

                          if (binding !== null && binding.length > 0) {
                             let URIs = '';

                            binding.forEach(b => {
                              // console.log('URL for term "' + object.term + '":' + b.entity.value);
                              if(URIs == '')
									URIs = b.entity.value;						
                              else
							  		URIs = URIs   + ',' +b.entity.value;
                              
                              this.URIsFound = this.URIsFound + 1;
                     
                              const index = t.indexOf(object.term);
                            });

                            object.URI = URIs;
                            object.type = annotation;
                         }else {
                             // console.log('No URL found for term: ' + object.term);
                         }

                        //}

                        --tokenLength;

                         // if all calls for queryTerms per annotation are back - push it to the query array
                         if (tokenLength <= 0) {
                             // const queryItem: string =  '{"' + annotation + '":"' + queryTerms + '"}';
                             const termString = [];

                             t.forEach(entry => {
                                 termString.push('{"term":"' + entry['term'] + '","URI":"' + entry['URI'] + '"}');
                             });
                             const queryItem: string =  '{"' + annotation + '":[' + termString + ']}';
                             // console.log(queryItem);
                             this.query.push(queryItem);

                         }

                         // console.log(queryItem);
                         --this.asyncCallsRemaining;

                         // check if we are done and all async calls are back
                         if (this.asyncCallsRemaining <= 0) {

                                // console.log(this.query);
                                const q = this.query;
                                this.query = [];
                                return resolve(q);

                         }
                        //terms.push(object);
          

                      }); // graphDB connection


               });


              } // end if luceneParser.length >0
              
            }); // for each annotation (category)
			 if (this.asyncCallsRemaining <= 0) {
				return resolve(this.query);
			}
			//resolve(terms);
      });

    }



  /**
   * get terms out of the LuceneParserResult
   * e.g., Input:
   * {left: {�}, operator: "<implicit>", right: {�}}
   *
   * left:{field: "<implicit>", term: "Apis mellifera", proximity: null, boost: null, prefix: null}
   * operator:"<implicit>"
   * right:
   *    left:{field: "<implicit>", term: "fish", similarity: null, boost: null, prefix: null}
   *    operator:"<implicit>"
   *    right:
   *         boost:null
   *         field:"<implicit>"
   *         prefix:null
   *         similarity:null
   *         term:"quercus"
   *
   * Output: [{term: "Apis mellifera"},{term: "fish"}, {term: "quercus"}]
   *
   * @param luceneParser as JSONObjects
   * @return [] with JSONObjects ([{term:<term>}])
   */
  getTermsFromLuceneParser(luceneParser: any): any {
   const terms: any = [];

   if (luceneParser === null || luceneParser === undefined) {
       console.log('Error');
   }else {
       if (luceneParser['left']  && luceneParser['left']['term']) {
            // console.log('luceneParserLeft:' + luceneParser['left']['term']);
           const term = {};
           term['term'] = luceneParser['left']['term'];
           terms.push(term);
       }
        if (luceneParser['left'] && luceneParser['left']['left']) {
             const temp = this.getTermsFromLuceneParser(luceneParser['left']);

             if (temp.length > 0) {
              temp.forEach(entry => {
                  terms.push(entry);
              });
           }
         }
       if (luceneParser['right']  && luceneParser['right']['term']) {
           // console.log(luceneParser['right']['term']);
           const term = {};
           term['term'] = luceneParser['right']['term'];
           terms.push(term);
       }
       if (luceneParser['right'] && luceneParser['right']['left']) {
           const temp = this.getTermsFromLuceneParser(luceneParser['right']);

           if (temp.length > 0) {
              temp.forEach(entry => {
                  terms.push(entry);
              });
           }
       }
   }

   return terms;
  }

  /**
   * initialize Query per annotation
   *
   * @param LuceneParserresult from QueryInput
   */
   initializeQuery(parser?: any, defaultOperator?:string): string {
     let query = '';

     if (parser === null || parser === undefined) {
         parser = this.luceneParser;
     }
         // console.log(this.luceneParser);
         if (parser['left'] !== null  && parser['left']['term'] ) {
                 //query = query + '"'+parser['left']['term']+ '"';
                 query = query + parser['left']['term'];
         }
         if (parser['left'] && parser['left']['left']) {
             const temp = this.initializeQuery(parser['left'],defaultOperator);

             if (temp.length > 0) {
                query = query + '( ' + temp +  ' )';
             }
         }
         if (parser['operator']) {
              if (parser['operator'] !== '<implicit>') {
                query = query + ' ' + parser['operator'] + ' ';
              }else {
                query = query + ' ' + defaultOperator + ' ';
              }
         }
         if (parser['right']  && parser['right']['term']) {
             //query = query + '"'+parser['right']['term']+ '"';
             query = query + parser['right']['term'];
         }
         if (parser['right'] && parser['right']['left']) {
             const temp = this.initializeQuery(parser['right'],defaultOperator);

             if (temp.length > 0) {
                query = query + '( ' + temp +  ' )';
             }
         }
          return query;
    }
   

   private isEmpty(obj) {
      for (const prop in obj) {
          if (obj.hasOwnProperty(prop)) {
              return false;
          }
      }

      return JSON.stringify(obj) === JSON.stringify({});
  }

  /** build query for Mimir **/
   buildQuery(originalQuery, queryConcepts, operator, defaultQuestion): string{
     
     if(queryConcepts == null)
		return originalQuery;  
      
     //let mq = originalQuery;
     let mq = '';
     let finalConcepts = [];
     // console.log(mq);
    queryConcepts.forEach(queryConcept => {
         console.log('Query Concept: '+queryConcept);
         let q;
         let obj;
         let keys;
          //obj = queryConcept[environment.defaultAnnotation];
          try{
				//if not, it is maybe a string? then parse it
				let o = JSON.parse(queryConcept)
				obj = o[environment.defaultAnnotation];               
                keys = Object.keys(o);
            }
           catch (error){
	            try{
						//if not, it is maybe a string? then parse it
						
						obj = queryConcept[environment.defaultAnnotation];               
		                keys = Object.keys(queryConcept);
		            }
                 catch (error){
					obj = null;
					keys = null;
				}
           }
         if(keys!== undefined && keys !== null && (keys[0] === (environment.defaultAnnotation))){
		          console.log ('default annotation case');
                  
                  
                  obj?.forEach(instance => {
	                    console.log ('term: '+instance.term);
                        //let q = instance.term;
                        let q = '"'+instance.term+'"';
                        let URIs = instance.URI.split(',');
						URIs.forEach(URI =>{
							
								if(URI !== undefined && URI !== 'undefined'){
									if(q == undefined)
										q = this.questionService.getDefaultQuestion().sparqlTemplate.replace(/\<queryTerm\>/gi,  URI ).replace(/endpointSparql/g, this.graphDB.endpointSparql);
									else
										q = q + ' OR ' + this.questionService.getDefaultQuestion().sparqlTemplate.replace(/\<queryTerm\>/gi,  URI ).replace(/endpointSparql/g, this.graphDB.endpointSparql);
		                        }
							});
					   //if(q !== undefined && q !== 'undefined')	
		                     console.log('q: '+q); 
				             instance.query = q;
	                   
                       finalConcepts.push(instance);
		
				  });
		          
                  
		       
	     }else{

         this.questions.forEach(question => {
	         
	        for (let i = 0; i < environment.annotationTypes.length;i++){
				
				//let keys;
				//let obj;
				
				//test if obj is already a JSON Object
				if(queryConcept[question[i].key] == undefined){
					try{
						//if not, it is maybe a string? then parse it
						let o = JSON.parse(queryConcept)
						obj = o[question[i].key];               
		                keys = Object.keys(o);
		            }
					catch(error){
						
						//console.log(error);
						//in case it is a category search, e.g., {Organism} - no URI search necessary - stop procedure
						obj = null;
						keys = null;
						
					}   
				}else{
					obj = queryConcept[question[i].key];
					keys = Object.keys(queryConcept);
				}
				//replace query only if we have an actual object		
				// one JSON object per annotation, first key is the question.key
	            if (keys!== undefined && keys !== null && (question[i].key === (keys[0]))) {
	               
	                
	                const queryTerms: string[] = [];

	                queryTerms.push(obj[question[i].key]);
	
	                //obj[question[i].key].forEach(term => {
		            obj.forEach(term => {
	                    //let q = '"'+term.term+'"';
						let q = question[i].defaultTemplate.replace(/\<queryTerm\>/gi,  '"'+term['term']+'"' );
						
	                    const l = environment.annotationTypes.filter(function(el) {
	                        return el.toLowerCase().indexOf(term['term'].toLowerCase()) > -1;
	                    });
	
	                   if (term['URI'] !== undefined && term['URI'] !== 'undefined' && term['URI'].match(/http:.*/)) {
	                      // tslint:disable-next-line:max-line-length
	                    if(term['URI'].match(/,/)){
							let URIs = term['URI'].split(',');
							
							URIs.forEach(URI =>{
								    
										if(q == undefined)
											q = question[i].sparqlTemplate.replace(/\<queryTerm\>/gi,  URI ).replace(/endpointSparql/g, this.graphDB.endpointSparql);
										else
											q = q + ' OR ' + question[i].sparqlTemplate.replace(/\<queryTerm\>/gi,  URI ).replace(/endpointSparql/g, this.graphDB.endpointSparql);
			                         
									
							});
							
						}else  
						    
							q = q + ' OR ' +  question[i].sparqlTemplate.replace(/\<queryTerm\>/gi,  term['URI'] ).replace(/endpointSparql/g, this.graphDB.endpointSparql);
							
	
	                   }else if (l.length > 0) {
	                    // queryTerm is an annotation - search for ALL
	                       // first letter capitalized
	                       q = '{' + this.utility.capitalizeFirstLetter(term['term']) + '}';
	                   }else {
	                      // tslint:disable-next-line:max-line-length
	                      //q = question[i].defaultTemplate.replace(/\<queryTerm\>/gi,  '"'+term['term']+'"' );
	                   }
                       console.log('q: '+ q);
                       term.query = q;
	
	                   finalConcepts.push(term);
	                });
                    
	                // console.log(q);
	           }
						
	        } 
           
           
        });
      }

   });

   
 //   const result = finalConcepts.reduceRight((r, { term: t, query: q}) =>r.substring(0, t)+ '<div class="biodivEntities-tooltip">'+r.substring(s, e)+'<div class="tooltiptext">'+'<div class="categoryTooltiptext"><b>Category:</b> ' + t + '</div><div></div>'+u+'</div></div>'+r.substring(e), stringToHighlight);
   
   
   //let arrayReplacedTerms = [];
   
   finalConcepts.forEach(concept =>{
	 //console.log('tmp: '+concept.term); 	
      let start = originalQuery.indexOf(concept.term);
      //console.log('start: '+start);
      let end = start + concept.term.length;
     // console.log('end: '+end);
      concept.start = start;
      concept.end = end;

     if (mq.length > 0) {
              const tmp = mq;
              
		      mq = mq + ' '+operator+' ' + '('+concept.query+')';
			
              //arrayReplacedTerms.push(concept.term);
	           
			  
	   } else {
	      mq = '('+concept.query+')';
          //arrayReplacedTerms.push(concept.term);
	   }
    });
    finalConcepts.sort(function(a, b){return a.start-b.start || a.end - b.end});
    let finalArray = this.determineSameStartEndValues(finalConcepts);
    console.log(finalArray);
    let result = finalArray.reduceRight((r, { term: t, query: q, start: s, end: e}) =>r.substring(0, s) +'('+ q +')'+ r.substring(e), originalQuery);

    console.log('mq result:'+result);

    mq = result;

    if(mq == undefined || mq === "undefined" || mq === ''){
		mq = originalQuery;
	} 
	return mq;

  }

  determineSameStartEndValues(array):any {

    let finalArray = [];
    
    //if there is only one item in the array - nothing to do - return
    if(array.length == 1)
		return array;
	let nextentry;
	
    for(let i = 0; i<array.length;i++) {
	    let entry = array[i];
        if(i+1 <array.length)
        	nextentry = array[i+1];
        
					
		//same start values? then take the second (larger) span and add the URI of the shorter span
		if(entry.start == nextentry?.start && entry.end == nextentry?.end && i < (array.length-1)){
			let q = '('+entry.query + ') OR (' + nextentry.query + ')';
			entry.query = q;
			finalArray.push(entry);
			i++;				
		}
		else{
			finalArray.push(entry);
		}
		
       
    }
    return finalArray;
}

  clear() {
      this.originalQuery = '';
  }
   
  prepareQuery(annotations: string[], json: string, defaultOperator:string):any {
	  //return new Promise((resolve, reject) => {
		let query = '';
		this.luceneParser ='';
		let stringToAnalyze;

	     //UI2 - no annotations given, json is the search string
		 if(annotations == null || annotations == undefined || annotations.length == 0){
			 stringToAnalyze = json;
		     query = this.parseAndAppendStringToQuery(stringToAnalyze, query, defaultOperator);
		 }else{
			annotations.forEach(annotation => {
 
				//annotations given (UI1)
				stringToAnalyze = json[annotation];

	            query = this.parseAndAppendStringToQuery(stringToAnalyze, query, defaultOperator);
		  });
         }
      return query;
     // resolve(query);
	//});
	  
  }
  


    private parseAndAppendStringToQuery(stringToAnalyze: any, query: string, defaultOperator: string) {
        try {
            this.luceneParser = LuceneQueryParser.parse(stringToAnalyze);
            console.log(this.luceneParser);
        } catch (error) {
            console.log(error);
            if (query.length === 0) {
                query = '(' + stringToAnalyze + ')';

                //this.query.push(json[annotation]);
            } else {
	            console.log('query:'+query);
                query = query + ' ' + defaultOperator + ' (' + stringToAnalyze + ')';
                //this.query.push(json[annotation]);
            }

        }


        if (this.luceneParser != '' && !this.isEmpty(this.luceneParser)) {
            if (query.length === 0) {
                query = '(' + this.initializeQuery(this.luceneParser, defaultOperator) + ')';
            } else {
	            console.log('query:'+query);
                query = query + ' ' + defaultOperator + ' (' + this.initializeQuery(this.luceneParser, defaultOperator) + ')';
            }
        }
        return query;
    }

    public getURL(queryTerm) {
	   console.log(queryTerm);
       return this.graphDB.getURL(queryTerm).toPromise(); 
    }

    async replaceQueryTermsWithURIs(stringToAnalyze: string, annotation:string){
	 let query = [];
	 if (annotation == null || annotation == '')
		annotation = environment.defaultAnnotation;
	 
     //case category search, e.g., {Organism}, return string, nothing to replace
     const regex = /[{},/;:_-]+/g;
      if (stringToAnalyze.match(regex)){
			return null;
      }
     let luceneParser = LuceneQueryParser.parse(stringToAnalyze);

		try{
		  luceneParser = LuceneQueryParser.parse(stringToAnalyze);
             		 //console.log(this.luceneParser);
		  }catch(error){
				console.log(error);
				
             
		   }
        if (luceneParser != '' && !this.isEmpty(luceneParser)) {
	        const t = this.getTermsFromLuceneParser(this.luceneParser);
			let response = [];
		    let num = 'test';
            if(t != null && t.length >0){
			    for(let i = 0; i < t.length; i++) {
				    
			        let res = await this.getURL(t[i].term.toLowerCase());
                    let binding = res['results']['bindings'];
                    if (binding !== null && binding.length > 0) {
                        let URIs = '';

                        binding.forEach(b => {
	                           console.log('URL for term "' + t[i].term + '":' + b.entity.value);
	                          if(URIs == '')
									URIs = b.entity.value;						
	                          else
							  		URIs = URIs   + ',' +b.entity.value;
	                      });

                         t[i].URI = URIs;  
                    }  
			    }
			    // Got all the results!
                const termString = [];

	             t.forEach(entry => {
	                 termString.push('{"term":"' + entry['term'] + '","URI":"' + entry['URI'] + '"}');
	             });
	             const queryItem: string =  '{"' + annotation + '":[' + termString + ']}';
	              console.log(queryItem);
	             query.push(queryItem);
			}
            
             
        }
     return query;
		    
    }
}
