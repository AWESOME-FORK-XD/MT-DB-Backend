const debug = require("debug")("app:security");
/**
 * Authorization method. Restricts downstream access based on the user's role.
 * 
 * The user MUST have one role that matches ANY of the specified allowed roles,
 * otherwise a 403 response is issued.
 * 
 * If the user is missing, a 403 error is issued.
 * 
 * If the `allowed` parameter is empty or undefined, the request passes through.
 * 
 * @param {array} allowed allowed roles.
 */
const restrictToRoles = ( allowed )=>{
  return function (req, res, next) {
    try{
      debug(`Checking for roles: ${allowed?allowed.join(", "):'(any)'}`);
      if(!res.locals.user){
        debug(`No user found.`);
        return res.status(403).end();
      }
      
      if( !allowed || allowed.length === 0){
        debug(`Anyone is allowed.`);
        next();
        return;
      }
      
      let intersection = allowed.filter(allowed_role => res.locals.user.roles.includes(allowed_role));
      if(intersection.length > 0){
        next();
        debug("...passed");
        return;

      } else {
        debug(`Access denied. Access requires roles: ${allowed.join(", ")}`);
        return res.status(403).end();
      }
      
    }catch(ex){
      console.error(ex);
      return res.status(403).end();
    }
  };
};
exports.restrictToRoles = restrictToRoles;

/**
 * Checks downstream resources that are requested with an explicit org id 
 * when a non-`admin` role is used. This should always be used after the `authenticated()` middleware, as it
 * depends on locals that are set by that component.
 * 
 * Users with `admin` access simply pass through this check.
 * 
 * The request will be rejected with a 403 response if the requested org_id does not match
 * the user's org_id. The requested org_id is established with the following order of preference
 * 
 * 1. req.params
 * 2. req.query
 * 3. req.body
 * 
 */
const matchesOrg = (opts)=>{
  return function (req, res, next) {
    try{
      
      debug("Checking org match...");
      if(!res.locals.user){
        debug(`No user found.`);
        return res.status(403).end();
      }
      
      if(!res.locals.user.roles.includes("admin")){
        //Non-Admins require explicit org_id matching that of the user.
        let requested_org_id = 
          req.params.org_id ||
          req.query.org_id ||
          req.body.org_id ||
          null;

        if(!requested_org_id){
          next();
          debug("...passed");
          return;
        } 

        //Must match.
        if(requested_org_id != res.locals.user_org_id){
          debug(`Requested org id ${requested_org_id} does not match user org id ${res.locals.user_org_id}.`);
          res.status(403).end();
          return;
        }

        //Make org_id available downstream.
        res.locals.org_id = requested_org_id;
        next();
        debug("...passed");
        return;

      } else {
        //Admins pass through.
        next();
        debug("...passed");
        return;
      }

    }catch(ex){
      console.error(ex);
      return res.status(403).end();
    }
  };
};



exports.matchesOrg = matchesOrg;