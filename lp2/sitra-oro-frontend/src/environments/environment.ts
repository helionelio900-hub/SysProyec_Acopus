export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8081',
  backendUrl: 'http://localhost:8081',
  keycloak: {
    issuer: 'http://localhost:38081/realms/Sitra_oro',
    clientId: 'sitra-oro-frontend',
    redirectUri: 'http://localhost:4200/auth/callback',
    scope: 'openid profile email',
  },
  keycloakUrl: 'http://localhost:38081/realms/Sitra_oro/protocol/openid-connect/token',
  keycloakClientId: 'sitra-oro-frontend',
  tokenLifespanSeconds: 300,
  tokenLifespanDemoSeconds: 30,
};
