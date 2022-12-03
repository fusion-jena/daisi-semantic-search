import {Injectable} from '@angular/core';
import {Result} from '../../models/result/result';
import {Hit} from '../../models/result/hit';
import {Citation} from '../../models/result/citation';
import {Description} from '../../models/result/description';
import {Linkage} from '../../models/result/linkage';
import {UpperLabel} from '../../models/result/upperLabel';
import {environment} from '../../../environments/environment';
import {MessageService} from '../local/message.service';
import { AnnotationInstance } from 'src/app/models/annotations/AnnotationInstance';

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
    
    constructor(private messageService: MessageService) {
	   
    }

    getResult(jsonObject, param): Result {
        //console.log(param);
        const result = new Result();
        const hits: Hit[] = this.getHits(jsonObject, param);
        result.setHits(hits);
        // tslint:disable-next-line:radix
        result.setTotalNumber(parseInt(jsonObject?.docsCount));
        //sort highlighting array length
        const highlightingDesc = jsonObject?.highlighting.sort((a,b) => b.length - a.length);
        result.setHighlighting(highlightingDesc);
        //result.setSemanticKeys(jsonObject?.highlighting);
        this.addSynonymsToMessageService(param);
        result.setAnnotationText(this.annotationText);
        return result;
    }

    getHits(jsonObject, param): Hit[] {
        const hits: Hit[] = [];
        const hitsOfObject = jsonObject.hits;
        const highlightingDesc = jsonObject?.highlighting.sort((a,b) => b.length - a.length);
        hitsOfObject.forEach(item => {
            hits.push(this.getHit(item, param, jsonObject?.highlighting));
        });
        return hits;
    }

    getAnnotations(param, txt): string {
        this.annotationText = this.annotationText + txt;
        //console.log('txt: '+txt);
        let txtNew = txt;

        param?.forEach(annotation => {
            //console.log('annotation: '+annotation.type);
            let synonymArray = [];

            let synonymTags = '';
            const instances = annotation.instances;
            let text;
            instances.forEach(instance => {

                text = instance.content; //text is the same for several instances
                //console.log('text:'+text);

                if (this.annotationTypes.indexOf(annotation.type) > -1) {

                    let synonyms = instance.synonyms;
                    synonyms.forEach(synonym => {
                        if (synonym.toLowerCase() !== text.toLowerCase()) {
                            synonymArray.push(synonym.toLowerCase());
                            const tag = '<div><span>' + synonym + '</span></div>';
                            synonymTags = synonymTags + tag;
                        }
                    });

                }

                synonymArray.push(text.toLowerCase());
            });
            if (synonymTags != '') {
                /*let t = " (<text>)s?,?";
                t = t.replace('<text>',text);
                let p = new RegExp(t,'g');
                   txtNew = txt.replaceAll(p, '<div class="bio-div-tooltip">'
                + text + '<div class="tooltiptext"><div><b>Category: ' + annotation.type + '</b></div><div><span><i>Synonyms:</i><span></div><div>' + synonymTags + '</div></div></div>');
                */
                synonymArray.forEach(synonym => {
                    //console.log(synonym);
                    let s = " "+synonym+"[s, ]";
                    //let s = "(<synonym>s?),?\.?\??";
                    //let s = '[\\s,?\\.(]?(<synonym>)[\\s,?\\.)\\w]+'; // replace it only in text not between <span></span>
                    let pattern = s.replace('<synonym>', synonym);
                    //console.log(pattern);
                    pattern = pattern.replace('[', ''); // cases like water: [OH2] - remove brackets, otherwise it is treated as array in a pattern
                    pattern = pattern.replace(']', '');
                    const regex = new RegExp(pattern, 'g');
                    let arr;
                    
                    while ((arr = regex.exec(text)) !== null) {

                        txtNew = txtNew.replaceAll(arr[1], '<div class="bio-div-tooltip"> '
                            + arr[1] + '&nbsp;<div class="tooltiptext"><div><b>Category: ' + annotation.type + '</b></div><div><span><i>Synonyms:</i><span></div><div>' + synonymTags + '</div></div></div>');
                    }
                });
            } else {
               // txtNew = txtNew.replaceAll(text, '<div class="bio-div-tooltip"> '
                 //   + text + '<div class="tooltiptext"><div><b>Category: ' + annotation.type + '</b></div></div></div>');

            }
        });


        return txtNew;
    }

    getHit(item, param,highlighting): Hit {
        let title = item?.title;
        title = this.getAnnotations(param, title);
        const hit = new Hit();
        hit.setIdentifier(item?.docId);
        hit.setRank(item?.rank);
        hit.setDocumentText(item?.documentText);
        
        hit.setDocumentTextArray(item?.documentTextArray);
      
        hit.setTextHits(item?.hits);
        hit.setId(item?.docId);
        hit.setAuthor(item?.author);
        hit.setPubDate(item?.publicationDate);
        hit.setTitle(this.getTitle(item));
        hit.setTitle(this.getHighlighting(highlighting,title, 'highlight-title'));
        //hit.setTitle(this.getAnnotations(param, hit.getTitle()));
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
            //let par = this.getAnnotations(param, item?.parameters);
            //par = par.replace('[', '');
            //par = par.replace(']', '');
            let par = this.getHighlighting(highlighting,item?.parameters,'highlight-text');
            descriptionItem.setValue(par);
            
            description.push(descriptionItem);
        }

        // Taxon
        if (typeof item?.taxon !== 'undefined' && item?.taxon.length > 2) {
            const descriptionItem = new Description();
            descriptionItem.setTitle('Taxon:');
            //let taxon = this.getAnnotations(param, item?.taxon);
            let taxon = this.getHighlighting(highlighting,item?.taxon,'highlight-text');
            descriptionItem.setValue(taxon);
            description.push(descriptionItem);
        }

        // Keywords
        if (typeof item?.keywords !== 'undefined' && item?.keywords.length > 2) {
            const descriptionItem = new Description();
            descriptionItem.setTitle('Keywords:');
            //let keywords = this.getAnnotations(param, item?.keywords);
            //keywords = keywords.replace('[', '');
            //keywords = keywords.replace(']', '');
            let keywords = this.getHighlighting(highlighting,item?.keywords,'highlight-text');
            descriptionItem.setValue(keywords);

            description.push(descriptionItem);
        }

        // Description
        if (item?.description !== 'undefined' && item?.description.length > 0) {
            const descriptionItem = new Description();
            descriptionItem.setTitle('Description:');
            //let des = this.getAnnotations(param, item?.description);
            let des = this.getHighlighting(highlighting,item?.description,'highlight-text');
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
        dataCenter.setInnerInfo(item?.dataCenter.split(' ').pop());
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
        return str.lastIndexOf(word, 0) === 0;
    }
    
    getHighlighting(highlighting, text, className){
	  console.log(highlighting);
      console.log(text);
      let newText = text;
     
	  if(highlighting !== undefined && highlighting.length >0){
	    
      
	        let matchFound = false;
            for (const h of highlighting){
	            let s0 = '^(<h>)'; //start of line/sentence				
 				let s1 = '(<h>)$'; //end of line/sentence
				let s2 = '[^>\\w](<h>)[^<\\w]'; //within text
                let pattern0 = s0.replace('<h>', h);
 				let pattern1 = s1.replace('<h>', h);
			    let pattern2 = s2.replace('<h>', h);
                const regex0 = new RegExp(pattern0, 'i');
	            const regex1 = new RegExp(pattern1, 'i');
                const regex2 = new RegExp(pattern2, 'i');
               		let arr;
					if((arr = regex0.exec(newText)) !== null)
					{
						newText = newText.replaceAll(arr[1],'<span class="'+ className+'">'+arr[1]+'</span>');
						
					}
					if((arr = regex1.exec(newText)) !== null)
					{
						newText = newText.replaceAll(arr[1],'<span class="'+ className+'">'+arr[1]+'</span>');
						
					}
					while ((arr = regex2.exec(newText)) !== null) {
					  
					  newText = newText.replaceAll(arr[1],'<span class="'+ className+'">'+arr[1]+'</span>');
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
     

 
    addSynonymsToMessageService(annotationsAndSynonyms: any) {
	    
           //let addedTerms = [];
		   annotationsAndSynonyms?.forEach(annotation => {
	         let instances: AnnotationInstance<any>[];

            instances = annotation.instances;
            let synonymArray = [];
			let text = '';
            
            instances.forEach(instance => {

	            //if(instance.getURI() !== undefined)
				let synonyms = instance.synonyms;
				text = instance.content
	 			synonyms.forEach(synonym =>{
	                    if (synonym.toLowerCase() !== instance.content.toLowerCase() && synonymArray.indexOf(synonym) < 0){
		                 	synonymArray.push(synonym + ' ');
                        }
                });


				//this.messageService.addExtendedQueryExplanation({'queryTerm':instance.content,'URI':uri,'synonyms':synonymArray.toString()})

		   });

           this.messageService.addSimpleQueryExplanation({'queryTerm':text,'synonyms':synonymArray.toString()})

          
        });
}
 

   

}
