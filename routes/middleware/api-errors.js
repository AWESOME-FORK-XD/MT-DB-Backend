const { BaseServiceError, BaseServiceValidationError } = require('../services/base-service');

/** Default error handling middleware */
const handleApiErrors = function (err, req, res, next){
  if(err instanceof BaseServiceValidationError){
    res.status(400).json({message: err.message, errors: err.errors });
    return;
  } else if(err instanceof BaseServiceError){
    res.status(400).json({message: err.message, errors: err.errors});
    return;
  } else {
    res.status(500).json({message: "Server error.", error: err.message });
  }
};

exports.handleApiErrors = handleApiErrors;