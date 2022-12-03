import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UtilityService {


   htmlEntities(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }


  capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }

replaceURI(URI){
	   //let URIarray = URI.split(/\//g);
	   //let graphName = URIarray[URIarray.length-1].split('_');
	   let graphName = this.splitURI(URI);
	   //console.log(graphName);
	   let bioportal = "https://bioportal.bioontology.org/ontologies/<graphName>?p=classes&conceptid=";
	   bioportal = bioportal.replace("<graphName>",graphName[0].toUpperCase());
	   
	   let newURI;
	   if(graphName[0].toUpperCase() === 'NCBITAXON')
		   //newURI = "http://purl.bioontology.org/ontology/"+graphName[0].toUpperCase()+'/'+graphName[1];
		   return URI;
	   else
		   newURI = URI;
	   let encode= encodeURIComponent(newURI);
	
	   return bioportal +encode;	
 }

 splitURI(URI){
	let URIarray = URI.split(/\//g);
	let graphName = URIarray[URIarray.length-1].split('_');
	
	return graphName;
 }

}
