const debug = require("debug")("app:security");
// const jwt = require('jsonwebtoken');
const RX = /http[s]?:\/\/(?<domain>.*)/;
if(!process.env.JWT_SECRET){ throw new Error("JWT_SECRET environment variable is required."); }
/**
 * Middleware for detecting the origin (which will determine the customer "through which" the site is being viewed).
 * 
 * Sets the `res.locals.origin_domain` property with the origin domain
 */
module.exports = ()=>{

  return function (req, res, next) {
    try {
      debug("Checking origin...");
      

      let origin = req.get('origin');
      if(origin){
        let result = RX.exec(origin);
        res.locals.origin_domain = result.groups.domain;
        debug(`...origin domain is ${res.locals.origin_domain}`);
      
      } else {
        debug('...no origin on request.')
      }
      
    } catch (err) {
      console.error(err);

    } finally {
      next();
    }
  
  
  };
};
