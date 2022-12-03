var express = require('express');
var app = express();
var router = require('express').Router();
var bodyParser = require('body-parser').json();
const axios = require('axios'); //http calls


var INDEX_URL='https://semsearch.fmi.uni-jena.de/mimir/aadd28b5-e619-4c5f-8b8d-f9d9d46d945b'
  /** postquery - send a query to Mimir, append the query String
   * returns the queryID
   * ! (even if the URL is called 'postquery' it is a GET!)
   **/
  var POSTQUERY_URL= INDEX_URL + '/search/postQuery?queryString=';
  // documentsCount
  // params: queryID
  // returns the number of hits
  var DOCUMENTSCOUNT_URL= INDEX_URL + '/search/documentsCount?queryId=';  


  // documentMetadata
  // params: queryID, rank, fields (additional fields, e.g., date)
  // returns the document metadata (URL, title)
  var DOCUMENTMETADATA_URL= INDEX_URL + '/search/documentMetadata?queryId=';

  // renderDocument
  // params:queryId, rank
  var RENDERDOCUMENT_URL= INDEX_URL + '/search/renderDocument?queryId=';

  // documentHits
  // params:queryId, rank
  var DOCUMENT_HITS_URL= INDEX_URL + '/search/documentHits?queryId=';

  // documentText
  // params:queryId, rank,
  // params: termPosition? (optional, if termPosition is omitted, position of first token is returned)
  // params: length? (optional, if length is omitted, all document tokens will be returned)
  var DOCUMENT_TEXT_URL= INDEX_URL + '/search/documentText?queryId=';

  
  /********************** Mimir code *******************/
  /**
  * POST /biodiv/search
  * Search for a term in the library
  */
  /**
   * @swagger
   * /biodiv/search:
   *   post:
   *     description: Returns search results
   *     tags: [Search Biodiv - Mimir index]
   *     summary: returns a search result
   *     consumes:
   *       - application/json
   *     parameters:
   *       - in: body
   *         name: queryString
   *         description: the query as string
   *         schema:
   *            type: object
   *            required:
   *              - queryString
   *            properties:
   *              queryString:
   *                type: string
   *                example: fungi
   *     responses:
   *       201:
   *         description: A array of objects matching the query.
   *         schema:
   *           type: object
   *           properties:
   *              docsCount:
   *                type: integer
   *                description: the number of datasets matching the query
   *              hits:
   *                type: array
   *                description: array with dataset objects
   *                items: 
   *                  type: object
   */
router.post('/search', (req, res)=>{
	var queryId = null;
	var docsCount = 0;
	let size = 10; // 10 by default
	let from = 0; // 0 by default
	console.log(req.body.queryString)
	let axiosArray = [];
	let documents = [];
	let highlighting = [];	
		if(req.body.from !== 'undefined' && req.body.from >= 0) {
			from = req.body.from
		}
		
		if(req.body.size !== 'undefined' && req.body.size >= 0) {
			size = req.body.size
		}
	    
		//get the documentId first (kind of session ID)
		return axios.get(POSTQUERY_URL + encodeURIComponent(req.body.queryString),{responseType: 'text'})
		.then(resPostUrl =>{
			console.log(`Status: ${resPostUrl.status}`);
			console.log('Body: ', resPostUrl.data);

			queryId = getQueryIdFromXML(resPostUrl.data);

		})
		//then wait 2 sec (sometimes large result sets need more time to come back)
		.then(sleeper(2000))
		//then determine how many documents are found
		.then( response =>{
			 
			return axios.get(DOCUMENTSCOUNT_URL + queryId)
				.catch((err)=> {
					console.log(err);
				
					return res.status(500).json({
					msg:'Error', err
					});
				});
		})
		//get the hits for all documents found
		.then(resGetDocUrl =>{
			console.log(`Status: ${resGetDocUrl.status}`);
			console.log('Body: ', resGetDocUrl.data);
							
			docsCount = getDocumentsCountFromXML(resGetDocUrl.data);
			
	         
////// HITS are currently not used	- don't fetch it, but keep the code ///////////////////	
			 let end = from + size;
				  
			  if(end > docsCount){
				  end = docsCount;
			  }
			  console.log('from: '+from);
			  //console.log('start: '+start);
			  console.log('end: '+end);
			  
		    for ( i = from; i < end; i++) {	
				  axiosArray.push(axios.get(DOCUMENT_HITS_URL + queryId + "&rank=" + i))
			}
			 //collect all calls first and then send it in a bunch
			 //axios will handle them in parallel and will only continue when all calls are back 
			 return axios.all(axiosArray)
			  .catch((err)=> {
					console.log(err);
					return res.status(500).json({
						msg:'Error', err
					});
				});
		 
	
		})
		//per response create a document, get the hits and push the docs in array
		//creates calls for all documents to get the documentTitles per document
		.then(axios.spread((...responses) => {
				  
				  for ( i = 0; i < axiosArray.length; i++) {
					  //console.log('Success:'+responses[i].data)
					  //console.log('submitted all axios calls');
					  const doc = new document(i);
					  //console.log(responses[i].data);
					  doc.hits = getHitsFromXML(responses[i].data);
					  //console.log('hits:'+doc.hits.length);
					  documents.push(doc);
				  }
				  
				  axiosArray = [];
				 
				  let end = from + size;
				  
				  if(end > docsCount){
					  end = docsCount;
				  }
				
				  for ( i = from; i < end; i++) {	
				  axiosArray.push(axios.get(DOCUMENTMETADATA_URL + queryId + "&rank=" + i+"&fieldNames=title,citation,description,docId,dataCenter,taxon,parameters,minLongitude,maxLongitude,minLatitude,maxLatitude,dataType,access,collectionStartDate,collectionEndDate,publicationDate,author,contributor,keywords,relatedDatasets,linkage,additionalContent"))
				 }
				 //collect all calls first and then send it in a bunch
				 //axios will handle them in parallel and will only continue when all calls are back 
				 return axios.all(axiosArray)
				  .catch((err)=> {
						console.log(err);
						return res.status(500).json({
							msg:'Error', err
						});
					});
				
		}))
		.then(axios.spread((...responses) => {
				  
				  for ( i = 0; i < axiosArray.length; i++) {
					  //console.log('Success:'+responses[i].data)
					  //console.log('submitted all axios calls');
					  const doc = documents[i];
					  //const doc = new document(i);
					  doc.rank = from +i;
					  doc.filename = getFileNameFromXML(responses[i].data);
					  doc.title = getTitleFromXML(responses[i].data);
					  doc.citation = getCitationFromXML(responses[i].data);
					  doc.description = getDescriptionFromXML(responses[i].data);
					  doc.docId = getDocIdFromXML(responses[i].data);
					  doc.dataCenter = getDataCenterFromXML(responses[i].data);
					  doc.taxon = getTaxonFromXML(responses[i].data);
					  doc.parameters = getParametersFromXML(responses[i].data);
					  doc.minLongitude = getMinLongitudeFromXML(responses[i].data);
					  doc.maxLongitude = getMaxLongitudeFromXML(responses[i].data);
					  doc.minLatitude = getMinLatitudeFromXML(responses[i].data);
					  doc.maxLatitude = getMaxLatitudeFromXML(responses[i].data);
					  doc.dataType = getDataTypeFromXML(responses[i].data);					  
					  doc.access = getAccessFromXML(responses[i].data);
					  doc.collectionStartDate = getCollectionStartDateFromXML(responses[i].data);
					  doc.collectionEndDate = getCollectionEndDateFromXML(responses[i].data);
					  doc.publicationDate = getPublicationDateFromXML(responses[i].data);
					  doc.author = getAuthorFromXML(responses[i].data);
					  doc.contributor = getContributorFromXML(responses[i].data);
					  doc.keywords = getKeywordsFromXML(responses[i].data);  
					  doc.relatedDatasets = getRelatedDatasetsFromXML(responses[i].data);
					  doc.linkage = getLinkageFromXML(responses[i].data);
					  doc.additionalContent = getAdditionalContentFromXML(responses[i].data);
					  

				  }
				  
	
				  axiosArray = [];
				 let end = from + size;
				  
				  if(end > docsCount){
					  end = docsCount;
				  }
				  
				  for ( i = from; i < end; i++) {	
				  axiosArray.push(axios.get(DOCUMENT_TEXT_URL + queryId + "&rank=" + i))
				 }
				 //collect all calls first and then send it in a bunch
				 //axios will handle them in parallel and will only continue when all calls are back 
				 return axios.all(axiosArray)
				  .catch((err)=> {
						console.log(err);
						return res.status(500).json({
							msg:'Error', err
						});
					});
				  
		}))
		.then(axios.spread((...responses) => {
				  
				  const docTextArray = [];
				  for ( i = 0; i < axiosArray.length; i++) {
					  //console.log('Success:'+responses[i].data)
					  //console.log('submitted all axios calls');
					  const doc = documents[i];
					  // get the surrounding text snippet of a hit
					  const array = getDocumentTextFromXML(responses[i].data);
					  

					  //get the text(hit) highlighting
					  let termPos =  doc.getTermPosOfHits();
					  //console.log('termPOs:'+termPos)
					  const high = getHighlightingFromXML(responses[i].data, doc.hits)
					  
                      
					  // only if length > 0, the surrounding text has been found,
					 // push it to the docTextArray that collects all tokens to be shown
					 if (array.length > 0) {
						 array.forEach(t => {
							 docTextArray.push(t);
						 });
					 }
					  
					  
					  // only if length > 0, the text for a hit has been found,
                      // push it to the highlighting array that collects all tokens to be shown
                      if (high.length > 0) {
                          high.forEach(t => {
							  if(highlighting.indexOf(t)<0){
                                highlighting.push(t);
							  }
                          });
                      }

					  doc.documentTextArray.push(docTextArray);
					  //documents.push(doc);
				  }
				  

				  	let finalDocs = [];
					let docIds = [];
				  //sort documents by rank
				  documents = documents.sort(function(a, b){return a.rank - b.rank});
				  //console.log('doclength: '+ documents.length);
				  for(var i=0; i<documents.length; i++){
					  
					  let doc = {
						'rank': documents[i].rank,
						'filename':documents[i].filename,
						'title':documents[i].title,
						'citation': documents[i].citation,
						'description':documents[i].description,
						'docId': documents[i].docId,
						'dataCenter':documents[i].dataCenter,
						'parameters': documents[i].parameters,
						'taxon': documents[i].taxon,
						'minLongitude': documents[i].minLongitude,
						'maxLongitude': documents[i].maxLongitude,
						'minLatitude': documents[i].minLatitude,
						'maxLatitude': documents[i].maxLatitude,
						'dataType': documents[i].dataType,
						'access':documents[i].access,
						'collectionStartDate': documents[i].collectionStartDate,
						'collectionEndDate': documents[i].collectionEndDate,
						'publicationDate':documents[i].publicationDate,
						'author':documents[i].author,
						'contributor':documents[i].contributor,
						'keywords': documents[i].keywords,
						'relatedDatasets': documents[i].relatedDatasets,
						'linkage': documents[i].linkage,
						'additionalContent': documents[i].additionalContent,
						'documentTextArray':documents[i].documentTextArray,
						//'highlighting': documents[i].highlighting,
						'hits': documents[i].hits
		
						
					   };

					  
					  finalDocs.push(doc);
					  docIds.push({'id':documents[i].docId,'rank': documents[i].rank});
				  }
				  
				  console.log("highlighting: "+highlighting);
				  let finalObject = {'docsCount':docsCount,'hits':finalDocs,'highlighting':highlighting,'docIds':docIds};
				  //console.log("documents: "+documents.length)
				  res.set('Content-Type', 'application/json');
				  res.status(200).send(finalObject);
		}))
	    .catch((err)=> {
		  console.log(err);
		
		  return res.status(500).json({
		  msg:'Error', err
		  });
	    });
			
		

	})	

  

    

function getQueryIdFromXML(xml){

      if (xml === undefined || xml === null) {
         return '';
      } else {
          if (xml.match(/[0-9,A-Z,a-z,-]{36}/)) {
          const queryId = xml.match(/[0-9,A-Z,a-z,-]{36}/);

          console.log('queryId: ' + queryId.toString());
          return queryId.toString();
          }else {
              console.log(xml);
          }
      }
      return null;

  }

function getDocumentsCountFromXML(xml) {

      if (xml === undefined || xml === null) {
         return '';
      } else {
          if (xml.match(/<value>[0-9-]+<\/value>/)) {
              const temp = xml.match(/<value>[0-9-]+<\/value>/);
              const documentsCount = temp.toString().match(/[0-9]+/);

          console.log('docsCount: ' + documentsCount.toString());
          return documentsCount.toString();

          }
      }
      return null;

  }
  
function getHitsFromXML(xml){

      // console.log(xml);
      var hits = [];

      if (xml === undefined || xml === null) {
              console.log ('getHitsFromXML: xml is null');
      } else {
                  if (xml.match(/<hits>.+<\/hits>/)) {

                      const temp = xml.match(/<hits>.+<\/hits>/);

                      /**
                       * hitsArray[0] - full string of characters matched
                       * hitsArray[1] - first substring match: (<hit ... />)
                       * hitsArray[2] - second substring match: (documentId='[0-9]+')
                       * hitsArray[3] - third substring match: (termPosition='[0-9]+')
                       * hitsArray[4] - fourth substring match: (length='[0-9]+')
                       */
                      const regexHit = /(<hit\s(documentId='[0-9]+')\s(termPosition='[0-9]+')\s(length='[0-9]+')\/>)/g;
                      let hitsArray = [];

                      // console.log(temp);
                      while ((hitsArray = regexHit.exec(temp)) !== null) {
                          //const hit = new hit();
                          //hit.documentId = hitsArray[2].match(/[0-9]+/g);
                          //hit.termPosition = hitsArray[3].match(/[0-9]+/g);
                          //hit.length = hitsArray[4].match(/[0-9]+/g);
						  
						  const hit = {'documentId':hitsArray[2].match(/[0-9]+/g),
										'termPosition':hitsArray[3].match(/[0-9]+/g),
										'length':hitsArray[4].match(/[0-9]+/g)};

                          hits.push(hit);

                          // console.log(hit.termPosition);
                      }
                  }
       }
      return hits;
  }
  
function getTitleFromXML(xml){

      let title = '';

         if (xml === undefined || xml === null) {
              console.log ('getTitleFromXML: xml is null');
           } else {
               if (xml.match(/<metadataField name='title' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='title' value='([^<>]+)'\/>/);
                    //console.log(temp);
                  
                   title = temp[1];

               }
           }
      return title;
  }

 function getFileNameFromXML(xml){

      let filename = '';

         if (xml === undefined || xml === null) {
              console.log ('getFilenameFromXML: xml is null');
           } else {
			   //!!! documentTitel is something like 551.xml - filename
               if (xml.match(/<documentTitle>([^<>]+)<\/documentTitle>/)) {
                   const temp = xml.match(/<documentTitle>([^<>]+)<\/documentTitle>/);
                  
					if(temp !=null &&temp.length>0)
						filename = temp[1].toString();

               }
           }
      return filename;
  }

function getDocumentTextFromXML(xml){
    const array = [];

    if (xml === undefined || xml === null) {
        console.log ('getDocumentTextXML: xml is null');
    } else {
            if (xml.match(/<data>[\W\w]+<\/data>/)) {
               const temp = xml.match(/<data>[\W\w]+<\/data>/);
                //console.log(temp);
               const regexTextPos = /(<text\sposition='([0-9]+)'>([\w_,%&$\.;:-]+)<\/text>)/g;

               let docTextArray = [];
               while ((docTextArray = regexTextPos.exec(temp)) !== null) {
                   array.push(docTextArray[3]);
               }

          }
    }

    return array;
  }
  
  function getCitationFromXML(xml){
    let citation="";

    if (xml === undefined || xml === null) {
        console.log ('getCitationFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='citation' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='citation' value='([^<>]+)'\/>/);
                    //console.log(temp);
                   

                   citation = temp[1];

               }

    }

    return citation;
  }
  
   function getDescriptionFromXML(xml){
    let description="";

    if (xml === undefined || xml === null) {
        console.log ('getDecriptionFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='description' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='description' value='([^<>]+)'\/>/);
                   // console.log(temp);
                  

                   description = temp[1];

               }

    }

    return description;
  }
  
   function getDocIdFromXML(xml){
    let docId="";

    if (xml === undefined || xml === null) {
        console.log ('getDocIdFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='docId' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='docId' value='([^<>]+)'\/>/);
                   // console.log(temp);
                  

                   docId = temp[1];

               }

    }
    
    return docId;
  }
  
  function getDataCenterFromXML(xml){
    let dataCenter="";
    
    if (xml === undefined || xml === null) {
        console.log ('getDataCenterFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='dataCenter' value='([A-Za-z\s0-9:;&]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='dataCenter' value='([A-Za-z\s0-9:;&]+)'\/>/);
                   //console.log(temp);
                   
                   dataCenter = temp[1];

               }

    }

    return dataCenter;
  }
  
  function getTaxonFromXML(xml){
    let taxon="";

    if (xml === undefined || xml === null) {
        console.log ('getTaxonFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='taxon' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='taxon' value='([^<>]+)'\/>/);
                   
                   taxon = temp[1];

               }

    }

    return taxon;
  }
  
  function getParametersFromXML(xml){
    let parameters="";

    if (xml === undefined || xml === null) {
        console.log ('getParametersFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='parameters' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='parameters' value='([^<>]+)'\/>/);
                  
					
                   parameters = temp[1];

               }

    }

    return parameters;
  }
  
  function getMinLongitudeFromXML(xml){
    let minLongitude="";

    if (xml === undefined || xml === null) {
        console.log ('getMinLongitudeFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='minLongitude' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='minLongitude' value='([^<>]+)'\/>/);
                   
                   minLongitude = temp[1];

               }

    }

    return minLongitude;
  }
  
  function getMaxLongitudeFromXML(xml){
    let maxLongitude="";

    if (xml === undefined || xml === null) {
        console.log ('getMaxLongitudeFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='maxLongitude' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='maxLongitude' value='([^<>]+)'\/>/);
                   
                   maxLongitude = temp[1];

               }

    }

    return maxLongitude;
  }
  
  function getMinLatitudeFromXML(xml){
    let minLatitude="";

    if (xml === undefined || xml === null) {
        console.log ('getMinLatitudeFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='minLatitude' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='minLatitude' value='([^<>]+)'\/>/);
                   //console.log(temp);
                   minLatitude = temp[1];

               }

    }

    return minLatitude;
  }
  
  function getMaxLatitudeFromXML(xml){
    let maxLatitude="";

    if (xml === undefined || xml === null) {
        console.log ('getMaxLatitudeFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='maxLatitude' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='maxLatitude' value='([^<>]+)'\/>/);
                   
                   maxLatitude = temp[1];

               }

    }

    return maxLatitude;
  }
  
  
  function getDataTypeFromXML(xml){
    let dataType="";

    if (xml === undefined || xml === null) {
        console.log ('getDataTypeFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='dataType' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='dataType' value='([^<>]+)'\/>/);
                   
                   dataType = temp[1];

               }

    }

    return dataType;
  }
  
  function getAccessFromXML(xml){
    let access="";

    if (xml === undefined || xml === null) {
        console.log ('getAccessFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='access' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='access' value='([^<>]+)'\/>/);
                 
                   access = temp[1];

               }

    }

    return access;
  }
  
  function getCollectionStartDateFromXML(xml){
    let collectionStartDate="";

    if (xml === undefined || xml === null) {
        console.log ('getCollectionStartDateFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='collectionStartDate' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='collectionStartDate' value='([^<>]+)'\/>/);
                   

                   collectionStartDate = temp[1];

               }

    }

    return collectionStartDate;
  }
  
  function getCollectionEndDateFromXML(xml){
    let collectionEndDate="";

    if (xml === undefined || xml === null) {
        console.log ('getCollectionEndDateFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='collectionEndDate' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='collectionEndDate' value='([^<>]+)'\/>/);
                   

                   collectionEndDate = temp[1];

               }

    }

    return collectionEndDate;
  }
  
  function getPublicationDateFromXML(xml){
    let publicationDate="";

    if (xml === undefined || xml === null) {
        console.log ('getPublicationDateFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='publicationDate' value='([0-9\-\.\/]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='publicationDate' value='([0-9\-\.\/]+)'\/>/);
                    

                   publicationDate = temp[1];

               }

    }

    return publicationDate;
  }
  
  function getAuthorFromXML(xml){

      let authors = [];

         if (xml === undefined || xml === null) {
              console.log ('getAuthorFromXML: xml is null');
           } else {
                if (xml.match(/<metadataField name='author' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='author' value='([^<>]+)'\/>/);
                   // console.log(temp);
                   

                   author = temp[1];

               }
			   
           }
      return author;
  }
 
  function getContributorFromXML(xml){

      let contributor = [];

         if (xml === undefined || xml === null) {
              console.log ('getContributorFromXML: xml is null');
           } else {
                if (xml.match(/<metadataField name='contributor' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='contributor' value='([^<>]+)'\/>/);
                   // console.log(temp);
                   

                   contributor = temp[1];

               }
			   
           }
      return contributor;
  }
  
 
   function getKeywordsFromXML(xml){
    let keywords="";

    if (xml === undefined || xml === null) {
        console.log ('getKeywordsFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='keywords' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='keywords' value='([^<>]+)'\/>/);
                   
                   keywords = temp[1];

               }

    }

    return keywords;
  }
  
  function getRelatedDatasetsFromXML(xml){
    let relatedDatasets="";

    if (xml === undefined || xml === null) {
        console.log ('getRelatedDatasetsFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='relatedDatasets' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='relatedDatasets' value='([^<>]+)'\/>/);
                  
                   relatedDatasets = temp[1];

               }

    }

    return relatedDatasets;
  }
  
  function getLinkageFromXML(xml){
    let linkage="";

    if (xml === undefined || xml === null) {
        console.log ('getLinkageFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='linkage' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='linkage' value='([^<>]+)'\/>/);
                  
                   linkage = temp[1];

               }

    }

    return linkage;
  }
  
 function getAdditionalContentFromXML(xml){
    let additionalContent="";

    if (xml === undefined || xml === null) {
        console.log ('getAdditionalContentFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='additionalContent' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='additionalContent' value='([^<>]+)'\/>/);
                  
                   additionalContent = temp[1];

               }

    }

    return additionalContent;
  }
  
  //Bexis legacy
  
  function getLicenseFromXML(xml){
    let license="";

    if (xml === undefined || xml === null) {
        console.log ('getLicenseFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='license' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='license' value='([^<>]+)'\/>/);
                    //console.log(temp);
                  

                   license = temp[1];

               }

    }

    return license;
  }
  
  function getCoordinatesFromXML(xml){
    let coordinates="";

    if (xml === undefined || xml === null) {
        console.log ('getCoordinatesFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='coordinates' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='coordinates' value='([^<>]+)'\/>/);
                    
                  
                   coordinates = temp[1];

               }

    }

    return coordinates;
  }


  
  function getDOIFromXML(xml){
    let DOI="";

    if (xml === undefined || xml === null) {
        console.log ('getDOIFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='DOI' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='DOI' value='([^<>]+)'\/>/);
                   

                   DOI = temp[1];

               }

    }

    return DOI;
  }

  
  function getProcessFromXML(xml){
    let process="";

    if (xml === undefined || xml === null) {
        console.log ('getProcessFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='process' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='process' value='([^<>]+)'\/>/);

                   process = temp[1];

               }

    }

    return process;
  }
  
  function getEnvironmentFromXML(xml){
    let environment="";

    if (xml === undefined || xml === null) {
        console.log ('getEnvironmentFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='environment' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='environment' value='([^<>]+)'\/>/);
                  
                   environment = temp[1];

               }

    }

    return environment;
  }
  
  function getMultimediaFromXML(xml){
    let multimedia="";

    if (xml === undefined || xml === null) {
        console.log ('getMultimediaFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='multimedia' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='multimedia' value='([^<>]+)'\/>/);
                  
                   multimedia = temp[1];

               }

    }

    return multimedia;
  }
  
  function getProjectFromXML(xml){
    let project="";

    if (xml === undefined || xml === null) {
        console.log ('getProjectFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='project' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='project' value='([^<>]+)'\/>/);
                   
                   project = temp[1];

               }

    }

    return project;
  }
  
  
  function getMethodFromXML(xml){
    let method="";

    if (xml === undefined || xml === null) {
        console.log ('getMethodFromXML: xml is null');
    } else {
            
			 if (xml.match(/<metadataField name='method' value='([^<>]+)'\/>/)) {
                   const temp = xml.match(/<metadataField name='method' value='([^<>]+)'\/>/);

                   method = temp[1];

               }

    }

    return method;
  }

function getHighlightingFromXML(xml, hits){
  //console.log(xml);
      const highlighting = [];

  if (xml === undefined || xml === null) {
          console.log ('getHighlightingFromXML: xml is null');
      } else {
              if (xml.match(/<data>[\W\w]+<\/data>/)) {
                 const temp = xml.match(/<data>[\W\w]+<\/data>/);
                 const regexTextPos = /(<text\sposition='([0-9]+)'>([0-9\w_,%&ø$\.;\/()-]+)<\/text>)(<space>(\s+)<\/space>)?/g;
                 
				 let docTextArray = [];
                   
				
				
				 for(j=0; j< hits.length; j++){
					//hit = {'documentId': <docID>, 'termPosition': <termPos>, 'length': <length>}
					let hit = hits[j];
					let termPos = +hit.termPosition;
				    let maxPos = termPos + Number(hit.length) - 1;
					let tempHigh = "";
				    //console.log(hit.length);
					//console.log('maxPos:'+maxPos);
					//console.log('regex:'+regexTextPos);
					while ((docTextArray = regexTextPos.exec(temp)) !== null) {
					    
						const pos = Number(docTextArray[2]);			 
					   
					    if (pos <= maxPos && termPos == pos) {
					       //console.log('termPos:'+termPos);
						   const t = docTextArray[3];
						   if(docTextArray.length > 3 && docTextArray[4] !== undefined ){
							   tempHigh = tempHigh + t + docTextArray[5];
						       //console.log(tempHigh);
						   //if(t === '.' || t.match(/[0-9]+/)|| t.length == 1){ //in case the extracted text is a doc ('.') or a number or single characters, no space, e.g., H20
							 //  tempHigh = tempHigh + t;
						   }else{
								tempHigh = tempHigh + t;
								//console.log(tempHigh);
						   }
                           termPos = termPos + 1;
						}
				  
					}
					
					
					//console.log(tempHigh);	
                    if(tempHigh.match(/term[0-9]+/) == null && tempHigh.match(/param[0-9]+/)==null){				
						if(highlighting.indexOf(tempHigh.trim())<0){
						   highlighting.push(tempHigh.trim());
						}
					}

                 }
				 

            }
      }
	  
      return highlighting;
    }


function document(rank) {
    //document rank in search result
	this.rank = 0;
	
	//docId
	this.docId = "";

	// document title (URL)
    this.title = "";
	
	//citation
	this.citation = "";
	
	//dataCenter
	this.dataCenter = "";
	
	//taxon
	this.taxon = "";
	
	//parameters
	this.parameters = [];
	
	//minLongitude
	this.minLongitude = "";
	
	//maxLongitude
	this.maxLongitude = "";
	
	//minLatitude
	this.minLatitude = "";
	
	//maxLatitude
	this.maxLatitude = "";
	
	//dataType
	this.dataType = "";
	
	//access
	this.access = "";
	
	//collectionStartDate
	this.collectionStartDate = "";
	
	//collectionEndDate
	this.collectionEndDate = "";
	
	//publicationDate
	this.publicationDate = "";
	
	//author, string[]
	this.author =[];
	
	//contributor, string[]
	this.contributor =[];
	
	//keywords
	this.keywords = "";
	
	//relatedDatasets
	this.relatedDatasets = "";
	
	//linkage
	this.linkage = "";
	
	//additionalContent
	this.additionalContent="";
    
	//filename
	this.filename = "";

    // document rank (in search result)
    this.rank= rank;

    // document text snippet for display (contains the hit and surrounding tokens)
    this.documentText="";

    //string[]
    this.documentTextArray=[];

    // array for collecting the hits (text) for highlighting
	//string []
    this.highlighting=[];

    // hits array with hits (documentId, termPosition, tokenLength)
	// array of hits[]
    this.hits	= [];
	

	
	this.getTermPosOfHits = function() {
       const termPos = [];
       if (this.hits.length > 0) {
           
		   for(i=0; i< this.hits.length; i++){
			   //hit = {'documentId': <docID>, 'termPosition': <termPos>, 'length': <length>}
			   let hit = this.hits[i];
			   termPos.push(+hit.termPosition); // + converts a string to number
		   }
		  
       }
       // console.log(termPos);
       return termPos;

   }
	
	return this;
}

function sleeper(ms) {
  return function(x) {
    return new Promise(resolve => setTimeout(() => resolve(x), ms));
  };
}

function hit(){

    this.documentId = 0;
    this.termPosition = 0;
    this.length = 0;
    this.hitText = null;
    this.snippet = null;
	
	return this;
}


module.exports = router;
//};