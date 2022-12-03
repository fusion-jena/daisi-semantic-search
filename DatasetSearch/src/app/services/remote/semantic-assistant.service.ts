import {Injectable} from '@angular/core';
import {Result} from '../../models/result/result';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Description} from '../../models/result/description';
import {CommunicationService} from '../local/communication.service';
import {Annotation} from '../../models/annotations/Annotation';
import {Organism} from '../../models/annotations/Organism';
import {Person} from '../../models/annotations/Person';
import {Location} from '../../models/annotations/Location';
import {Environment} from '../../models/annotations/Environment';
import {Quality} from '../../models/annotations/Quality';
import {Material} from '../../models/annotations/Material';
import {Process} from '../../models/annotations/Process';
import {AnnotationInstance} from '../../models/annotations/AnnotationInstance';

@Injectable({
    providedIn: 'root'
})
export class SemanticAssistantService {
    url = environment.gateUrl;
    headers: { 'Content-Type': string } = {'Content-Type': 'application/json'};

    //annotations = [Organism,Environment,Material,Quality,Process,Location,Person]
    private annotations = environment.annotationTypes;


    constructor(private http: HttpClient, private communicationService: CommunicationService) {
    }

    getOrganismAnnotations(key): any {
	  return new Promise(resolve => {
        const headers = this.headers;
        this.http.get<any>(this.url + 'organismTagger/' + key.trim(), {headers}).subscribe(data => {
            const result = [];
                let annotations = [];
                data.forEach(word => {

                    const preWord = key.trim().substring(word.startNode.offset, word.endNode.offset);
                    const type = word.type;
                    const inst = word.features.inst;
                    const obj = {
                        word: preWord,
                        type,
                        inst
                    };

                    let annotation = new Annotation();
                    annotation.type = type;

                    annotation.addInstance(this.createAnnotationInstance(type, preWord, word.startNode.offset, word.endNode.offset, word.features));
                    annotations.push(annotation);


                });
                //resolve(result);
                resolve(annotations);
        });
      });
    }
   

    getBiodivAnnotations(key): any {
        return new Promise(resolve => {
            const headers = this.headers;
            this.http.get<any>(this.url + 'bioTagger/' + key.trim(), {headers}).subscribe(data => {
                const result = [];
                let annotations = [];
                data.forEach(word => {

                    const preWord = key.trim().substring(word.startNode.offset, word.endNode.offset);
                    const type = word.type;
                    const inst = word.features.inst;
                    const obj = {
                        word: preWord,
                        type,
                        inst
                    };

                    let annotation = new Annotation();
                    annotation.type = type;

                    annotation.addInstance(this.createAnnotationInstance(type, preWord, word.startNode.offset, word.endNode.offset, word.features));
                    annotations.push(annotation);


                });
                //resolve(result);
                resolve(annotations);
                // this.communicationService.setAnnotations(result);
            });
        });
    }
    

    createAnnotationInstance(type, content, start, end, features) {
        let annotationInstance;
        type = type.toLowerCase();
        switch (type) {
            case 'organism':
                annotationInstance = new Organism({
                    content: content,
                    start: start,
                    end: end,
                    scientificName: features.scientificName,
                    URI: features.inst
                });
                break;
            case 'person':
                annotationInstance = new Person({
                    content: content,
                    start: start,
                    end: end,
                    gender: features.gender
                });
                break;
            case 'location':
                annotationInstance = new Location({
                    content: content,
                    start: start,
                    end: end,
                    locType: features.locType
                });
                break;
            case 'environment':
                annotationInstance = new Environment({
                    content: content,
                    start: start,
                    end: end,
                    URI: features.inst
                });
                break;
            case 'quality':
                annotationInstance = new Quality({
                    content: content,
                    start: start,
                    end: end,
                    URI: features.inst
                });
                break;
            case 'process':
                annotationInstance = new Process({
                    content: content,
                    start: start,
                    end: end,
                    URI: features.inst
                });
                break;
            case 'material':
                annotationInstance = new Material({
                    content: content,
                    start: start,
                    end: end,
                    URI: features.inst
                });
                break;
        }

        return annotationInstance;
    }

  

    public getBiodivTaggerAnnotations(key){
	    const headers = this.headers;
		return this.http.get<any>(this.url + 'bioTagger/' + key.trim(), {headers}).toPromise();
    }
    public getOrganismTaggerAnnotations(key){
	    const headers = this.headers;
		return this.http.get<any>(this.url + 'organismTagger/' + key.trim(), {headers}).toPromise();
    }

    createDefaultAnnotations(objects): any {
	    if(objects==null)
			return null;
        let annotations = [];

        objects.forEach(object => {

            let jsonObject;
            try {
                jsonObject = JSON.parse(object);
            } catch (error) {
                jsonObject = null;
            }

            if (jsonObject != null && jsonObject !== undefined) {

                let keys = Object.keys(jsonObject);
                let entries = jsonObject[keys[0]];//array of objects

                entries.forEach(entry => {
                    let URIs = [];
                    if (entry.URI.match(/,/)) {
                        URIs = entry.URI.split(',');
                    } else {
                        URIs.push(entry.URI);
                    }

                    URIs.forEach(URI => {
                        let annotation = new Annotation();
                        annotation.type = keys[0]; //jsonObject has only 1 key = type, e.g., Organism, Environment ...
                        let features = {'inst': URI};

                        annotation.addInstance(this.createAnnotationInstance(keys[0], entry.term, null, null, features));
                        annotations.push(annotation);
                    });

                });


                //
                //
                //
            }
        });
        console.log(annotations);
        return annotations;
    }
   async callSAServiceToObtainTypes(queryConcepts){
	    
        let annotations = [];
        let results = [];
        let annotationKeys = [];
        let instances = [];
        for (let j=0; j<queryConcepts.length;j++){
            let object = queryConcepts[j];
            let jsonObject;
            try {
                jsonObject = JSON.parse(object);
            } catch (error) {
                jsonObject = null;
            }

            if (jsonObject != null && jsonObject !== undefined) {

                let keys = Object.keys(jsonObject);
                let entries = jsonObject[keys[0]];//array of objects
                
               for (let i=0; i<entries.length;i++){
                    //let URIs = [];
                    let term = entries[i].term;
                    let resB = await this.getBiodivTaggerAnnotations(term);
                    results.push({'term': term,'result':resB});
					
					let resO = await this.getOrganismTaggerAnnotations(term);
                    results.push({'term': term,'result':resO});
                }

				results.forEach(data =>{
					
					data.result.forEach(word => {
                    
                    const preWord = data.term.trim().substring(word.startNode.offset, word.endNode.offset);
                    const type = word.type;
                    const inst = word.features.inst;
                    const obj = {
                        word: preWord,
                        type,
                        inst
                    };
			       if(annotationKeys.indexOf(data.term.trim()) <0){
	 					annotationKeys.push(data.term.trim());
					    let annotation = new Annotation();
                        annotation.type = type;
                        annotation.icon = this.getIcon(type);
                        annotation.term = data.term.trim();
                        annotation.addInstance(this.createAnnotationInstance(type, preWord, word.startNode.offset, word.endNode.offset, word.features));
                        annotations.push(annotation);
                    }else{ 
	                    let found = false;
					   	annotations.forEach(annotation =>{
						 	if(annotation.term == data.term.trim()){
							   if(annotation.type == type){
								 annotation.addInstance(this.createAnnotationInstance(type, preWord, word.startNode.offset, word.endNode.offset, word.features));                       
							   	 found = true;
								}
						   }
					   });
		               if(!found){
			            
						  let annotation = new Annotation();
	                      annotation.type = type;
                          annotation.icon = this.getIcon(type);
	                      annotation.term = data.term.trim();
	                      annotation.addInstance(this.createAnnotationInstance(type, preWord, word.startNode.offset, word.endNode.offset, word.features));
	                      annotations.push(annotation);
							  
					   }
					}

                  });

               });
            }
        }
        console.log(annotations);
        return annotations;
    }
    getIcon(type: any): string {
        switch(type.toLowerCase()){
	
			case 'organism': return environment.iconOrganism;
			case 'environment': return environment.iconEnvironment;
			case 'quality': return environment.iconQuality;
			case 'process': return environment.iconProcess;
			case 'material': return environment.iconMaterial;
        }
        
    }
   

}
