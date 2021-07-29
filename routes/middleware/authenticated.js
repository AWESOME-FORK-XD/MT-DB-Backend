const debug = require("debug")("app:security");
const jwt = require('jsonwebtoken');
if(!process.env.JWT_SECRET){ throw new Error("JWT_SECRET environment variable is required."); }
/**
 * Middleware for verifying user is authenticated before allowing access to downstream route.
 * 
 * Verifies the JWT sent with Authorization header.
 * 
 * On positive authentication, sets the following for downstream components
 * 
 * - `res.locals.user` the authenticated user info
 * - `res.locals.org` the authenticated user's org 
 * - `res.locals.user_org_id` the id of the authenticated user's org
 * 
 * When the authentication validity fails, a 401 response is returned.
 * 
 * The middleware also performs a very simple organization-level authorization check. 
 * If the requested route contains an `org_id` route parameter and the org on the 
 * verified jwt does not match, a 403 response is returned.
 * 
 */
module.exports = ()=>{

  return function (req, res, next) {
    try {
      debug("Checking authentication...");
        
      let token = req.get("Authorization");
      if(!token){
        token = req.query.token;//allow to be specified in url for certain cases (reports).
      } else {
        let tmp = token.split(" ", 2);
        if(!tmp || tmp.length !== 2) { 
          debug("Invalid header (# of tokens).");
          res.status(401).end(); return; 
        } //Invalid header.
        if(tmp[0] !== "Bearer") { 
          debug("Invalid header (type of auth).");
          res.status(401).end(); return; 
        } //Invalid header
        token = tmp[1];
      }  
      
      if(!token) { 
        debug("No header or authorization token could be found.");
        res.status(401).end(); return; 
      } //No header.

      let verified_jwt = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.user = verified_jwt.user;
      res.locals.org = verified_jwt.org;
      
      // TODO: this might change with impersonation impl
      res.locals.user_org_id = verified_jwt.org.id;

      //Validate the org matches that in the URL
      if(req.params.org_id){
        if(verified_jwt.org && verified_jwt.org.id != req.params.org_id){
          res.status(403).end(); return;
        } else {
          //TODO: support impersonation
        }
      }

      //TODO: support impersonation
      debug("...passed");
      next();
    } catch (err) {
      console.error(err);
      res.status(401).end(); return;//verification failed.
    }
  
  
  };
};
