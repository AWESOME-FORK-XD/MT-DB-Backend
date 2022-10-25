const debug = require("debug")("app:security");
const jwt = require('jsonwebtoken');
const MEDTEN_CUSTOMER_ID = 1;
if(!process.env.JWT_SECRET){ throw new Error("JWT_SECRET environment variable is required."); }
/**
 * Middleware for detecting the customer "through which" the site is being viewed.
 * 
 * This is done by checking for a JWT containing encoded customer information.
 * 
 * If the JWT parse fails or does not contain expected information, the default medten customer will be used.
 *
 * Sets the `res.locals.customer_id` property with the appropriate customer id.
 */
module.exports = ()=>{

  return function (req, res, next) {
    try {
      debug("Checking customer...");
        
      let token = req.get("Authorization");
      if(!token){
        token = req.query.token;//allow to be specified in url for certain cases (reports).
      } else {
        let tmp = token.split(" ", 2);
        if(!tmp || tmp.length !== 2) { 
          debug("Invalid header (# of tokens).");
          res.locals.customer_id = MEDTEN_CUSTOMER_ID;
          return;
        } //Invalid header.
        if(tmp[0] !== "Bearer") { 
          debug("Invalid header (type of auth).");
          res.locals.customer_id = MEDTEN_CUSTOMER_ID;
          return;
        } //Invalid header
        token = tmp[1];
      }  
      
      if(!token) { 
        debug("No header or authorization token could be found.");
        res.locals.customer_id = MEDTEN_CUSTOMER_ID;
        return; 
      } //No header.

      let verified_jwt = jwt.verify(token, process.env.JWT_SECRET);
      console.log(verified_jwt.customer.company_name);
      res.locals.customer_id = verified_jwt.customer.id;

    } catch (err) {
      console.error(err);
      res.locals.customer_id = MEDTEN_CUSTOMER_ID;

    } finally {
      next();
    }
  
  
  };
};
