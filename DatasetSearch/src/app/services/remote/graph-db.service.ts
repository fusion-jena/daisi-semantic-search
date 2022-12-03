import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UtilityService} from '../utility.service';
//import { MessageService } from '../message.service';
//import { timeout} from 'rxjs/operators';
//import { Term } from '../../models/query/Term';
import {environment} from '../../../environments/environment';
import {CommunicationService} from '../local/communication.service';
import {MessageService} from '../local/message.service';

@Injectable({
    providedIn: 'root'
})
export class GraphDbService {

    public endpoint = environment.terminologyEndpoint;
    public endpointSparql = environment.terminologySPARQL;
    public URL = '';
    headers: { 'Content-Type': string } = {'Content-Type': 'application/x-www-form-urlencoded'};

    // ************* SPARQL Templates - ToDo: create template file ************************** //

    public sparqlGetSynonyms: string = 'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\n'
        + 'prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n'
        + 'prefix obo: <http://purl.obolibrary.org/obo/>\n'
        + 'prefix oboInOwl: <http://www.geneontology.org/formats/oboInOwl#>\n'
        + '\n'
        + 'SELECT DISTINCT ?label '
        + 'FROM NAMED <' + this.endpointSparql + '/%GRAPH%> '
        + 'WHERE {  \n'
        + '		  GRAPH ?g'
        + '         {\n'
        + '              VALUES (?root){(<%ENTITY%>)} \n'
        + '          		{\n'
        + '                  ?root rdfs:label ?label.\n'
        + '               }UNION{\n'
        + '                   ?root oboInOwl:hasExactSynonym ?label.\n'
        + '               }UNION{\n'
        + '             		?root oboInOwl:hasRelatedSynonym ?label.\n'
        + '               }\n'
        + '          }\n'
        + '}';

    public sparqlGetURI: string = 'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\n'
        + 'prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n'
        + 'prefix obo: <http://purl.obolibrary.org/obo/>\n'
        + 'prefix oboInOwl: <http://www.geneontology.org/formats/oboInOwl#>\n'
        + '\n'
        + 'SELECT DISTINCT ?entity '
        + 'FROM NAMED <' + this.endpointSparql + '/ENVO> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/PATO> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/NCBITAXON> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/CHEBI> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/OBI> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/GO> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/REX> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/NCBITAXON> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/PO> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/UBERON> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/BFO> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/INO> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/PPO> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/FLOPO> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/ECOCORE> \n'
        + 'WHERE {  GRAPH ?g{\n'
        + '         {\n'
        + '              ?entity rdfs:label "<queryTerm>".\n'
        + '          }UNION{\n'
        + '              ?entity rdfs:label "<queryTerm>"@en.\n'
        + '          }UNION{\n'
        + '              ?entity rdfs:label "<queryTermUpperCase>".\n'
        + '          }UNION{\n'
        + '              ?entity oboInOwl:hasExactSynonym "<queryTerm>".\n'
        + '          }UNION{\n'
        + '             ?entity oboInOwl:hasRelatedSynonym "<queryTerm>".\n'
        + '          }UNION{\n'
        + '              ?entity oboInOwl:hasExactSynonym "<queryTermUpperCase>".\n'
        + '          }UNION{\n'
        + '             ?entity oboInOwl:hasRelatedSynonym "<queryTermUpperCase>".\n'
        + '          }UNION{\n'
        + '              ?entity skos:prefLabel "<queryTerm>".\n'
        + '         }UNION{\n'
        + '              ?entity skos:prefLabel "<queryTermUpperCase>".\n'
        + '          }}\n'
        + '}';

     public sparqlGetURILike: string = 'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\n'
        + 'prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n'
        + 'prefix obo: <http://purl.obolibrary.org/obo/>\n'
        + 'prefix oboInOwl: <http://www.geneontology.org/formats/oboInOwl#>\n'
        + '\n'
        + 'SELECT DISTINCT ?entity '
        + 'FROM NAMED <' + this.endpointSparql + '/ENVO> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/PATO> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/NCBITAXON> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/CHEBI> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/OBI> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/GO> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/REX> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/NCBITAXON> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/PO> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/UBERON> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/BFO> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/INO> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/PPO> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/FLOPO> \n'
        + 'FROM NAMED <' + this.endpointSparql + '/ECOCORE> \n'
        + 'WHERE {  GRAPH ?g{\n'
        + '         {\n'
        + '              ?entity rdfs:label "<queryTerm>".\n'
        + '          }UNION{\n'
        + '              ?entity rdfs:label "<queryTerm>"@en.\n'
        + '          }UNION{\n'
        + '              ?entity rdfs:label "<queryTermUpperCase>".\n'
        + '          }UNION{\n'
        + '              ?entity oboInOwl:hasExactSynonym "<queryTerm>".\n'
        + '          }UNION{\n'
        + '             ?entity oboInOwl:hasRelatedSynonym "<queryTerm>".\n'
        + '          }UNION{\n'
        + '              ?entity oboInOwl:hasExactSynonym "<queryTermUpperCase>".\n'
        + '          }UNION{\n'
        + '             ?entity oboInOwl:hasRelatedSynonym "<queryTermUpperCase>".\n'
        + '          }UNION{\n'
        + '              ?entity skos:prefLabel "<queryTerm>".\n'
        + '         }UNION{\n'
        + '              ?entity skos:prefLabel "<queryTermUpperCase>".\n'
        + '          }}\n'
        + '}';

    public sparqlAutoComplete: string = 'PREFIX luc: <http://www.ontotext.com/owlim/lucene#>\n'
        + 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n'
        + 'SELECT ?label ?id {\n'
        + '?id luc:myTestIndex "<label>*".\n'
        + '?id rdfs:label ?label\n'
        + '}';

    constructor(public http: HttpClient, public util: UtilityService, private communicationService: CommunicationService, private messageService: MessageService) {

    }

    /*constructor(public http: HttpClient, public util: UtilityService, public messageService: MessageService) {

    }*/

    /*public getSuggest(label: string){


         const sparqlTemp = this.sparqlAutoComplete;
         const sparql = sparqlTemp.replace(/\<label\>/gi, label);
         console.log(sparql);


         return this.http.get<Term>(this.endpoint + '?query=' + encodeURIComponent(sparql)).pipe(timeout(10000));

         // server side pagination
         // https://medium.com/@JeremyLaine/server-side-pagination-and-filtering-with-angular-6-280a7909e783


    }*/

    public getURL(queryTerm: string) {

        const sparqlTemp = this.sparqlGetURI.replace(/\<queryTerm\>/gi, queryTerm.trim());
        const sparql = sparqlTemp.replace(/\<queryTermUpperCase\>/gi, this.util.capitalizeFirstLetter(queryTerm.trim()));
        // console.log(sparql);
        this.messageService.addSparqlInQuery({'sparqlToGetURL':sparql});

       return this.http.get(this.endpoint + '?query=' + encodeURIComponent(sparql));

    }

    public getSparqlResult(sparql: string) {
       return this.http.get(this.endpoint + '?query=' + encodeURIComponent(sparql));
    }

    public getSynonyms(param): any {
		if (param == null){
			return null;
		}
        //console.log(param);
        return new Promise(resolve => {
            //const annotationArray = param.annotations;
            const finalAnnotations = [];
            //annotationArray.forEach(feature => {
	        param.forEach(annotation => {
		       console.log(annotation);
		       annotation.instances.forEach(instance =>{
			        
		           //if(feature !== undefined && feature.inst !== undefined){
		           if(instance.getURI() !== undefined && instance.getURI()!== "undefined"){
						// console.log(instance.getURI());
		                const entity = instance.getURI(); // can be more than 1!!!
						let entityArray = [];
						
						if(entity.match(/,/)){
							entityArray = entity.split(',');					
						}
						else{
							entityArray.push(entity);
						}
                        entityArray.forEach(entity =>{
	                        
							const headers = this.headers;
			                const sparqlTemp = this.sparqlGetSynonyms.replace(/%ENTITY%/gi, entity.trim());
			                const graphArray = entity.split('\/');
			                const graph = graphArray[graphArray.length - 1].split('_');
			                const sparql = sparqlTemp.replace(/%GRAPH%/gi, graph[0].toUpperCase());
			                // console.log(sparql);
                            this.messageService.addSparqlInResult(sparql);
			                this.http.get<any>(this.endpoint + '?query=' + encodeURIComponent(sparql), {headers}).subscribe(data => {
			                    //feature.synonym = data;
	                             	data.results.bindings.forEach(synonym=>{
										// console.log("Synonym:"+synonym.label.value);
										instance.addSynonym(synonym.label.value);
									});
									
						            
		                       
			                    //finalAnnotations.push(feature);
			                    
								// this.communicationService.setSynonyms(data);
			                    // console.log(data);
			                });
						});
		                
					}
				})
				finalAnnotations.push(annotation);
            });
            resolve(finalAnnotations);
        });

    }

    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    /*private handleError<T> (operation = 'operation', result?: T) {
      return (error: any): Observable<T> => {

        // TODO: send the error to remote logging infrastructure
        console.error(error); // log to console instead

        // TODO: better job of transforming error for user consumption
        this.log(`${operation} failed: ${error.message}`);

        // Let the app keep running by returning an empty result.
        return of(result as T);
      };
    }*/


    

}
