import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';
import {environment} from '../../environments/environment';

@Injectable({
    providedIn: 'root'
    
})
export class AuthGuard extends KeycloakAuthGuard {
    constructor(
        protected readonly router: Router,
        protected readonly keycloak: KeycloakService
    ) {
        super(router, keycloak);
    }

    public async isAccessAllowed(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean> {
        if(!this.authenticated) {
            await this.keycloak.login({
                // hard coded host
                redirectUri: environment.Keycloak_RedirectUri + "/" + state.url
            });
        }
        
        const requiredRoles = route.data.roles;

        if(!(requiredRoles instanceof Array) || requiredRoles.length == 0) {
            return true;
        }

        return requiredRoles.every((role) => this.roles.includes(role));
    }
}