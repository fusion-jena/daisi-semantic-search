import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class IpifyService {

  constructor(private http: HttpClient) { }
  url = environment.ipifyUrl;

  getIPaddressFromBrowser(): any {
        //const headers: { 'Content-Type': string } = {'Content-Type': 'application/json'};
        return this.http.get(this.url);
    }
}
