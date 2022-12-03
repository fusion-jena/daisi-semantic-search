import {Component, OnInit } from '@angular/core';
import 'reflect-metadata';
import {Title} from '@angular/platform-browser';
import {KeycloakService} from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NodeService } from './services/remote/node.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
    public isLoggedIn = false;
    public userProfile: KeycloakProfile | null = null;

    deviceInfo = null;
    title = '[Dai:Si] - Dataset Search UI';
    user = '';
    indexes = [
       
        {
            key: 'biodiv1',
            link: 'biodiv1'
        },
        {
            key: 'biodiv2',
            link: 'biodiv2'
        }/*,
         {
            key: 'gfbio',
            link: 'gfbio'
        }*/
    ];

    constructor(private titleService: Title, private keycloakService: KeycloakService, private deviceService: DeviceDetectorService, private nodeService: NodeService) {
  
    }

    public setTitle(newTitle: string) {
        this.titleService.setTitle(newTitle);
    }

    private initializeUserOptions(): void {
        try{
            this.user = this.keycloakService.getUsername();
            this.keycloakService.loadUserProfile().then(profile => {
                console.log(profile.username);
                console.log(profile['attributes']); //gives you array of all attributes of user, extract what you need
            });
        }catch{
            this.user = null;
        }
        
    }

    public async ngOnInit() {
        this.titleService.setTitle(this.title);       
        this.initializeUserOptions();

        if (await this.keycloakService.isLoggedIn()) {
            this.userProfile = await this.keycloakService.loadUserProfile();
          }

        // this.isLoggedIn = await this.keycloakService.isLoggedIn();

        // if (this.isLoggedIn) {
        //     this.userProfile = await this.keycloakService.loadUserProfile();
        //     console.log(this.userProfile);
        // }
    }

    public login() {
        this.keycloakService.login();
      }
    
    public logout() {
        this.keycloakService.logout();
      }

    epicFunction() {
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
    }
}
