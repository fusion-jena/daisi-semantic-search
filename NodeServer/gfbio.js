var express = require('express');
var app = express();
var router = require('express').Router();
var bodyParser = require('body-parser').json();
const axios = require('axios');
const Blob = require('node-blob');
var FileSaver = require('file-saver');
var fs = require("fs");
var JSZip = require("jszip");
var basket = require('./controllers/basket.controller')
// module to establish a connection to Elasticsearch
// currently not needed
//var search = require('./connectionElastic');

var GFBioTS_URL = process.env.GFBIOTS_URL;
var Pangaea_URL = process.env.PANGAEA_URL;
var Pangaea_Suggest_URL = process.env.PANGAEA_SUGGEST_URL;
var TERMINOLOGY_SUGGEST_URL = process.env.TERMINOLOGY_SUGGEST_URL;
const { cartesianProduct } = require('cartesian-product-multiple-arrays');
// Sets up the routes.
/********************** GFBIO code *******************/
/**
 * POST /gfbio/search
 * Search for a term
 */
/**
 * @swagger
 * /gfbio/search:
 *   post:
 *     description: Returns search results
 *     tags: [Search GFBio - Elastic index]
 *     summary: returns a search result
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: queryterm
 *         description: the query as string
 *         schema:
 *            type: object
 *            required:
 *              - queryterm
 *            properties:
 *              queryterm:
 *                type: string
 *                example: fungi
 *              from:
 *                type: integer
 *                description: from which page to start?
 *                example: 0
 *              size:
 *                type: integer
 *                description: how many datasets to return per page?
 *                example: 10
 *     responses:
 *       201:
 *         description: hits.hits contains an array with dataset objects matching the query.
 */
router.post('/search', (req, res) => {

    console.log('/search' + req.body);
    //in case you want to use the elasticmodule
    /*search.sendQuery(req.body).then(resp=>{

       return res.status(200).send(resp);

   })
   .catch(err=>{
       console.log(err);
       return res.status(500).json({
           msg:'Error', err
       });
   });*/

    /* we utilize axios for calling elasticsearch
    * a request should like this
    * {"queryterm":"quercus","from":0,"size":10,"filter":[]}
    */


    //get the keyword from the body
    const keyword = req.body.queryterm;
    console.log('keywords: ' + keyword)
    let filter = [];
    let from = 0;
    let size = 0;

    // get from, size and filters from the body
    if (req.body.from !== 'undefined' && req.body.from >= 0) {
        from = req.body.from
    }

    if (req.body.size !== 'undefined' && req.body.size >= 0) {
        size = req.body.size
    }

    if (req.body.filter !== 'undefined') {
        filter = req.body.filter
    }

    //get the filtered query
    const filteredQuery = getFilteredQuery(keyword, filter);


    //apply the boost
    const boostedQuery = applyBoost(filteredQuery);

    //construct the complete query with from and size
    const data = getCompleteQuery(boostedQuery, from, size);
    //config the header, we only accept json data
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    //post it to GFBio elasticsearch index
    return axios.post(Pangaea_URL, data, config).then(resp => {
        console.log("data is: " + JSON.stringify(data));

        // if you receive data - send it back
        res.status(200).send(resp.data);

    })
        .catch(err => {
            //in error case - log it and send the error
            console.log(err);
            return res.status(500).json({
                msg: 'Error', err
            });
        });


});

/**
 * POST /suggest-Pangaea
 * Pangaea Suggest service for simple search
 */
/**
 * @swagger
 * /gfbio/suggest-pan:
 *   post:
 *     description: Returns query term suggestions for given characters from Pangaea service
 *     tags: [Search GFBio - Elastic index]
 *     summary: returns query term suggestions
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: term
 *         description: the characters for which suggestions are needed
 *         schema:
 *            type: object
 *            required:
 *              - term
 *            properties:
 *              term:
 *                type: string
 *                example: quer
 *     responses:
 *       201:
 *         description: object with key 'suggest' containing an array with options
 */
router.post('/suggest-pan', (req, res) => {
    console.log('/suggest:' + req.body.term);
    //get the term from the body
    const term = req.body.term

    //set the header  - only json data permitted
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    //specific data object required
    const data = {
        suggest: {
            text: term,
            completion: {
                field: 'suggest',
                size: 12
            }
        }
    }

    //post the request to elasticsearch
    return axios.post(Pangaea_Suggest_URL, data, config)
        .then((resp) => {
            //console.log(`Status: ${resp.status}`);
            //console.log('Body: ', resp.data);
            res.status(200).send(resp.data);

        })
        .catch((err) => {
            console.log(err);

            return res.status(500).json({
                msg: 'Error', err
            });
        });

})

/**
 * POST /suggest-Terminology
 * Terminology Suggest service for semantic search
 */
/**
 * @swagger
 * /gfbio/suggest-ter:
 *   post:
 *     description: Returns query term suggestions for given characters from Terminology service
 *     tags: [Search GFBio - Elastic index]
 *     summary: returns query term suggestions
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: term
 *         description: the characters for which suggestions are needed
 *         schema:
 *            type: object
 *            required:
 *              - term
 *            properties:
 *              term:
 *                type: string
 *                example: quer
 *     responses:
 *       201:
 *         description: object with key 'suggest' containing an array with labels
 */
router.post('/suggest-ter', (req, res) => {
    console.log('/suggest:' + req.body.term);
    //get the term from the body
    const term = req.body.term

    //post the request to elasticsearch
    return axios.get(TERMINOLOGY_SUGGEST_URL + "?query=" + term + "*&match_type=exact")
        .then((resp) => {
            res.status(200).send(resp.data);

        })
        .catch((err) => {
            console.log(err);

            return res.status(500).json({
                msg: 'Error', err
            });
        });

})

/**
 * POST /basketDownload
 * download the basket
 */
/**
 * @swagger
 * /gfbio/basketDownload:
 *   post:
 *     description: downloads the chosen datasets
 *     tags: [Search GFBio - Elastic index]
 *     summary: downloads the chosen datasets
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: basket
 *         description: the object contains array of datasets
 *         schema:
 *            type: object
 *            required:
 *              - basket
 *            properties:
 *              basket:
 *                type: array
 *                items:
 *                   type: object
 *     responses:
 *       201:
 *         description: the browser stars to download
 */
router.post('/basketDownload', (req, res) => {
    // res.status(200).send(req.body.basket);
    const selectedBasket = req.body.basket;
    console.log(selectedBasket);
    var zip = new JSZip();
    var axiosArray = [];
    var names = []
    selectedBasket.forEach(function (result, index) {
         
	var identifier = result['dcIdentifier'];
    if(identifier == undefined){
		identifier = result['id'];
	}
	
        // metadata
		//Pangaea's identifier can be a full URI - use only the ID at the end of the URI
		if(identifier.length > 20){
			let iArray = identifier.split('/');
			if(iArray?.length >0)
				identifier = iArray[iArray.length-1];
		}
		console.log(identifier);
        var identifier = identifier.replace(/[` ~!@#$%^&*()_|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/gi, '');
        zip.file(identifier + "_metadata.xml", result['xml']);

        // data
        if (result.linkage?.data) {
            names.push("");

            var datalink = decodeURIComponent(result.linkage.data);

            axiosArray.push(axios.get(datalink, {
                responseType: 'arraybuffer',
                headers: {"Content-Type": "text/plain; charset=x-user-defined"}
            }));
        }

        // multimedia
        if (result.linkage?.multimedia) {
            for (var i = 0; i < result.linkage.multimedia.length; i++) {
                names.push(new URL(result.linkage.multimedia[i].url).pathname.split('/').pop());

                var multimedialink = decodeURIComponent(result.linkage.multimedia[i].url);

                axiosArray.push(axios.get(multimedialink, {
                    responseType: 'arraybuffer'
                }));
            }
        }
    })

    console.log("length of array: " + axiosArray.length);

    axios.all(axiosArray)
        .then(axios.spread((...responses) => {
            for (var i = 0; i < axiosArray.length; i++) {
                if (responses[i].headers['content-disposition']) {
                    var regexp = /filename=(.*)/;
                    zip.file(regexp.exec(responses[i].headers['content-disposition'])[1], Buffer.from(responses[i].data), {base64: false});
                } else {
                    zip.file(names[i], Buffer.from(responses[i].data), {base64: false});
                }
            }

            var zipName = 'gfbio_basket' + '.zip';

            zip
                .generateNodeStream({type: 'nodebuffer', streamFiles: true})
                .pipe(fs.createWriteStream(zipName))
                .on('finish', function () {
                    console.log(zipName);
                    res.status(200).download("./" + zipName, zipName);
                });
        })).catch((err) => {
        console.log(err);
        return res.status(500).json({
            msg: 'Error', err
        });
    });
})
/**
 * POST /addToBasket
 * download the basket
 */
/**
 * @swagger
 * /gfbio/addToBasket:
 *   post:
 *     description: adds dataset to the basket
 *     tags: [Search GFBio - Elastic index]
 *     summary: adds dataset to the basket
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: add to basket
 *         description: adds dataset to the basket
 *         schema:
 *            type: object
 *            required:
 *              - userId
 *              - basketContent
 *            properties:
 *              userId:
 *                type: integer
 *              basketContent:
 *                type: object
 *     responses:
 *       201:
 *         description: the item will be added to the database
 */

router.post('/addToBasket', (req, res) => {
    console.log(req);
	basket.create(req, res);

    // var sql = "INSERT INTO gfbio_basket (userid,basketcontent) VALUES(?,?)";
    // pool.query(sql,[req.body.userId,req.body.basketContent], function (err, result, fields) {
    //     if (err) throw new Error(err)
    // })
    res.status(201).send(res);
})
// router.post('/addToBasket', (req, res) => {
//     var sql = "INSERT INTO basket (user_id,data_id,data) VALUES(?,?,?)";
//     pool.query(sql, [req.body.userId, req.body.dataId, req.body.data], function (err, result, fields) {
//         if (err) throw new Error(err)
//     })
//     res.status(200).send(req.body);
// })
// router.post('/deleteFromBasket', (req, res) => {
//     var sql = "DELETE FROM basket WHERE data_id = (?) AND user_id = (?) LIMIT 1";
//     pool.query(sql,[req.body.dataId, req.body.userId], function (err, result, fields) {
//         if (err) throw new Error(err)
//     })
//     res.status(200).send(req.body);
// })
// router.post('/deleteAllBasket', (req, res) => {
//     var sql = "DELETE FROM basket WHERE user_id = (?)";
//     pool.query(sql,[req.body.userId], function (err, result, fields) {
//         if (err) throw new Error(err)
//     })
//     res.status(200).send(req.body);
// })
// router.post('/readFromBasket', (req, res) => {
//     var sql = "SELECT * FROM basket WHERE user_id = (?)";
//     pool.query(sql,[req.body.userId], function (err, result, fields) {
//         if (err) throw new Error(err)
//         res.status(200).send(result);
//     })
// })

/**
 * POST /readFromBasket
 * download the basket
 */
/**
 * @swagger
 * /gfbio/readFromBasket:
 *   post:
 *     description: returns the saved basket of the user
 *     tags: [Search GFBio - Elastic index]
 *     summary: returns the saved basket of the user
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: reads the basket
 *         description: returns the saved basket of the user
 *         schema:
 *            type: object
 *            required:
 *              - userId
 *            properties:
 *              userId:
 *                type: integer
 *     responses:
 *       201:
 *         description: returns the saved basket of the user
 */
router.get('/readFromBasket', (req, res) => {
    basket.findByUserId(req, res);
    res.status(200).send(res);

    // var sql = "SELECT * FROM gfbio_basket WHERE userid = (?) ORDER BY basketid DESC LIMIT 1";
    // pool.query(sql,[req.body.userId], function (err, result, fields) {
    //     if (err) throw new Error(err)
    //     res.status(200).send(result);
    // })
})

/**
 * POST /semantic-search
 * semantic search service (based on query expansion)
 * search query is sent to GFBio TS first, only expanded result is forwarded to elasticsearch
 */
/**
 * @swagger
 * /gfbio/semantic-search:
 *   post:
 *     description: search query is sent to GFBio TS first, only expanded result is forwarded to elasticsearch
 *     tags: [Search GFBio - Elastic index]
 *     summary: returns search results including semantic related results
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: queryterm
 *         description: the query as string array
 *         schema:
 *            type: object
 *            required:
 *              - queryterm
 *            properties:
 *              queryterm:
 *                type: array
 *                items:
 *                   type: string
 *                example: [honeybee,grassland]
 *              from:
 *                type: integer
 *                description: from which page to start?
 *                example: 0
 *              size:
 *                type: integer
 *                description: how many datasets to return per page?
 *                example: 10
 *     responses:
 *       201:
 *         description: hits.hits contains an array with dataset objects matching the query.
 */
router.post('/semantic-search', (req, res) => {
    /*e.g.,
  * {
    *	"queryterm":["grassland","honeybee"],
    * 	"from":0,
    * 	"size":10
  * }
  */
    //expects keyword as string array
    const keywords = req.body.queryterm; //array with keywords
    const keywordsCombination = []
    keywords.forEach(function (item) {
        const insideArr = item.split('+');
        keywordsCombination.push(insideArr)
    })
    const flatKeyWords = keywordsCombination.flat()
    const response = []

    let axiosArray = [];

    let termData = [];

    //at first, send each keyword to GFBio TS
    for (i = 0; i < flatKeyWords.length; i++) {
        //console.log("keyword: "+keywords[i]);
        axiosArray.push(axios.get(GFBioTS_URL + "search?query=" + flatKeyWords[i] + "&match_type=exact"));
    }
    //collect all calls first and then send it in a bunch
    //axios will handle them in parallel and will only continue when all calls are back
    return axios.all(axiosArray)
        .then(axios.spread((...responses) => {
            for (i = 0; i < axiosArray.length; i++) {
                let allKeyWords = [flatKeyWords[i]];
                var results = responses[i].data.results;
                results.forEach(function (item) {
                    var log = "";
                    //console.log(item);
                    for (const [key, value] of Object.entries(item)) {
                        if (item.sourceTerminology !== 'GEONAMES' && item.sourceTerminology !== 'RIVERS_DE') {
                            if (key === 'commonNames') {
                                // var keyword = value.toString().replace(/,/g, "\"|\"");
                                // allKeyWords = allKeyWords.concat("\"" + keyword + "\"")
                                // log += "----- commonName : " + value + "\n";
                                var keyword = value.toString();
                                keyword = keyword.split(",");
                                for (var t = 0; t < keyword.length; t++) {
                                    keyword[t] = '\'' + keyword[t] + '\''
                                    if (!keyword[t].startsWith('(') && !keyword[t].startsWith('\'')) {
                                        keyword[t] = '\'' + keyword[t] + '\'';
                                    }
                                }
                                allKeyWords = allKeyWords.concat(keyword)
                            }
                            if (key === 'synonyms') {
                                // var keyword = value.toString().replace(/,/g, "\"|\"");
                                // allKeyWords = allKeyWords.concat("\"" + keyword + "\"")
                                // log += "----- synonym : " + value + "\n";

                                var keyword = value.toString();
                                keyword = keyword.split(",");
                                for (var t = 0; t < keyword.length; t++) {
                                    keyword[t] = '\'' + keyword[t] + '\''
                                    if (!keyword[t].startsWith('(') && !keyword[t].startsWith('\'')) {
                                        keyword[t] = '\'' + keyword[t] + '\'';
                                    }
                                }
                                allKeyWords = allKeyWords.concat(keyword)


                            }
                            // if (key === 'label') {
                            //
                            //     allKeyWords = allKeyWords.concat("\"" + value + "\"")
                            //     log += "----- label : " + value + "\n";
                            // }

                        }
                    }
                    if (item.sourceTerminology !== 'GEONAMES' && item.sourceTerminology !== 'RIVERS_DE') {
                        termData.push(item);
                    }


                    if (log.length > 0) {
                        console.log("----- sourceTerminology : " + item.sourceTerminology);
                        console.log("----- uri : " + item.uri);
                        console.log(log);
                    }
                });
                response.push(allKeyWords)

            }
            console.log(" ************************** ");
            let z = 0
            for (var i = 0; i < keywordsCombination.length; i++) {
                for (var j = 0; j < keywordsCombination[i].length; j++) {
                    
					keywordsCombination[i][j] = response[z++];
                }
            }
            let cartesianProductAll = []
            for (var t = 0; t < keywordsCombination.length; t++) {
                cartesianProductAll.push(cartesianProduct(...keywordsCombination[t]))
            }
            cartesianProductAll = cartesianProductAll.flat()
            const lastArr = []
            for (var t = 0; t < cartesianProductAll.length; t++) {
                lastArr.push(cartesianProductAll[t].join(' + '))
            }
            console.log(lastArr)
            // allKeyWords = allKeyWords.filter((a, b) => allKeyWords.indexOf(a) === b)
            // console.log('allKeyWords: '+ allKeyWords)
            // var semanticTerms = allKeyWords;
            // var semanticTerms = allKeyWords.join("|");
            //elastic call
            let filter = [];
            let from = 0;
            let size = 0;

            //check if from, size and filters are in the request
            if (req.body.from !== 'undefined' && req.body.from >= 0) {
                from = req.body.from
            }

            if (req.body.size !== 'undefined' && req.body.size >= 0) {
                size = req.body.size
            }

            if (req.body.filter !== 'undefined') {
                filter = req.body.filter
            }

            //get the filtered query
            const filteredQuery = getQuery(lastArr, filter);

            //apply the boost
            const boostedQuery = applyBoost(filteredQuery);

            //get the complete query
            const data = getCompleteQuery(boostedQuery, from, size);

            //set the header - only json data accepted
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            // console.log("data is: " + JSON.stringify(data));

            //post the expanded query to GFBio elastic index
            console.log("data is: " + JSON.stringify(data));
            return axios.post(Pangaea_URL, data, config);

        }))
        .then(resp => {
            //last item is necessary for highlighting the expanded terms
            resp.data.termData = termData;
            // console.log("termData is: " + JSON.stringify(termData));
            //resp.data.lastItem = allKeyWords;
            var extendedTerms = [];
            var result = resp.data.hits.hits;
            for (var i = 0, iLen = result.length; i < iLen; i++) {
                var highlight = result[i].highlight;
                // console.log(highlight)
                if (highlight != null) {
                    var highlightArr = extractHighlightedSearch(highlight);
                    // console.log(highlightArr);
                    var isAdded = false;
                    for (var iHighlight = 0; iHighlight < highlightArr.length; iHighlight++) {
                        for (var iExtended = 0; iExtended < extendedTerms.length; iExtended++) {
                            if (extendedTerms[iExtended].toLowerCase() == highlightArr[iHighlight].toLowerCase()) {
                                isAdded = true;
                            }
                        }
                        //if (!isAdded && highlightArr[iHighlight].length>highlightLength){
                        if (!isAdded) {
                            extendedTerms.push(highlightArr[iHighlight]);
                        }
                    }
                }
            }
            console.log(" ************************** ");
            console.log("----- search terms found in datasets: " + extendedTerms.join(", "));
            resp.data.lastItem = extendedTerms;

            res.set('Content-Type', 'application/json');
            res.status(200).send(resp.data);

        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({
                msg: 'Error', err
            });
        });

})

router.post('/narrow', (req, res) => {
    console.log('narrow:' + req.body);
    //get term from the body
    const id = req.body.id
    const uri = req.body.uri

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    return axios.get(GFBioTS_URL + id + '/narrower?uri=' + uri, config)
        .then((resp) => {
            console.log(resp.data);
            res.status(200).send(resp.data);

        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({
                msg: 'Error', err
            });
        });

})

router.post('/broad', (req, res) => {
    console.log('broad:' + req.body);
    //get term from the body
    const id = req.body.id
    const uri = req.body.uri

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    return axios.get(GFBioTS_URL + id + '/broader?uri=' + uri, config)
        .then((resp) => {
            console.log(resp.data);
            res.status(200).send(resp.data);

        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({
                msg: 'Error', err
            });
        });

})


/****************** Helper function ******************************/

/*
 * Description: Add filter to a JSON query message
 * Input: String keyword : search keyword
 *        JSONArray filter : filter option (Authors, Region, Data Center)
 * Output: JSONObject : filtered query
 */
function getFilteredQuery(keyword, filterArray) {
    var queryObj;
    console.log(':: filterArray ' + JSON.stringify(filterArray));
    if (keyword != "") {
        queryObj = {
            "simple_query_string": {
                "query": keyword,
                "fields": ["fulltext", "fulltext.folded^.7", "citation^3", "citation.folded^2.1"],
                "default_operator": "or"
            }
        };
    } else {
        queryObj = {
            "match_all": {}
        };
    }


    return {
        "bool": {
            "must": queryObj,
            "filter": filterArray
        }
    };
}
function getBooleanQuery(keyword, filterArray) {
    // console.log(keyword)
    var queryObj = {};
    var boostedKeywords = [];

    //keyword array with original term [0] and expanded terms [1] - [X]
    if (keyword.length > 0) {
        for (var i = 0; i < keyword.length; i++) {
            var booster = 1; //less priority to expanded terms
            var fields = [];
            if (i == 0) { // higher priority to original keyword
                booster = 2.2;
                fields = ["citation_title^3", "citation_title.folded^2.1",
                    "description^2.1", "description.folded",
                    "type.folded", "parameter.folded", "region.folded", "dataCenter.folded"];
                //["fulltext", "fulltext.folded^.7", "citation^3", "citation.folded^2.1"];
            } else { // extended keywords
                fields = ["citation_title^3", "citation_title.folded^2.1",
                    "description^2.1", "description.folded",
                    "parameter.folded", "region.folded", "dataCenter.folded"];
            }
            var keywordWithQuotes = keyword[i];
            boostedKeywords.push({
                "simple_query_string": {
                    "query": keywordWithQuotes,
                    "fields": fields,
                    "default_operator": "or",
                    "boost": booster
                }
            });
        }

        queryObj = {
            "bool": {
                "should": boostedKeywords
            }
        };
    } else {
        return {"match_all": {}};
    }


    queryObj = {
        "bool": {
            "must": [{
                "bool": {
                    "should": boostedKeywords
                }
            }],
            "filter": filterArray
        }
    }


    return queryObj;
}
function getQuery(keyword, filterArray) {
    //console.log(keyword)
    var queryObj = {};
    var boostedKeywords = [];
    console.log(keyword)

    //keyword array with original term [0] and expanded terms [1] - [X]
    if (keyword.length > 0) {
        var firstKeyWord = keyword[0];
        keyword.shift();
        var keysWithParanthesis = []
        for (let i = 0; i < keyword.length; i++) {
            keysWithParanthesis.push('(' + keyword[i] + ')');
        }
        var secondKeyWord = keysWithParanthesis.join(' ');
        var firstBooster = getBooster(1, firstKeyWord)
        var secondBooster = getBooster(2, secondKeyWord)
        boostedKeywords.push(firstBooster);
        boostedKeywords.push(secondBooster);

        queryObj = {
            "bool": {
                "should": boostedKeywords
            }
        };
    } else {
        return {"match_all": {}};
    }


    queryObj = {
        "bool": {
            "must": [{
                "bool": {
                    "should": boostedKeywords
                }
            }],
            "filter": filterArray
        }
    }


    return queryObj;
}
function getBooster(level, keys) {
        var booster = level; //less priority to expanded terms
        var fields = [];
        if (level === 1) { // higher priority to original keyword
            booster = 2.2;
            fields = ["citation_title^3", "citation_title.folded^2.1",
                "description^2.1", "description.folded",
                "type.folded", "parameter.folded", "region.folded", "dataCenter.folded"];
            //["fulltext", "fulltext.folded^.7", "citation^3", "citation.folded^2.1"];
        } else { // extended keywords
            booster = 1;
            fields = ["citation_title^3", "citation_title.folded^2.1",
                "description^2.1", "description.folded",
                "parameter.folded", "region.folded", "dataCenter.folded"];
        }
        var obj = {
            "simple_query_string": {
                "query": keys,
                "fields": fields,
                "default_operator": "or",
                "boost": booster
            }
        }
        return obj;
}


/*
 * Description: Apply boosting option to a JSON query message
 * Input: JSONObject query : JSON query message with filter option
 * Output: JSONObject : boosted query
 */
function applyBoost(query) {
    return {
        "function_score": {
            "query": query,
            "functions": [{
                "field_value_factor": {
                    "field": "boost"
                }
            }
            ],
            "score_mode": "multiply"
        }
    }
}

/*
 * Description: Complete a JSON query message with query size, query field, and facets options
 * Input: JSONObject boostedQuery : a JSON query mesage with filter and boost parameters
 *        int iDisplayStart : starting index of dataset (read from pagination option)
 *        int iDisplayLength : size of dataset (read from pagination option)
 *        JSONArray queryfield : array of query fields
 * Output: JSONObject : a complete JSON request message
 */
function getCompleteQuery(boostedQuery, iDisplayStart, iDisplayLength) {
    return {
        'query': boostedQuery,
        'highlight': {
            'fields': {'*': {}}
        },
        'from': iDisplayStart,
        'size': iDisplayLength,
        'aggs': {
            'taxonomy': {
                'terms': {
                    'field': 'taxonomyFacet',
                    'size': 50
                }
            },
            'region': {
                'terms': {
                    'field': 'regionFacet',
                    'size': 50
                }
            },
            'parameter': {
                'terms': {
                    'field': 'parameterFacet',
                    'size': 50
                }
            },
            'gfbioDataKind': {
                'terms': {
                    'field': 'gfbioDataKindFacet',
                    'size': 50
                }
            },
            'dataCenter': {
                'terms': {
                    'field': 'dataCenterFacet',
                    'size': 50
                }
            },
            'type': {
                'terms': {
                    'field': 'typeFacet',
                    'size': 50
                }
            }
        }
    }
}

/**
 ** Description: collect all expanded terms found in the datasets (needs to be highlighted in text and listed as "expanded terms"),
 ** Input: array with fields containg html including <em>keyword</em>
 ** Output: array with keywords
 **/
function extractHighlightedSearch(highlightArray) {
    var jArr = [];
    for (var fieldsKey in highlightArray) {
        //console.log("key:"+fieldsKey+", value:"+highlightArray[fieldsKey]); 
        var fieldsArray = highlightArray[fieldsKey];
        for (j = 0; j < fieldsArray.length; j++) {
            var highlightedText = fieldsArray[j];
            //console.log(highlightedText);
            var startTag = highlightedText.indexOf("<em>");
            var endTag = 0;
            var taggedText = "";
            while (startTag >= 0) {
                endTag = highlightedText.indexOf("</em>", startTag);
                taggedText = highlightedText.substring(startTag + 4, endTag);
                if (jArr.indexOf(taggedText) < 0) {
                    jArr.push(taggedText);
                }
                startTag = highlightedText.indexOf("<em>", endTag + 5);
            }
        }
        ;
    }
    ;
    return jArr;
}

module.exports = router;
