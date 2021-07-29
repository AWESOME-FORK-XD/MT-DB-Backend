const debug = require('debug')('app:security');
const bcrypt = require('bcryptjs');
const {v4: uuid} = require('uuid');
const moment = require('moment');
const {SESV2} = require('aws-sdk');
const Joi = require('joi');
let emailService = new SESV2();

// Password parameters
const PASSWORD_VALIDATION_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,100}$/;
const PASSWORD_SALT_ROUNDS = 14;

// Other parameters
const MAX_BAD_LOGINS = process.env.MAX_BAD_LOGINS || 5;

// for sanitizing user data returned to UI.
const ALLOWED_USER_PROPERTIES = [
  'id',
  'username',
  'first_name',
  'last_name',
  'email',
  'mobile_phone',
  'status',
  'roles',
  'last_login',
  'default_account_id',
  'email_verified',
  'reset_password_token',
  'must_reset_password',
  'timezone',
  'login_count',
  'bad_login_attempts'
];
/**
 * An Authorization service providing login, logout, password-reset, and email verification functions.
 */
class AuthService {
  /**
   * @constructor
   * @param {object} daoFactory an object with User(), UserRole(), and Acccount() 
   * methods for accessing the appropriate database tables. The data access objects (DAOs)
   * should be instances of @apigrate/dao Dao class.
   */
  constructor(daoFactory){
    //Check global configuration and throw errors if stuff is missing.
    if(!process.env.SUPPORT_EMAIL_ADDRESS){ throw new Error(`"SUPPORT_EMAIL_ADDRESS" environment variable is not configured.`); }
    // if(!process.env.EMAIL_VERIFICATION_TEMPLATE){ throw new Error(`"EMAIL_VERIFICATION_TEMPLATE" environment variable is not configured.`); }  // self reg not relevant
    if(!process.env.RESET_PASSWORD_TEMPLATE){ throw new Error(`"RESET_PASSWORD_TEMPLATE" environment variable is not configured.`); }
    // if(!process.env.EMAIL_VERIFICATION_BASE_URL){ throw new Error(`"EMAIL_VERIFICATION_BASE_URL" environment variable is not configured.`); } // self reg not relevant
    if(!process.env.RESET_PASSWORD_BASE_URL){ throw new Error(`"RESET_PASSWORD_BASE_URL" environment variable is not configured.`); }
    this.db = daoFactory;
    this.userDao = this.db.getDao('user');
    this.userRoleDao = this.db.getDao('user_role');
  }

  /**
   * Handles the initial process for a self-registering user.
   * 0. validates required fields (email, password, username), throwing a RegistrationError
   *    on any failed validations.
   * 1. creates the user
   *    - set first_name
   *    - set last_name 
   *    - set email
   *    - set username (defaults to email)
   *    - set status pending
   *    - set email_verification_token = uuidv4
   *    - set email_verification_token_expires = 1 hour from now
   *    (Note, the password is not set.) This is handled after email verification.
   * 2. if a default role name is provided, creates a user role for the user
   * 3. send email verification email containing the verification link with token
   * 
   * @param {object} user 
   * @param {string} user.username (optional, defaults to email)
   * @param {string} user.first_name (optional, but recommended)
   * @param {string} user.last_name (optional, but recommended)
   * @param {string} user.email (required)
   * @param {string} role_name (optional) role the user will be assigned initially
   * @returns {object} the user with the aforementioned modifications.
   */
  async handleUserSelfRegistration(user, role_name){
    try{
      if(!user.email ){
        throw new RegistrationError("No email address was provided.");
      } else {
        if(Joi.string().email().validate(user.email).error){
          throw new RegistrationError("The email address is not valid.");
        }
      }
      if(!user.username){
        //If empty, username defaults to the email address.
        user.username = user.email;
      }
      if(user.username.length<8){
        console.error("The username is too short.");
        throw new RegistrationError("The username is too short.");
      }
      // if(!PASSWORD_VALIDATION_REGEX.test(user.password)){
      //   console.error("Password does not meet complexity requirements.");
      //   throw new RegistrationError("The password does not meet complexity requirements.");
      // } else {
      //   //password comes in as plaintext. hash it before saving.
      //   user.password = await this.hashPassword(user.password);
      // }

      // Set status to pending, and set up email verification...
      user.status = 'pending';
      user.email_verification_token = uuid();
      user.email_verification_token_expires = moment().add(1, "hour").format('YYYY-MM-DD HH:mm:ss');

      // create the user
      
      user = await this.userDao.create(user);

      if(role_name){
        await this.userRoleDao.create({
          user_id: user.id,
          role: role_name
        });

      }
      // send a verification email. 
      await this.sendVerificationEmail(user.email);
      
      return user;

    }catch(err){
      console.error(err);
      if(err.message.includes("username_UNIQUE")){
        throw new RegistrationError("Username/email must be unique.");
      } else {
        throw new RegistrationError("Unable to register user. Internal error.");//leave vague
      }
    }
  }

  /**
   * Logs in a user and creates a session in the database.
   * @param {string} username the user name (from a login form)
   * @param {string} password the plaintext password to be verified
   * @returns a sanitized user object, including user role information, if available.
   * @throws LoginError when unable to login for any reason.
   */
  async login(username, password){
    try{
      if( !username || !password ){
        debug('credentials failed requirements');
        throw new LoginError("Incorrect credentials.");
      }
      
      let user = await this.userDao.one({username: username});
      if(!user){
        debug('user was not found');
        throw new LoginError("Incorrect credentials.");
      }
  
      if(!user.password){
        throw new LoginError("Please reset your password.");
      }

      if( !bcrypt.compareSync(password, user.password) ){
        debug('password is invalid');
        //increment bad logins.
        user.bad_login_attempts++;
        
        //deactivate user if too many
        if(user.bad_login_attempts >= MAX_BAD_LOGINS ){
          debug('user has exceeded bad login limit');
          user.status = "suspended";

          await this.userDao.update(user);

          throw new LoginError("Maximum allowed attempts exceeded.");
        } else {
          await this.userDao.update(user);//save bad login count

          throw new LoginError("Incorrect credentials.");
        }
      }
  
      if( !['pending','active'].includes(user.status) ){
        debug('user is suspended');
        throw new LoginError("User is suspended.");
      }
  
      //Successful login...
      debug('Login OK.');
        
      //reset bad logins
      user.bad_login_attempts = 0;
      user.last_login = moment().utc().format('YYYY-MM-DDTHH:mm:ss');
      user.login_count += 1;
      await this.userDao.update(user);

      //Lastly get the roles for the user if any. 
      let user_roles = await this.userRoleDao.filter({user_id: user.id});
      user.roles = user_roles && user_roles.length > 0 ? user_roles.map(ur=>{return ur.role;}) : [];
 
      user = this.sanitizeUser(user);
      return user;
      
    }catch(ex){
      if(ex instanceof LoginError) throw ex;

      console.error(`Error. ${ex.message}`);
      console.error(ex);
      throw new LoginError("Unable to login.");
    }
  }

  /**
   * Utility that hashes a plaintext string so it can be stored as a password.
   * @param {string} plaintext string to be hashed
   * @returns {string} hashed password
   */
  async hashPassword(plaintext){
    return await bcrypt.hash(plaintext, PASSWORD_SALT_ROUNDS);
  }


  /**
   * Sends an email to verify a registered users' email account.
   * @param {string} email 
   * @throws Error when email is missing, or no user is found with a matching email.
   * For security reasons, do not report errors back to the user interface.
   */
  async sendVerificationEmail(email){
    if(!process.env.EMAIL_VERIFICATION_TEMPLATE){
      throw new Error("Please configure an email verification template.");
    }
    if(!email){
      debug('no email detected');
      throw new AuthError("No email provided.");
    }
    try{
      let user = await this.userDao.one({email});
      if(!user){
        throw new AuthError("No user provided.");
      }
  
      debug('generating email verification token...');
      user.email_verification_token = uuid();
      user.email_verification_token_expires = moment().add(1, 'hour');
      await this.userDao.update(user);
  
      
      let template_data = {
        first_name : user.first_name || "User",
        verification_link : spliceTokenIntoUrl(process.env.EMAIL_VERIFICATION_URL, user.email_verification_token )
      }; 
      
      await emailService.sendEmail({
        Content: {
          Template: {
            TemplateName: process.env.EMAIL_VERIFICATION_TEMPLATE,
            TemplateData: JSON.stringify(template_data)
          }
        },
        Destination: {
          ToAddresses: [ email ]
        }, 
        FromEmailAddress: process.env.SUPPORT_EMAIL_ADDRESS,
        ReplyToAddresses: [ process.env.SUPPORT_EMAIL_ADDRESS ]
      }).promise();
      
      debug('email verification message sent.');
      
      return;
      
    }catch(ex){
      console.error(ex);
      console.error(`Error processing email verification request. ${ex.message}`);
      throw ex;
    }
   
  }


  /**
   * Sends an email with a link where the user can reset his password.
   * @param {string} email 
   * @throws Error when email is missing, or no user is found with a matching email.
   * For security reasons, do not report errors back to the user interface.
   */
  async sendResetPasswordEmail(email){
    if(!process.env.RESET_PASSWORD_TEMPLATE){
      throw new Error("Please configure a reset password template.");
    }
    if(!email){
      debug('no email detected');
      throw new AuthError("No email provided.");
    }
    try{
      let user = await this.userDao.one({email});
      if(!user){
        throw new AuthError("No user provided.");
      }

      debug('generating reset password token...');
      
      user.reset_password_token = uuid();
      user.reset_password_token_expires = moment().add(1, 'hour');
      await this.userDao.update(user);
  
      let template_data = {
        first_name : user.first_name || "User",
        reset_password_token : user.reset_password_token,
        reset_password_base_url : process.env.RESET_PASSWORD_BASE_URL,
      };
      
      await emailService.sendEmail({
        Content: {
          Template: {
            TemplateName: process.env.RESET_PASSWORD_TEMPLATE,
            TemplateData: JSON.stringify(template_data)
          }
        },
        Destination: {
          ToAddresses: [ email ]
        }, 
        FromEmailAddress: process.env.SUPPORT_EMAIL_ADDRESS,
        ReplyToAddresses: [ process.env.SUPPORT_EMAIL_ADDRESS ]
      }).promise();
  
      debug('reset-password message sent.');
      
      return;
      
    }catch(ex){
      console.error(ex);
      console.error(`Error processing reset-password request. ${ex.message}`);
      throw ex;
    }
   
  }

  /**
   * Resets a users' password, when the user is known and trusted.
   * @param {object} user the user itself to reset.
   * @param {string} password the requested new password
   * @throws Error when there are problems resetting the password. If error is an AuthError,
   * the message can be considered safe to show the user.
   */
  async resetPasswordByUser(user, password){
    try{
      debug('Resetting password...');
      if(!password){
        console.error("No password.");
        throw new AuthError('Unable to set password.');
      }
  
      //Validate the password.
      if(!PASSWORD_VALIDATION_REGEX.test(password)){
        console.error("Password does not meet complexity requirements.");
        throw new AuthError("The password does not meet complexity requirements.");
      }

      if(!user || user.status === 'deleted'){
        console.error("No user, or user marked for deletion.");
        throw new AuthError("Unable to set password.");
      }
  
      //Validate the token.
      var tokenExpiration = moment(user.reset_password_token_expires);
      if(tokenExpiration.isBefore(moment())){
        console.error("Old token.");
        throw new AuthError("Unable to set password using the entered info.");
      }
  
      if( user.password && bcrypt.compareSync(password, user.password) ){
        console.error("Password must not match the existing password.");
        throw new AuthError("The password does not meet security requirements.");
      }
  
      let hashedPass = await this.hashPassword(password);
      //Reset counters, clear the token
      user.password = hashedPass;
      user.must_reset_password = false;
      user.reset_password_token = null;
      user.reset_password_token_expires = null;
      user.email_verified = true;
      user.email_verification_token = null;
      user.email_verification_token_expires = null;
      user.bad_login_attempts = 0;
      user.status = 'active';
      await this.userDao.update(user);
  
      return;
  
    }catch(ex){
      console.error(ex);
      console.error(`Error setting password. ${ex.message}`);
      throw ex;
    }
  }


  /**
   * Resets a users' password, completing the reset-password process.
   * @param {string} token the reset_password_token issued from the reset-password request. 
   * The email_verification_token can also be used as a fallback (the reset_password_token is 
   * checked first). 
   * @param {string} password the requested new password
   * @throws Error when there are problems resetting the password. If error is an AuthError,
   * the message can be considered safe to show the user.
   */
  async resetPasswordByToken(token, password){
    debug('Resetting password...');
    if(!token || !password){
      console.error("No token or no password on the request.");
      throw new AuthError('Unable to set password.');
    }
   
    let user = await this.userDao.one({reset_password_token: token});
    if(user){
      if(!user.reset_password_token_expires || moment(user.reset_password_token_expires).isBefore()){
        throw new AuthError('Your link has expired. Please request a new password-reset link.');
      }
    } else {
      user = await this.userDao.one({email_verification_token: token});
      if(user){
        if(!user.email_verification_token_expires || moment(user.email_verification_token_expires).isBefore()){
          throw new AuthError('Your link has expired. Please request a new password-reset link.');
        }
      }
    }
    
    if(!user || user.status === 'deleted'){
      console.error("No user, or user marked for deletion.");
      throw new AuthError("Unable to set password.");
    }

    return this.resetPasswordByUser(user, password);
  }

  /**
   * Retrieves a user (and its roles) by id, but sanitizes the user entity so 
   * no sensitive information is included.
   * @param {number} user_id 
   * @returns a user with `roles` array if found. `null` if not found.
   */
  async getSanitizedUser(user_id){
    try{
      //Lastly get the roles for the user if any. 
      let user =  await this.userDao.get(user_id);
      if(!user) return null;

      let user_roles = await this.userRoleDao.filter({user_id: user_id});
      user.roles = user_roles && user_roles.length > 0 ? user_roles.map(ur=>{return ur.role;}) : [];
  
      //Sanitize the user.
      user = this.sanitizeUser(user);
      
      return user;
    }catch(ex){
      console.error(ex);
    }
  }

  /**
   * Sanitizes the given user, removing any sensitive information (password, tokens, etc.)
   */
  sanitizeUser(user){
    for(let prop in user){
      if(!ALLOWED_USER_PROPERTIES.includes(prop)) delete user[prop]; 
    }
    return user;
  }

  /**
   * Confirms the user's email is verified. Once verified, the user is updated and the
   * user's other email verification settings are cleared.
   * @param token the email verification token
   * @returns {object} user containing the email_verified flag indicating whether the email was verified or not.
   * If the user is not found, the method returns null;
   */
  async confirmUserEmailIsVerified(token){
    //Verify the token again. It should be on the body.
    let user = await this.userDao.one({email_verification_token: token});
    if(!user){
      return null;
    }

    user.email_verified = true;
    user.email_verification_token = null;
    user.email_verification_token_expires = null;
   
    //If the user has never logged in before, force a password reset.
    if(!user.last_login && user.status === 'pending'){
      user.must_reset_password = true;
      user.reset_password_token = uuid();
      user.reset_password_token_expires = moment().add(1, 'hour');
    }
    await this.userDao.update(user);

    return this.sanitizeUser(user);
  }

}//class

/**
 * Inserts a token as a query parameter to a raw url string.
 * This handles cases where the URL contains a hash character and the query string must come before the hash.
 * @param {string} rawurl A url string
 * @param {string} token A token to insert as query parameter.
 */
function spliceTokenIntoUrl(rawurl, token){
  if(!token) return rawurl;
  let newurl = '';
  if(rawurl.includes("#")){
    newurl = rawurl.substring(0, rawurl.indexOf("#")) +  `?token=${encodeURIComponent(token)}` + rawurl.substring(rawurl.indexOf("#"));
  } else {
    newurl = rawurl;
  }
  return newurl;
}
/** Use for registration errors. Error message will be displayed to user. */
class RegistrationError extends Error {} //when registration fails
class AuthError extends Error{} //generic error during any authentication/authorization attempt
class LoginError extends AuthError{} //when login fails
exports.RegistrationError = RegistrationError;
exports.AuthService = AuthService;
exports.AuthError = AuthError;
exports.LoginError = LoginError;