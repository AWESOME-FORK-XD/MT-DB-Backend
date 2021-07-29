const debug = require("debug")("aoa:security");
const jwt = require('jsonwebtoken');
if(!process.env.JWT_SECRET){ throw new Error("JWT_SECRET environment variable is required."); }
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
      if(req.params.realm_id){
        if(verified_jwt.realm && verified_jwt.realm.id != req.params.realm_id){
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
