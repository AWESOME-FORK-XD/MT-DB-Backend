require('dotenv').config();
const AWS = require('aws-sdk');
let sesv2 = new AWS.SESV2();

const appName = "ProductDB";
const sesVerifiedEmailAddress = "info@medten.com";

const templates = {

  ResetPassword: {
    TemplateName: `${appName}-ResetPassword`,
    TemplateContent: {
      Subject: `Set your ${appName} Password`,
      
      Html: `<p>Hello {{first_name}},</p>
  <p>You can set your password by following this link or pasting it in a browser:</p>
  <hr/>
  {{reset_password_base_url}}/{{reset_password_token}}
  <hr/>
  <p>This link will expire in one hour.<br/></p>
  <p>If you were not expecting this message or have other concerns, please contact us anytime by replying to this email.</p>
  <p><br/>-${appName} Support</p>`,
  
      Text: `Hello {{first_name}},
  You can set your password by following this link or pasting it in a browser:
  - - - - -
  {{reset_password_base_url}}/{{reset_password_token}}
  - - - - -
  This link will expire in one hour.
  
  If you were not expecting this message or have other concerns, please contact us anytime by replying to this email.
  -${appName} Support`
    }
  },

};

let templateBase = "ResetPassword";

(async (base)=>{
  try{
    let t = null;
    let actualName = `${appName}-${base}`;
    console.log(`deleting template ${actualName}`);
    await deleteTemplate(actualName);
    

    console.log('Creating new template...');
    t = await createTemplate(templates[base]);

    // t = await sendEmail(name);
    console.log(t);
    console.log('Done.');
  }catch(ex){
    console.error(ex);
  }
})(templateBase);

async function sendEmail(name){
  let template_data = {
    first_name : "Tester",
    reset_password_link : `http://localhost:3000/test`
  }; 
  
  return await sesv2.sendEmail({
    Content: {
      Template: {
        TemplateName: name,
        TemplateData: JSON.stringify(template_data)
      }
    },
    Destination: {
      ToAddresses: [ 'success@simulator.amazonses.com','test@apigrate.com' ]
    }, 
    FromEmailAddress: sesVerifiedEmailAddress,
    ReplyToAddresses: [ sesVerifiedEmailAddress ]
  }).promise();
}


async function lookupTemplate(name){
  try{
    return await sesv2.getEmailTemplate({TemplateName: name}).promise();
    
  }catch(ex){
    if(ex.code==='NotFoundException'){
      return null;
    }
    throw ex;
  }
}

async function createTemplate(theTemplate){
  try{
    return await sesv2.createEmailTemplate(theTemplate).promise();
    
  }catch(ex){
    if(ex.code==='NotFoundException'){
      return null;
    }
    throw ex;
  }
}

async function deleteTemplate(name){
  try{
    return await sesv2.deleteEmailTemplate({TemplateName: name}).promise();
    
  }catch(ex){
    if(ex.code==='NotFoundException'){
      return null;
    }
    throw ex;
  }
}