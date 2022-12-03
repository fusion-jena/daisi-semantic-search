import {Injectable} from '@angular/core';
import {Result} from '../../models/result/result';
import {Hit} from '../../models/result/hit';
import {Citation} from '../../models/result/citation';
import {Description} from '../../models/result/description';
import {Linkage} from '../../models/result/linkage';
import {UpperLabel} from '../../models/result/upperLabel';
import {environment} from '../../../environments/environment';
import {MessageService} from '../local/message.service';
import {UtilityService} from '../utility.service';
import {AnnotationInstance} from 'src/app/models/annotations/AnnotationInstance';
import {Organism} from 'src/app/models/annotations/Organism';
import {Quality} from 'src/app/models/annotations/Quality';
import {Process} from 'src/app/models/annotations/Process';
import {Material} from 'src/app/models/annotations/Material';
import {Environment} from 'src/app/models/annotations/Environment';

@Injectable({
    providedIn: 'root'
})
export class BiodivPreprocessDataService {

    public static dataCenter = environment.dataCenter;
    public static dataType = environment.dataType;
    public static parameter = environment.parameter;
    public static taxonomy = environment.taxonomy;
    public static geographicRegion = environment.geographicRegion;
    public static type = environment.type;
    public static datacenterTooltips = environment.datacenterTooltips;
    private id;
    private colors = environment.colors;
    private vatTooltip = environment.vatTooltip;
    private noCoordinates = environment.noCoordinates;
    private annotationTypes = environment.annotationTypes;
    private annotationText = '';
    private synonymObjectArray = [];
    private synonymExtendedArray = [];
    private synonymTags = '';
    constructor(private messageService: MessageService, private utilityService: UtilityService) {

    }

    getResult(jsonObject, param, component): Result {
        //console.log(param);
        const result = new Result();
        
        this.synonymObjectArray = this.getSynonyms(param);
        this.synonymExtendedArray = this.addSynonymsToMessageService(param);
        /*this.synonymArray?.forEach(synonym => {
                          const tag = '<div><span>' + synonym + '</span></div>';
                          this.synonymTags = this.synonymTags + tag;
                       
                    });*/
        const hits: Hit[] = this.getHits(jsonObject, param,component);
        result.setHits(hits);
        // tslint:disable-next-line:radix
        result.setTotalNumber(parseInt(jsonObject?.docsCount));
        //sort highlighting array length
        const highlightingDesc = jsonObject?.highlighting.sort((a,b) => b.length - a.length);
        result.setHighlighting(highlightingDesc);
        //result.setSemanticKeys(jsonObject?.highlighting);
        
        result.setAnnotationText(this.annotationText);
        return result;
    }

    getHits(jsonObject, param,component): Hit[] {
        const hits: Hit[] = [];
        const hitsOfObject = jsonObject.hits;
        const highlightingDesc = jsonObject?.highlighting.sort((a,b) => b.length - a.length);
        hitsOfObject.forEach(item => {
            hits.push(this.getHit(item, param, jsonObject?.highlighting,component));
        });
        return hits;
    }

    getAnnotations(txt,component): string {
        this.annotationText = this.annotationText + txt;
         
        let txtNew = txt;
     
        let type;

     

        if(component == environment.biodiv1){     
            this.synonymObjectArray?.forEach(object =>{
	            //let synonymTags = '';
                /*console.log(object.type);
                console.log(object.synonyms);
                console.log(object.synonymTags);*/
	            object.synonyms?.forEach(synonym =>{
		          
               
                    type = object.type.replace(/^\w/, (c) => c.toUpperCase());
		            let s0 = '^(<h>s?)'; //start of line/sentence				
	 				let s1 = '(<h>s?)$'; //end of line/sentence
				    let s2 = '(<span class="highlight-(text)?(title)?">(<h>s?)<\\/span>)'; //within spans
	                
					let s3 = '[^>\\w](<h>)[^<\\w]'; //within text
	                let pattern0 = s0.replace('<h>', synonym);
	 				let pattern1 = s1.replace('<h>', synonym);
				    let pattern2 = s2.replace('<h>', synonym);
				    let pattern3 = s3.replace('<h>', synonym);
	                const regex0 = new RegExp(pattern0, 'i');
		            const regex1 = new RegExp(pattern1, 'i');
	                const regex2 = new RegExp(pattern2, 'i');
	                const regex3 = new RegExp(pattern3, 'i');
	                //console.log(regex2);
	               		let arr;
						if((arr = regex0.exec(txtNew)) !== null)
						{
							txtNew = txtNew.replaceAll(arr[1],'<div class="bio-div-tooltip">'
	                            + arr[1] + '<div class="tooltiptext"><div><b>Category: </b>' + type + '</div><br><div><span><i>Synonyms:</i></span></div>' + object.synonymTags + '</div></div>');
							
						}
						if((arr = regex1.exec(txtNew)) !== null)
						{
							txtNew = txtNew.replaceAll(arr[1],'<div class="bio-div-tooltip">'
	                            + arr[1] + '<div class="tooltiptext"><div><b>Category: </b>' + type + '</div><br><div><span><i>Synonyms:</i></span></div>' + object.synonymTags + '</div></div>');
							
							
						}
						while ((arr = regex2.exec(txtNew)) !== null) {
						  //console.log('match');
						  txtNew = txtNew.replaceAll(arr[4],'<div class="bio-div-tooltip">'
	                            + arr[4] + '<div class="tooltiptext"><div><b>Category: </b>' + type + '</div><br><div><span><i>Synonyms:</i></span></div>' + object.synonymTags + '</div></div>');
						  
						}
						//doesn't work for 'bacteria' - neverending loop
						/*while ((arr = regex3.exec(txtNew)) !== null) {
						  //console.log('match');
						  txtNew = txtNew.replaceAll(arr[1],'<div class="bio-div-tooltip">'
	                            + arr[1] + '<div class="tooltiptext"><div><b>Category: ' + type + '</b></div><div><span><i>Synonyms:</i><span></div>' + synonymTags + '</div></div>');
							
						}*/
			   
				 }); 
			});
			}
			else if(component == environment.biodiv2){  
			  // console.log(component);   
           	   this.synonymExtendedArray?.forEach(object =>{
	            //let synonymTags = '';
                /*console.log(object.type);
                console.log(object.queryTerm);
                console.log(object.URIs);
                console.log(object.synonymTags);*/
                object.URIs?.forEach(entry =>{
	                
					entry.synonyms.forEach(synonym =>{
		            
					console.log(synonym);
               		synonym = synonym.trim();

                    type = object.type.replace(/^\w/, (c) => c.toUpperCase());
		            let s0 = '^(<h>s?|<term>s?)'; //start of line/sentence				
	 				let s1 = '(<h>s?|<term>s?)$'; //end of line/sentence
				    let s2 = '(<span class="highlight-(text)?(title)?">(<h>s?|<term>s?)<\\/span>)'; //within spans
	                
					let s3 = '[^>\\w](<h>)[^<\\w]'; //within text
	                let pattern0 = s0.replace('<h>', synonym).replace('<term>', object.queryTerm.trim());
	 				let pattern1 = s1.replace('<h>', synonym).replace('<term>', object.queryTerm.trim());
				    let pattern2 = s2.replace('<h>', synonym).replace('<term>', object.queryTerm.trim());
				
	                const regex0 = new RegExp(pattern0, 'i');
		            const regex1 = new RegExp(pattern1, 'i');
	                const regex2 = new RegExp(pattern2, 'i');
	                //const regex3 = new RegExp(pattern3, 'gmi');
	                //console.log(regex1);
	               		let arr;
						if((arr = regex0.exec(txtNew)) !== null)
						{
							txtNew = txtNew.replaceAll(arr[1],'<div class="bio-div-tooltip">'
	                            + arr[1] + '<div class="tooltiptext"><div><b>Category: </b>' + type + '</div><br>' + object.synonymTags + '</div></div>');
							
						}
						if((arr = regex1.exec(txtNew)) !== null)
						{
							txtNew = txtNew.replaceAll(arr[1],'<div class="bio-div-tooltip">'
	                            + arr[1] + '<div class="tooltiptext"><div><b>Category: </b>' + type + '</div><br>' + object.synonymTags + '</div></div>');
							
							
						}
						while ((arr = regex2.exec(txtNew)) !== null) {
						  //console.log('match');
						  txtNew = txtNew.replaceAll(arr[4],'<div class="bio-div-tooltip">'
	                            + arr[4] + '<div class="tooltiptext"><div><b>Category: </b>' + type + '</div><br>' + object.synonymTags + '</div></div>');
						  
						}
						//doesn't work for 'bacteria' - neverending loop
						/*while ((arr = regex3.exec(txtNew)) !== null) {
						  //console.log('match');
						  txtNew = txtNew.replaceAll(arr[1],'<div class="bio-div-tooltip">'
	                            + arr[1] + '<div class="tooltiptext"><div><b>Category: ' + type + '</b></div><div><span><i>Synonyms:</i><span></div>' + synonymTags + '</div></div>');
							
						}*/
			   
				 }); 
			        
				});
	            
			});
			}

        //console.log(txtNew);	
        return txtNew;
    }


    getHit(item, param,highlighting,component): Hit {
        let title = item?.title;
        const hit = new Hit();
        
        hit.setTitle(title);
        hit.setCleanTitle(title);
        hit.setIdentifier(item?.docId);
        hit.setRank(item?.rank);
        hit.setDocumentText(item?.documentText);
        
        hit.setDocumentTextArray(item?.documentTextArray);
      
        hit.setTextHits(item?.hits);
        hit.setId(item?.docId);
        hit.setAuthor(item?.author);
        hit.setPubDate(item?.publicationDate);

        hit.setTitle(this.getTitle(item));
        //
        hit.setTitle(this.getHighlighting(highlighting,hit.getTitle(), 'highlight-title'));
        hit.setTitle(this.getAnnotations(hit.getTitle(),component));
        hit.setMetadatalink(item?.linkage);
        // take the doi as link for PANGAEA files
        if (this.startsWith(item?.filename, 'PANGAEA')) {
            hit.setTitleUrl(item?.docId);
        } else {
            hit.setTitleUrl(encodeURI(item?.linkage));
        }
        hit.setLongitude(item?.maxLongitude);
        hit.setLatitude(item?.minLatitude);
        hit.setTitleTooltip(this.getTitleTooltip(hit));
        // hit.setDatalink(source?.datalink);
        hit.setVat(false);


        hit.setCitation(this.getCitation(item));
        hit.setUpperLabels(this.getLabels(item));

        let description = [];

        // Parameter
        if (typeof item?.parameters !== 'undefined' && item?.parameters.length > 2) {
            let descriptionItem = new Description();
            descriptionItem.setTitle('Parameters:');
            let parameters = item?.parameters;
            parameters = parameters.replace('[', '');
            parameters = parameters.replace(']', '');
           
            descriptionItem.setCleanValue(parameters);
            //let par = this.getAnnotations(param, item?.parameters);
            //par = par.replace('[', '');
            //par = par.replace(']', '');
            let par = this.getHighlighting(highlighting,item?.parameters,'highlight-text');
            par = this.getAnnotations(par,component);
            descriptionItem.setValue(par);
            
            description.push(descriptionItem);
        }

        // Taxon
        if (typeof item?.taxon !== 'undefined' && item?.taxon.length > 2) {
            const descriptionItem = new Description();
            descriptionItem.setTitle('Taxon:');
            descriptionItem.setCleanValue(item?.taxon);
            //let taxon = this.getAnnotations(param, item?.taxon);
            let taxon = this.getHighlighting(highlighting,item?.taxon,'highlight-text');
            taxon = this.getAnnotations(taxon,component);
            descriptionItem.setValue(taxon);
            description.push(descriptionItem);
        }

        // Keywords
        if (typeof item?.keywords !== 'undefined' && item?.keywords.length > 2) {
            const descriptionItem = new Description();
            descriptionItem.setTitle('Keywords:');
            descriptionItem.setCleanValue(item?.keywords);
            //let keywords = this.getAnnotations(param, item?.keywords);
            //keywords = keywords.replace('[', '');
            //keywords = keywords.replace(']', '');
            let keywords = this.getHighlighting(highlighting,item?.keywords,'highlight-text');
            keywords = this.getAnnotations(keywords,component);
            descriptionItem.setValue(keywords);

            description.push(descriptionItem);
        }

        // Description
        if (item?.description !== 'undefined' && item?.description.length > 0) {
            const descriptionItem = new Description();
            descriptionItem.setTitle('Description:');
            descriptionItem.setCleanValue(item?.description);
            //let des = this.getAnnotations(param, item?.description);
            //let des = this.getHighlighting(highlighting,item?.description,'highlight-text');
			let des = this.getHighlighting(highlighting,item?.description,'highlight-text');
			des = this.getAnnotations(des,component);
			descriptionItem.setValue(des);

            description.push(descriptionItem);
        }

        // Relation
        /*if (item?.relatedDatasets !== 'undefined' && item?.relatedDatasets.length > 0) {
            const descriptionItem = new Description();
            descriptionItem.setTitle('Related datasets or publications:');
            const relatedDatasets = this.getAnnotations(param, item?.relatedDatasets);
            descriptionItem.setValue(relatedDatasets);
            description.push(descriptionItem);
        }*/

        
        hit.setDescription(description);

        let license = item?.access;

        if (license !== 'Access constraints: access rights needed') {
            if (!Array.isArray(license)) {
                license = [license];
            }
            const licenseArray = [];
            const allLicences = ['CC BY', 'CC BY-NC', 'CC BY-NC-ND', 'CC BY-NC-SA', 'CC BY-ND',
                'CC BY-SA', 'CC0', 'GPL', 'All rights reserved'];
            // let pattern = /(CC BY-NC-ND)|(CC BY-NC-SA)|(CC BY-ND)|(CC BY-NC)|(CC BY-SA)|(CC BY)|(CC0)|(GPL)|(All rights reserved)/;
            license.forEach((l, i) => {
                if (l === 'CC BY-SA 3.0' || l === 'CC BY-SA 4.0' || l === 'CC-BY-SA') {
                    licenseArray.push('CC BY-SA');
                } else if (l === 'CC BY 4.0') {
                    licenseArray.push('CC BY');
                } else if (l === 'License for associated multimedia objects: CC BY-SA 4.0'
                    || l === 'License for associated multimedia objects: CC-BY-SA 3.0') {
                    licenseArray.push('CC BY-SA');
                } else if (l === 'CC-BY-3.0: Creative Commons Attribution 3.0 Unported') {
                    licenseArray.push('CC BY');
                } else {
                    licenseArray.push('Other');
                    return;
                }


            });

            hit.setLicence(licenseArray);
        }

        const linkage = new Linkage();
        if (item?.linkage !== 'undefined') {
            linkage.setMetadata(encodeURI(item?.metadata));
        }
        /*if (item?.data !== 'undefined') {
            linkage.setData(encodeURI(item?.data));
        }*/


        /* if (element.attributes.type === 'multimedia') {
             const text = element.elements[0].text;
             const differentTypes = [['.mp3', 'sound'], ['.mp4', 'video'],
                 ['.jpg', 'picture'], ['.tiff', 'picture'],
                 ['.png', 'picture'], ['.wav', 'sound']];
             differentTypes.forEach(types => {
                 if (text.includes(types[0])) {
                     const multimediaObj = {
                         type: types[1],
                         url: text
                     };
                     multimediaObjs.push(multimediaObj);
                 }
             });
             linkage.setMultimedia(multimediaObjs);
         }*/


        hit.setLinkage(linkage);

        return hit;
    }

    // maps labels
    getLabels(item): UpperLabel[] {
        const upperLabels: UpperLabel[] = [];

// if the citation date exist, a blue label will be created
        if (item?.publicationDate) {
            const year = new UpperLabel();
            year.setInnerInfo(item?.publicationDate?.substring(0, 4));
            year.setTooltip('Publication year');
            year.setColorClass('bg-label-blue');
            upperLabels.push(year);
        }
// if the dataset is open access, a green label will be created
        const accessItem = item?.access;
        if (accessItem !== 'Access constraints: access rights needed') {
            const access = new UpperLabel();
            access.setInnerInfo('Open Access');
            access.setTooltip('This dataset is open access. You can use primary data and metadata.');
            access.setColorClass('bg-label-green');
            upperLabels.push(access);
        }
// the label related to the datacenter with the golden red color will be created
// it contains the name of the datacenter
        const dataCenter = new UpperLabel();
        /*as the name of the datacenter which is provided in the json result is a long string and no short version
        was provided, the short version was extracted by some if statements*/
        dataCenter.setInnerInfo(item?.dataCenter?.split(' ').pop());
        if (dataCenter.getInnerInfo() === 'Science') {
            dataCenter.setInnerInfo('PANGAEA');
        }
        if (dataCenter.getInnerInfo() === 'Archive') {
            dataCenter.setInnerInfo('ENA');
        }
        switch (dataCenter.getInnerInfo()) {
            case 'SNSB':
                dataCenter.setTooltip(BiodivPreprocessDataService.datacenterTooltips.SNSB);
                break;
            case 'SGN':
                dataCenter.setTooltip(BiodivPreprocessDataService.datacenterTooltips.SGN);
                break;
            case 'BGBM':
                dataCenter.setTooltip(BiodivPreprocessDataService.datacenterTooltips.BGBM);
                break;
            case 'MfN':
                dataCenter.setTooltip(BiodivPreprocessDataService.datacenterTooltips.MfN);
                break;
            case 'ZFMK':
                dataCenter.setTooltip(BiodivPreprocessDataService.datacenterTooltips.ZFMK);
                break;
            case 'SMNS':
                dataCenter.setTooltip(BiodivPreprocessDataService.datacenterTooltips.SMNS);
                break;
            case 'PANGAEA':
                dataCenter.setTooltip(BiodivPreprocessDataService.datacenterTooltips.PANGAEA);
                break;
            case 'DSMZ':
                dataCenter.setTooltip(BiodivPreprocessDataService.datacenterTooltips.DSMZ);
                break;
            case 'Gatersleben':
                dataCenter.setTooltip(BiodivPreprocessDataService.datacenterTooltips.Gatersleben);
                break;
            case 'ENA':
                dataCenter.setTooltip(BiodivPreprocessDataService.datacenterTooltips.ENA);
                break;
            default:
                dataCenter.setTooltip('Publisher');
        }
        dataCenter.setColorClass('bg-goldenrod');
        upperLabels.push(dataCenter);

        return upperLabels;
    }

    getTitle(item) {
        let author = item?.author;
        let title = item?.title;
        const pubDate = item?.publicationDate;


        if (author !== undefined && author.length > 2) {
            author = author.replace('[', '');
            author = author.replace(']', '');

        }

        if (author.length > 2 && title !== undefined && pubDate !== undefined) {
            title =  author + ' (' + pubDate.substring(0, 4) + '): ' + title;
        } else if (author.length > 2 && title !== undefined) {
            title =  author + ':' + title;
        }

        

        return title;

    }

    startsWith(str, word): boolean {
        return str?.lastIndexOf(word, 0) === 0;
    }
    
    getHighlighting(highlighting, text, className){
	  //console.log('Highlighting:'+highlighting);
      //console.log(text);
      
      let newText = text.replace('[', '').replace(']', '');
     
	  if(highlighting !== undefined && highlighting.length >0){
	    
      
	        
            for (const h of highlighting){
	            let s0 = '^(<h>)'; //start of line/sentence				
 				let s1 = '(<h>)$'; //end of line/sentence
			    //let s2 = '(<span class="highlighting-(text)?(title)?">(<h>)<\\/span>)'; //within spans
                
				let s3 = '[^>\\w](<h>)[^<\\w]'; //within text, e.g., species on 'grassland' found
				let term;
				//term = h.replace(/[()\/\.\n]/g, ' ');
				//.replace('(', '\\(').replace('/', '\\/').replace('.', '\\.').replace('\n', '\\n').replace('&gt;','>').replace('&lt;','<').replace('µ', '&micro;');
				
		        term = h.replace(/\)/g, '\\)').replace(/\(/g, '\\(').replace(/\//g, '\\/').replace(/\./g, '\\.');
//.replace(/\n/g, '\\n').replace(/µ/g, '&micro;');
		
				//console.log(term);
                let pattern0 = s0.replace('<h>', term);
 				let pattern1 = s1.replace('<h>', term);
			    //let pattern2 = s2.replace('<h>', term);
			    let pattern3 = s3.replace('<h>', term);
                const regex0 = new RegExp(pattern0, 'i');
	            const regex1 = new RegExp(pattern1, 'i');
                //const regex2 = new RegExp(pattern2, 'i');
                const regex3 = new RegExp(pattern3, 'i');
                //console.log(regex0);
				//console.log(regex1);
				//console.log(regex3);
                let arr;

                try{
					if((arr = regex0.exec(newText)) !== null)
					{
						newText = newText.replaceAll(arr[1],'<span class="'+ className+'">'+arr[1]+'</span>');
						
					}
					if((arr = regex1.exec(newText)) !== null)
					{
						newText = newText.replaceAll(arr[1],'<span class="'+ className+'">'+arr[1]+'</span>');
						
					}
					/*while ((arr = regex2.exec(newText)) !== null) {
					  
					  newText = newText.replaceAll(arr[1],'<span class="'+ className+'">'+arr[1]+'</span>');
					}*/
					while ((arr = regex3.exec(newText)) !== null) {
					  
					  newText = newText.replaceAll(arr[1],'<span class="'+ className+'">'+arr[1]+'</span>');
					}
				 }catch(e){
					 console.log(h);
				     console.log(e);
                     return newText;
			      }
			};
			
			
        }
   
      return newText; 
    }

    // maps the citation data
    getCitation(item): Citation {
        const citation = new Citation();

        citation.setTitle(item.title);
        citation.setDOI(item.docId);
        citation.setCreator(item.author);
        citation.setDOI(item.docId);
        citation.setDate(item.publicationDate);

        citation.setDataCenter(item.dataCenter);
        citation.setSource(item?.citation);

        return citation;
    }

    getTitleTooltip(hit: Hit): string {
        if (hit.getLatitude !== undefined && hit.getLongitude() !== undefined) {
            return 'min latitude: ' + hit.getLatitude() + ', max longitude: ' + hit.getLongitude();
        } else {
            return this.noCoordinates;
        }
    }


    addSynonymsToMessageService(annotationsAndSynonyms: any):any[] {

        let synonymExtendedArray = [];
        annotationsAndSynonyms?.forEach(annotation => {
            let instances: AnnotationInstance<any>[];

            instances = annotation.instances;
            let synonymArray = [];
       
            let URIsynonyms = [];
            let text = '';
            let synonymTags = ''; //for displaying the synonyms in biodiv2

            instances.forEach(instance => {

                //if(instance.getURI() !== undefined)
                let synonyms = instance.synonyms;
                
                text = instance.content;
              
                synonyms.forEach(synonym => {
                    if (synonym.toLowerCase() !== instance.content.toLowerCase() && synonymArray.indexOf(synonym) < 0) {
                        synonymArray.push(' '+synonym);
            
                    }
				                       
                });
                
                if (instance instanceof Organism || instance instanceof Environment || instance instanceof Material || instance instanceof Process || instance instanceof Quality ){
					let synonymsPerURI = [];
					let URIReplaced = this.utilityService.replaceURI(instance.URI);
                    let terminology = this.utilityService.splitURI(instance.URI)[0];
                    let ID = this.utilityService.splitURI(instance.URI)[1];
                    synonymTags = synonymTags + '<div><i>Terminology:</i> <a href="'+URIReplaced+'" target="_blank" + title="Link to Terminology: '+terminology+', ID: '+ID+'">' + terminology+'_'+ID + '</a></div><div><span><i>Synonyms:</i></span></div>';
					synonyms.forEach(synonym => {
	                    if (synonym.toLowerCase() !== instance.content.toLowerCase() && synonymsPerURI.indexOf(synonym) < 0) {
	                        synonymsPerURI.push(' '+synonym);
	                    }
                    
                        let tag;
			            let synonymU = synonym.replace(/^\w/, (c) => c.toUpperCase());
			            if(instance instanceof Organism){
						  tag = '<div><span>' + synonymU + '</span></div>';
				        }
				        else{
							tag = '<div><span>' + synonym + '</span></div>';
						}
			        	synonymTags = synonymTags + tag;
                    });
                    synonymTags = synonymTags + '<br>';
					URIsynonyms.push({'URI':URIReplaced,'synonyms':synonymsPerURI, 'ID':ID,'terminology':terminology});
			    }
                

            });
            
            this.messageService.addSimpleQueryExplanation({'queryTerm': text, 'synonyms': synonymArray.toString()});
            this.messageService.addExtendedQueryExplanation({'queryTerm':text,'URIs': URIsynonyms,'synonyms':synonymArray.toString()})
            //add text to synonymArray for highlighting
			
			synonymExtendedArray.push({'queryTerm':text,'type':annotation.type,'URIs': URIsynonyms,'synonymTags':synonymTags});
          
        });
 
   return  synonymExtendedArray;
}
 
   getSynonyms(param:any): any{
	
	let objectArray = [];
	let objectKeys = [];
    //console.log(txt);
    let synonymTags = '';
	
	param?.forEach(annotation => {
            
            let object = {};
            let synonymArray = [];
            let type =  annotation.type.replace(/^\w/, (c) => c.toUpperCase());
            const instances = annotation.instances;
            let text;
            
            instances.forEach(instance => {

                text = instance.content; //text is the same for several instances
                
                if (this.annotationTypes.indexOf(annotation.type.toLowerCase()) > -1) {

                    let synonyms = instance.synonyms;
                    synonyms.forEach(synonym => {
                        if (synonymArray.indexOf(synonym.toLowerCase()) <0){
                            synonymArray.push(synonym.toLowerCase());
                            //const tag = '<div><span>' + synonym + '</span></div>';
                            //synonymTags = synonymTags + tag;
                       }
                    });

                }

                
            });
            //synonyms for a particular type not yet added
            if(objectKeys.indexOf(text) <0){
	            objectKeys.push(text);
                object['term'] = text;
           		object['type'] = annotation.type;
            	
            	object['synonyms'] = synonymArray;
                objectArray.push(object);
            }else{
				objectArray.forEach(object =>{
					if(object.term == text){
						if(object.type !== annotation.type){
							
							object.type = object.type + ', '+	annotation.type;
						}
						synonymArray.forEach(synonym =>{
								object.synonyms.push(synonym);
						});
					}
				});
			}
           
            
   });
   
    objectArray.forEach(object =>{  
	    let synonymTags = '';  
        object.synonyms?.forEach(synonym =>{
            let tag;
            let synonymU = synonym.replace(/^\w/, (c) => c.toUpperCase());
            if(object.type == 'organism'){
			  tag = '<div><span>' + synonymU + '</span></div>';
	        }
	        else{
				tag = '<div><span>' + synonym + '</span></div>';
			}
        	synonymTags = synonymTags + tag;
        });
        object.synonymTags = synonymTags;
   });
   return objectArray; 
  } 

   

 /* replaceURI(URI){
	   //let URIarray = URI.split(/\//g);
	   //let graphName = URIarray[URIarray.length-1].split('_');
	   let graphName = this.splitURI(URI);
	   console.log(graphName);
	   let bioportal = "https://bioportal.bioontology.org/ontologies/<graphName>?p=classes&conceptid=";
	   bioportal = bioportal.replace("<graphName>",graphName[0].toUpperCase());
	   
	   let newURI;
	   if(graphName[0].toUpperCase() === 'NCBITAXON')
		   newURI = "http://purl.bioontology.org/ontology/"+graphName[0].toUpperCase()+'/'+graphName[1];
	   else
		   newURI = URI;
	   let encode= encodeURIComponent(newURI);
	
	   return bioportal +encode;	
 }

 splitURI(URI){
	let URIarray = URI.split(/\//g);
	let graphName = URIarray[URIarray.length-1].split('_');
	
	return graphName;
 }*/

}
