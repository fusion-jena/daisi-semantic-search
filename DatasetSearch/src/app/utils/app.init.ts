import { KeycloakService } from 'keycloak-angular';
import {environment} from '../../environments/environment';

export function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
    return () =>
    keycloak.init({
        config: {
            url: environment.Keycloak_Url,
            realm: environment.Keycloak_Realm,
            clientId: environment.Keycloak_ClientId
        },
        initOptions: {
            //onLoad: 'check-sso',
            checkLoginIframe: true,
            checkLoginIframeInterval: 25
        },
        //loadUserProfileAtStartUp: true
    });
}