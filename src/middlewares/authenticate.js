import { auth0Middleware, mintAuth0Token, verifyAuth0Token } from './auth0.js';

export { mintAuth0Token, verifyAuth0Token };

/**
 * Standard Authenticate Token middleware, now powered by Auth0 OIDC engine.
 */
export const authenticateToken = auth0Middleware;

export default authenticateToken;
