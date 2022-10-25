const express = require('express');
const router = express.Router();
const debug = require("debug")("app:routes");
const jwt = require("jsonwebtoken");
const PARSE_ORIGIN_DOMAIN = /http[s]?:\/\/(?<domain>.*)/;
const MEDTEN_CUSTOMER_ID = 1;

if(!process.env.JWT_SECRET ) throw new Error(`JWT_SECRET environment variable is required.`);

/** 
 * Perform the "silent login" customer identification for public-facing access.
 */
router.post('/', async function(req, res, next){ 
  try {
    
    debug(`Handling customer identification...`);
    let origin = req.get('origin');
    let customer = null;
    
    if(origin){
      let result = PARSE_ORIGIN_DOMAIN.exec(origin);
      let origin_domain = result.groups.domain;
      debug(`...origin domain is ${origin_domain}`);
    
      customer = await res.app.locals.database.getDao("customer").one({origin: origin_domain});
    
    } else {
      debug('...no origin on request.')
    }

    if(!customer){
      // if no match, just default to medten.
      customer = await res.app.locals.database.getDao("customer").get(MEDTEN_CUSTOMER_ID);
    }

    let payload = {customer};

    // Issue a JWT
    let token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '365 days', 
      issuer: req.hostname,
      audience: req.hostname,
    });
    
    res.status(200).json({token});

  }catch(ex){
    console.error(ex);
    res.status(400).json({message: "Unable to identify."});
  }
});



module.exports = router;