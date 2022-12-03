// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,

    Keycloak_Url: 'https://keycloak.sso.gwdg.de/auth',
    Keycloak_RedirectUri: 'https://dev.gfbio.uni-jena.de/daisi',
    Keycloak_Realm: 'GFBio',
    Keycloak_ClientId: 'dev-gfbio-angular',

    apiUrl: 'http://localhost:3000',
    gateUrl: 'http://localhost:8080/api/gate/',
    // gateUrl: 'https://semsearch.fmi.uni-jena.de/api/gate/',
	context: '/gfbio',
    searchUrl: '/search',
    semSearchUrl: '/semantic-search',
    suggestUrl: '/suggest',
    suggestPanUrl: '/suggest-pan',
    suggestTerUrl: '/suggest-ter',
    basketUrl: '/basketDownload',
    addToBasketUrl: '/addToBasket',
    deleteFromBasket: '/deleteFromBasket',
    deleteAllBasket: '/deleteAllBasket',
    readFromBasketUrl: '/api/baskets/user/',
    ipifyUrl: 'https://api.ipify.org?format=json',
    loggingFlag: true,
    terminologyEndpoint: 'https://terminologies.uni-jena.de/graphDB/repositories/BIODIV',
    terminologySPARQL: 'http://gfbio-git.inf-bb.uni-jena.de/BIODIV',
    imagePath: 'assets/img/',
    vatImg: 'vat.png',
    semSearchImg: 'icon_semsearch3.png',
    textAlertSemSearchError: 'A connection error occured. Please reduce the amount of search terms or try the search again.',
    textAlertWordLength: 'please choose a word longer than 4 letters to use the * in semantic search',
    textAlertBasketErrorDownload: 'An error occured during the download.\nPlease contact the administrator for more information.',
    textTooltipBasketVATvisualizable: 'dataset can be visualized in VAT',
    textTooltipBasketVATnotVisualizable: 'dataset can not be visualized in VAT',
    textTooltipBasketDataAvailable: 'data are available for download',
    textTooltipBasketDataNotAvailable: 'data are not available for download',
    textTooltipBasketMetadataAvailable: 'metadata are available for download',
    textTooltipBasketMetadataNotAvailable: 'metadata are not available for download',
    textTooltipBasketMultimediaAvailable: 'multimedia are available for download',
    textTooltipBasketMultimediaNotAvailable: 'multimedia are not available for download',
    textTooltipBasketRemove: 'remove dataset from basket',
    textTooltipBasketRemoveSure: 'Are you sure that you want to empty the basket?',
    textTooltipBasketEmpty: 'Please select a dataset from the search result.',
    textTSWidgetInfo: 'Your search query is expanded with relational terms obtained from GFBio\'s ' +
        'Terminology Service. Some terms can be further expanded with more narrower or broader terms. ' +
        'Click on the buttons to obtain all descendants or an ancestor. With a double-click on the returned ' +
        'narrower or broader terms you can add them to the search field.',
    dataCenter: 'Data Center',
    dataType: 'Data Type',
    parameter: 'Parameter',
    taxonomy: 'Taxonomy',
    geographicRegion: 'Geographic Region',
    type: 'Type',
    colors: ['#94e851', '#f52f57', '#173b4e', '#ee82ee', '#ffff00', '#27408b', '#009acd', '#ff00ff', '#8b0000', '#00fa9a'],
    noCoordinates: 'This dataset has no coordinates and can not be located on the map.',
    vatTooltip: 'This dataset can be transfered to VAT.',
    datacenterTooltips: {
        SNSB: 'This dataset is provided by Staatliche Naturwissenschaftliche ' +
            'Sammlungen Bayerns; SNSB IT Center, M;nchen (SNSB).',
        SGN: 'This dataset is provided by Senckenberg Gesellschaft f;r Naturforschung; Leibniz Institute Frankfurt (SGN).',
        BGBM: 'This dataset is provided by Botanic Garden and Botanical Museum Berlin, Freie Universit;t Berlin (BGBM).',
        MfN: 'This dataset is provided by Leibniz Institute for Research on Evolution and Biodiversity, Berlin (MfN).',
        ZFMK: 'This dataset is provided by Zoological Research Museum Alexander Koenig; Leibniz ' +
            'Institute for Animal Biodiversity, Bonn (ZFMK).',
        SMNS: 'This dataset is provided by State Museum of Natural History Stuttgart (SMNS).',
        PANGAEA: 'This dataset is provided by Data Publisher for Earth; Environmental Science  (PANGAEA).',
        DSMZ: 'This dataset is provided by Leibniz Institute DSMZ; German Collection of Microorganisms ' +
            'and Cell Cultures, Braunschweig (DSMZ).',
        Gatersleben: 'e!DAL;PGP ; Plant Genomics and Phenomics Research Data Repository, ' +
            'Leibniz Institute of Plant Genetics and Crop Plant Research (IPK) Gatersleben',
        ENA: 'European Nucleotide Archive'
    },
    annotationTypes: ['organism','environment','quality','material','process'],
    organism: 'organism',
    environment: 'environment',
    material: 'material',
    process: 'process',
    quality: 'quality',    
    defaultAnnotation: '<annotation>',
    defaultOperator: 'AND',
    iconOrganism: 'local_florist',
    iconEnvironment: 'landscape',
    iconQuality: 'dataset',
    iconProcess: 'cyclone', 
    iconMaterial: 'science',
    biodiv1: 'biodiv1',
    biodiv2: 'biodiv2'  
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
