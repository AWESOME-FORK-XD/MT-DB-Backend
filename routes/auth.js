const express = require('express');
const router = express.Router();
const {LoginError,AuthError} = require('../services/auth-service');
const debug = require("debug")("app:routes");
const jwt = require("jsonwebtoken");

if(!process.env.JWT_SECRET ) throw new Error(`JWT_SECRET environment variable is required.`);
   
// Show the login screen
router.get('/login', async function(req, res, next){
  debug(`Login screen...`); 
  res.render('login');
});

// Perform the login.
router.post('/login', async function(req, res, next){ 
  try {
    
    debug(`Handling login...`);
    if(!req.body.username || !req.body.password){
      res.status(401).json({message: "A username and password are required."});
      return;
    }

    let user = await res.app.locals.authService.login(req.body.username, req.body.password);

    //Now authenticated. Gather additional authorization information...
    let user_orgs = await res.app.locals.database.getDao("user_org").filter({user_id: user.id});
    
    let org_ids = user_orgs.map(uo=>{ return uo.org_id; });
    
    let payload = {user, org_ids};

    // Assign default org.
    let default_user_org = user_orgs.find(uorg=>{return uorg.is_default; });
    if(default_user_org){
      let org = await res.app.locals.database.getDao("org").get(default_user_org.org_id);
      if(org){
        payload.org = org;
      }
    }

    // Issue a JWT
    let token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1 days', 
      issuer: req.hostname,
      audience: req.hostname,
    });
    
    res.status(200).json({token});

  }catch(ex){
    if(ex instanceof LoginError){
      res.status(401).json({message: "Unable to login.", error: ex.message});
    } else {
      console.error(ex);
      res.status(401).json({message: "Unable to login."});
    }
  }
});


/**
 * Initiates password-reset email process.
 */
router.post('/forgot-password', async function(req, res, next){ 
  let payload = {
    message: "An email with instructions has been sent to your account if it exists in our records.",
    complete: true,
  };
  try {
    debug(`Handling forgot-password request...`);
    if(!req.body.email){
      res.status(400).json({message: "No email was provided.", complete: false});
      return;
    }

    await res.app.locals.authService.sendResetPasswordEmail(req.body.email);
    res.status(200).json(payload);

  }catch(ex){
    console.error(ex);
    res.status(400).json({message: "Password cannot currently be reset.", complete: false});
  }
});


// Finish resetting the password.
router.post('/reset-password', async function(req, res, next){ 
  let payload = {
    complete: false,
  };
  try {
    debug(`Handling reset-password request...`);
    await res.app.locals.authService.resetPasswordByToken(req.body.token, req.body.password);
    payload.complete = true;
    payload.message = "Password saved.";
    res.status(200).json(payload);
  }catch(ex){
    console.error(ex);
    if(ex instanceof AuthError){
      payload.message = ex.message;
    } else {
      //Other errors should not expose details to end-user.
      payload.message = "Unable to set password.";
    }
    res.status(400).json(payload);
    
  }
});


/**
 * Verifies a user via email token validation, returning an email_verified boolean flag indicating success/failure.
 */
router.get('/verify/:token', async function(req, res, next) {

  try{
    if(!req.params.token){
      res.status(400).json({message: "Verification failed."});
      return;
    }
    
    let user = await res.app.locals.authService.confirmUserEmailIsVerified(req.params.token);
    if(user){
      res.status(200).json(user);
    } else {
      res.status(400).json({message: "Verification failed."});
    }

  }catch(err){
    console.error(err);
    res.status(500).json({message: "Verification failed.", error: "Server error."});
  } 
});


module.exports = router;