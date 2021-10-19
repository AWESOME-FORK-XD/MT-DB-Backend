var express = require('express');
var router = express.Router({ mergeParams: true });
let { create, fetchById, fetchMany, parseQueryOptions, resultToJson, saveAll, updateById} = require('@apigrate/dao/lib/express/db-api');
const { fetchManySqlAnd, resultToAccept, resultToJsonDownload} = require('./db-api-ext');
const {parseAdvancedSearchRequest} = require('./common');
const authenticated = require('../middleware/authenticated');

const ALLOWED_SEARCH_PARAMETERS = [
  'id', 
  'group_code',
  'created', 
  'updated', 
  'search_term',
  'search_term_fields'
];

/** Query for group */
router.get('/', parseQueryOptions(ALLOWED_SEARCH_PARAMETERS, ['+group_code', '+id'], 1000), 
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('group'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options,
      with_total: true,
    };
    
    next();
    
  }, fetchMany, resultToJson);


/** 
 * Query for groups using an advanced search.
 * 
 * Expected body:
 * @example 
 * {
 *   search_term: "028",
 *   search_term_fields: ["group_code"],
 *   order_by: ["group_code"],
 *   limit: 10,
 *   offset: 0
 * }
 * In this example, the group_code field will be wildcard searched for "028", and the other 
 * criteria on the search payload will be used to further filter the selection.
 * 
*/
router.post('/search', async function (req, res, next) {
  
  let payload = {};
  Object.assign(payload, req.body);
  
  res.locals.dbInstructions = {
    searchable_columns: ALLOWED_SEARCH_PARAMETERS,
    filter_definitions: null,
    exclude_columns_on_output: null,
    search_payload: payload,
    dao: req.app.locals.database.getDao('group'),
    sql: null,
    sql_count: null
  };
  
  next();
  
}, parseAdvancedSearchRequest, fetchManySqlAnd, resultToAccept);


/** @deprecated */
router.post('/search/download', authenticated(), async function (req, res, next) {
  
  let payload = {};
  Object.assign(payload, req.body);
  
  res.locals.dbInstructions = {
    searchable_columns: ALLOWED_SEARCH_PARAMETERS,
    filter_definitions: null,
    exclude_columns_on_output: null,
    search_payload: payload,
    dao: req.app.locals.database.getDao('group'),
    sql: null,
    sql_count: null
  };
  
  next();

}, parseAdvancedSearchRequest, fetchManySqlAnd, resultToJsonDownload);


/** Get a single group. */
router.get('/:group_id', function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('group'),
    id: req.params.group_id
  };
  next();

}, fetchById, resultToJson);


/** Create group */
router.post('/', authenticated(), function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('group'),
    toSave: entity
  };
  next();

}, create, resultToJson);


/** Update group */
router.put('/:group_id', authenticated(), function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('group'),
    toUpdate: entity
  };
  next();

}, updateById, resultToJson);


// Get all group equipment
router.get('/:group_id/equipment', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('equipment_group_view'),
    query: {group_id: req.params.group_id},
    //query_options: {limit: 100, orderBy: ["+"]}
  };
  next();
}, fetchMany, resultToJson);

/** Saves group equipment */
router.post('/:group_id/equipment', authenticated(), function (req, res, next) {
  if(!req.body){
    return res.status(400).json({message: "Invalid request.", error: "No data provided."});
  }
  req.body.forEach(eg=>{
    //Assign the group id from the param to make it consistent.
    eg.group_id = req.params.group_id;
  });

  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('equipment_group'),
    toSave: req.body, //assuming an array
    query: {group_id: req.params.group_id},
    comparison: function(v){ return v.equipment_id; }
  };
  next();
}, saveAll, resultToJson);


//Default error handling
router.use(function (err, req, res, next) {
  console.error(err);
  let errMessage = err.message;
  if (err.sqlState) {
    errMessage = 'Invalid data or invalid data relationship.';
  }
  res.status(500).json({
    message: "Unexpected error.",
    error: errMessage
  });
});


module.exports = router;
