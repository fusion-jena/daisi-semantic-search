import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NgxSpinnerService} from 'ngx-spinner';
import {CommunicationService} from '../local/communication.service';
import {Result} from '../../models/result/result';
import {environment} from '../../../environments/environment';
import {DeviceDetectorService} from 'ngx-device-detector';

@Injectable({
    providedIn: 'root'
})
export class NodeService {
    deviceInfo = null;
    url = environment.apiUrl;
    ipifyURL = environment.ipifyUrl;
    suggestPanUrl = environment.context + environment.suggestPanUrl;
    suggestTerUrl = environment.context + environment.suggestTerUrl;
    basketURL = environment.context + environment.basketUrl;
    addToBasketUrl = environment.context + environment.addToBasketUrl;
    deleteFromBasketUrl = environment.context + environment.deleteFromBasket;
    deleteAllBasketUrl = environment.context + environment.deleteAllBasket;
    readFromBasketUrl = environment.context + environment.readFromBasketUrl;
    semantic = false;
    headers: { 'Content-Type': string } = {'Content-Type': 'application/json'};

    constructor(private http: HttpClient, private spinner: NgxSpinnerService,
                private communicationService: CommunicationService, private deviceService: DeviceDetectorService) {
    	
	}

    async search(urlTerm, body, serviceType, otherParameters,component): Promise<any> {
        return new Promise(resolve => {
            this.spinner.show();
            const headers = this.headers;
            this.http.post<any>(this.url + urlTerm, body, {headers}).subscribe(async data => {
                let results: Result;
                results = serviceType.getResult(data, otherParameters,component);
                this.communicationService.setResult(results);
                this.communicationService.setOriginalResult(data);
                let message = <any>{}; //= this.deviceInfo;
                message.action = 'search result received';
                message.url = urlTerm;
                message.fullQuery = body.queryString;
                message.docIds = data.docIds;
                const res = await this.log(message);
                
                // console.log(results);
                // console.log(data);
                this.spinner.hide();
                resolve('done');

            }, err => {
                alert(environment.textAlertSemSearchError);
                this.spinner.hide();
            });
        });
    }

    suggestSimple(key): any {
        const body = {
            term: key
        };
        const headers = this.headers;
        return this.http.post<any>(this.url + this.suggestPanUrl, body, {headers});
    }

    suggestTerminology(key): any {
        const body = {
            term: key
        };
        const headers = this.headers;
        return this.http.post<any>(this.url + this.suggestTerUrl, body, {headers});
    }

    addToBasket(itemInDatabase): any {
        return this.http.post<any>(this.url + this.addToBasketUrl, itemInDatabase);
    }

    readFromBasket(userId): any {
        return this.http.get<any>(this.url + this.readFromBasketUrl + userId);
    }

    deleteFromBasket(itemInDatabase): any {
        return this.http.post<any>(this.url + this.deleteFromBasketUrl, itemInDatabase);
    }

    deleteAllBasket(userId): any {
        return this.http.post<any>(this.url + this.deleteAllBasketUrl, {userId});
    }

    basketDownload(baskets): any {
	    console.log("basket download");
        return this.http.post(this.url + this.basketURL, baskets, {responseType: 'blob'});
    }

    narrow(id, uri): any {
        const body = {
            id,
            uri
        };
        const headers = this.headers;
        return this.http.post<any>(this.url + '/gfbio/narrow', body, {headers});
    }

    broad(id, uri): any {
        const body = {
            id,
            uri
        };
        const headers = this.headers;
        return this.http.post<any>(this.url + '/gfbio/broad', body, {headers});
    }

    log(message): any {
        return new Promise((resolve, reject) => {
            
			this.http.get(this.ipifyURL).subscribe(data =>{
				
				message.ip = data['ip'];
				message.date = new Date();
				message.deviceInfo = this.deviceService.getDeviceInfo();
				
				const headers = this.headers;
				console.log(message.ip);
                this.http.post<any>(this.url + '/api/log', message, {headers}).subscribe(data =>{
						resolve(data);
                    });
			});        
			
        });

    }

   

   /* epicFunction() {
        console.log('hello `Home` component');
        this.deviceInfo = this.deviceService.getDeviceInfo();
        let dateTime = new Date();
        this.deviceInfo= this.deviceInfo;
        this.deviceInfo.Date = new Date();
       	

		console.log(this.deviceInfo);
        const isMobile = this.deviceService.isMobile();
        const isTablet = this.deviceService.isTablet();
        const isDesktopDevice = this.deviceService.isDesktop();
        console.log(this.deviceInfo);
        console.log(isMobile);  // returns if the device is a mobile device (android / iPhone / windows-phone etc)
        console.log(isTablet);  // returns if the device us a tablet (iPad etc)
        console.log(isDesktopDevice); // returns if the app is running on a Desktop browser.
    }*/

}
