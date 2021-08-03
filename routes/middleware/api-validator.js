const debug = require('debug')('app:validation');
/**
 * The validator middleware validates an entity expressed on either the body or the query
 * string. When the entity passes validation it is set on the `res.locals.validated_entity`
 * property. 
 * 
 * 
 * When it fails validation, a 422 error is returned with error details parsed JSON
 * following the form `{ error: "(object)", errors: [ {key: "(string)", error: "(string)"} ] }`.
 * 
 * @param {object} schema Joi schema to use when validating the request. 
 * @param {object} entity_name the name of the entity being validated
 * @param {string} property typically either 'body' or 'query' 
 */
const validator = function(schema, schema_name, property){ 
  return async function(req, res, next){ 
    let thing = null;
    if(property.includes('.')){
      let props = property.split('.');
      
      if(props.length > 2) {
        next(new Error("Property may not contain more than two tokens."));
        return;
      }
      thing = req[props[0]][props[1]];
    } else {
      thing = req[property];
    }
    let result = schema.validate(thing, {abortEarly: false, allowUnknown: true, convert: true}); //note, conversions are applied!
    let valid = (result.error == null); 
    if (valid) {
      //Set the validated entity as an available local variable.
      res.locals.validated_entity = result.value;
      next();
    } else {
      const { details } = result.error; 
      const errors = details.map(d => {
        let err= {
          key: d.context.key,
          error: d.message
        };
        return err;
      });
      debug(JSON.stringify(errors, null, 2));
      res.status(422).json({ message: `Invalid ${schema_name}.`, errors });
    }
  };
};
exports.apiValidator = validator;