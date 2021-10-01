var express = require('express');
var router = express.Router({ mergeParams: true });
let { create, fetchById, fetchMany, parseQueryOptions, resultToJson, saveAll, updateById } = require('@apigrate/dao/lib/express/db-api');
const { fetchManySqlAnd, resultToAccept, resultToJsonDownload} = require('./db-api-ext');
const {parseAdvancedSearchRequest} = require('./common');
const authenticated = require('../middleware/authenticated');


const ALLOWED_SEARCH_PARAMETERS = [
  'id', 
  'model', 
  'equipment_type_id',
  'type_en',
  'type_zh',
  'brand_id', 
  'brand_en', 
  'brand_zh',
  'is_oem',
  'created', 
  'updated',
  'search_term',
  'search_term_fields'
];


const SEARCH_FILTERS = {
  "brand": {
    where_column: "brand_id",
  },
  "equipment_type": {
    where_column: "equipment_type_id",
  },
  
};


/** Query for equipment */
router.get('/', parseQueryOptions(ALLOWED_SEARCH_PARAMETERS, ['+model', '+id'], 1000), async function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('equipment_view'),
    query_options: res.locals.query_options,
    query: res.locals.modified_query,
    with_total: true,
  };

  next();
  
}, fetchMany, resultToJson);


/** 
 * Query for equipment using an advanced search.
 * 
 * Expected body:
 * @example 
 * {
 *   search_term: "X3",
 *   search_term_fields: ["type_en", "model"],
 *   order_by: ["model"],
 *   limit: 10,
 *   offset: 0
 * }
 * In this example, the type_en and model fields will be wildcard searched for "X3", and the other 
 * criteria on the search payload will be used to further filter the selection.
 * 
*/
router.post('/search', async function (req, res, next) {
  
  let payload = {};
  Object.assign(payload, req.body);
  
  res.locals.dbInstructions = {
    searchable_columns: ALLOWED_SEARCH_PARAMETERS,
    filter_definitions: SEARCH_FILTERS,
    exclude_columns_on_output: null,
    search_payload: payload,
    dao: req.app.locals.database.getDao('equipment_view'),
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
    filter_definitions: SEARCH_FILTERS,
    exclude_columns_on_output: null,
    search_payload: payload,
    dao: req.app.locals.database.getDao('equipment_view'),
    sql: null,
    sql_count: null
  };
  
  next();
  
}, parseAdvancedSearchRequest, fetchManySqlAnd, resultToJsonDownload);


/** Get a single equipment. */
router.get('/:equipment_id', function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('equipment_view'),
    id: req.params.equipment_id
  };
  next();

}, fetchById, resultToJson);


/** Create equipment */
router.post('/', authenticated(), function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('equipment'),
    toSave: entity
  };
  next();

}, create);


/** Update equipment */
router.put('/:equipment_id', authenticated(), function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('equipment'),
    toUpdate: entity
  };
  next();

}, updateById, resultToJson);


// Get all equipment available regions
router.get('/:equipment_id/available_regions', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('equipment_available_region_view'),
    query: {equipment_id: req.params.equipment_id},
    //query_options: q.query_options
  };
  next();
}, fetchMany, resultToJson);


/** Save all equipment available regions. */
router.post('/:equipment_id/available_regions', authenticated(), function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('equipment_available_region'),
    toSave: req.body, //assuming an array of objects
    query: {equipment_id: req.params.equipment_id},
    comparison: function(obj){ return `${obj.available_region_id}`; }
  };
  next();
}, saveAll);


// Get all equipment available regions
router.get('/:equipment_id/images', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('equipment_image'),
    query: {equipment_id: req.params.equipment_id},
  };
  next();
}, fetchMany, resultToJson);


/** Save all equipment available regions. */
router.post('/:equipment_id/images', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('equipment_image'),
    toSave: req.body, //assuming an array of objects
    query: {equipment_id: req.params.equipment_id},
    comparison: function(obj){ return `${obj.image_link}`; }
  };
  next();
}, saveAll);


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
