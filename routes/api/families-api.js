var express = require('express');
var router = express.Router({ mergeParams: true });
const {CriteriaHelper} = require('@apigrate/dao');
let { create,  fetchById, fetchMany, parseQueryOptions, resultToJson, updateById } = require('@apigrate/dao/lib/express/db-api');
const {  fetchManySqlAnd,  resultToAccept, resultToJsonDownload} = require('./db-api-ext');
const {parseAdvancedSearchRequest} = require('./common');
const authenticated = require('../middleware/authenticated');
const _ = require('lodash');
const debug = require('debug')('gr8:db');


const ALLOWED_SEARCH_PARAMETERS = [
  'id',
  'family_connector_code',
  'family_code',
  'group_id',
  'group_code',
  'image_type_id',
  'image_link_connector_distal',
  'name_en',
  'created',
  'updated',
  'search_term',
  'search_term_fields',

  // from product join
  'oem_brand_en'
];

const SEARCH_FILTERS = {
  "oem_brand": {
    join_table: "v_product",
    join_column: "family_id",
    where_column: "oem_brand_id",
  },
  "product_type": {
    join_table: "v_product",
    join_column: "family_id",
    where_column: "product_type_id",
  },
  /* These are special cases that are actually handled thru search term functionality
  "oem brand en": {
    join_table: "v_product",
    join_column: "family_id",
    where_column: "oem_brand_en",
  },
  "category en": {
    join_table: "v_product",
    join_column: "family_id",
    where_column: "category_en",
  },
  */
};

/** Query for families */
router.get('/', parseQueryOptions(ALLOWED_SEARCH_PARAMETERS, ['+family_code', '+id'], 1000), 
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('family_view'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options,
      with_total: true,
    };
    next();
    
  }, fetchMany, resultToJson);


let parseFamilyAdvancedSearchRequest = async function(req, res, next){
  let payload = {};
  Object.assign(payload, req.body);
  
  try{
    let familyViewDao = req.app.locals.database.getDao('family_view');
    await familyViewDao.loadMetadata();

    //Which columns are output...
    let family_view_columns = familyViewDao.metadata.map(meta=>`f.${meta.column}`).join(',');

    //Special case - must come before other criteria assembly.
    let join_parms = [];
    let category_join_criteria = ``;
    if(payload.category_id){
      if( _.isArray(payload.category_id) ){
        if( payload.category_id.length > 0 ){
          category_join_criteria = `AND p.category_id IN(?) `;
          join_parms.push(payload.category_id);
        }
      } else {
        category_join_criteria = `AND p.category_id=? `;
        join_parms.push(payload.category_id);
      }
    }
    
    let criteria = new CriteriaHelper({omitIfEmpty: false}); // useful for building WHERE clause

    //search term criteria
    if(payload.search_term && payload.search_term_fields){
      criteria.andGroup();
      for(let field_name of payload.search_term_fields){
        if(ALLOWED_SEARCH_PARAMETERS.includes(field_name)){
          if(['oem_brand_en'].includes(field_name)){ // product join
            criteria.or(`p.${field_name}`, 'LIKE', `%${payload.search_term}%`);
          } else { // otherwise family 
            criteria.or(`f.${field_name}`, 'LIKE', `%${payload.search_term}%`);
          }
        }
      }
      criteria.groupEnd();
      delete payload.search_term_fields;
      delete payload.search_term;
    }
    
    //Done building the where.

    // parse options clause
    let optsclause = ``;
    if(payload.order_by && payload.order_by.length>0){
      optsclause += ` ORDER BY`;
      let tmp = ``;
      payload.order_by.forEach(col=>{
        let order = 'ASC';
        if(col.startsWith('+')){
          col = col.substring(1);
        } else if (col.startsWith('-')){
          col = col.substring(1);
          order = 'DESC';
        }
        if( ALLOWED_SEARCH_PARAMETERS.includes(col) ){
          if(tmp) tmp += ',';
          tmp += ` ${col} ${order}`;
        }
      });
      optsclause += tmp;
    }
    if(payload.limit && _.isFinite(payload.limit)){
      if(payload.limit < 0 || payload.limit > 100000){
        payload.limit = 100000;
      }
      optsclause += ` LIMIT ${payload.limit}`;
    }
    if(payload.offset && _.isFinite(payload.offset)){
      if(payload.offset < 0 || payload.offset > 100000){
        payload.offset = 100000;
      }
      optsclause += ` OFFSET ${payload.offset}`;
    }

    let qs =  `select DISTINCT ${family_view_columns} FROM v_family f LEFT OUTER JOIN v_product p ON p.family_id = f.id ${category_join_criteria} `;
    let count_qs = `select count(DISTINCT(f.id)) as count FROM v_family f LEFT OUTER JOIN v_product p ON p.family_id = f.id ${category_join_criteria} `;
    let where = '';
    if(criteria.whereClause){
      where = `WHERE ${criteria.whereClause}`;
    }
    let fullQuery = `${qs} ${where} ${optsclause}`;
    let fullCountQuery = `${count_qs} ${where}`;

    let allparms = join_parms.concat(criteria.parms);
    res.locals.dbInstructions = {
      exclude_columns_on_output: null,
      dao: req.app.locals.database.getDao('family_view'),
      sql: {
        statement: fullQuery,
        parms: allparms,
      },
      sql_count: {
        statement: fullCountQuery,
        parms: allparms,
      }
    };
    
    debug(`derived advanced search: %o`, res.locals.dbInstructions.sql);
    next(); 
  } catch (ex){
    console.error(ex);
    res.status(400).json({
      message:`Unable to parse search.`,
      error: ex.message
    });
  }
}

/** 
 * Query for equipment using an advanced search.
 * 
 * Expected body:
 * @example 
 * {
 *   search_term: "140B",
 *   search_term_fields: ["family_code", "family_connector_code"],
 *   order_by: ["family_code"],
 *   limit: 10,
 *   offset: 0
 * }
 * In this example, the family_code and family_connector_code fields will be wildcard searched for "140B", and the other 
 * criteria on the search payload will be used to further filter the selection.
 * 
*/
router.post('/search', parseFamilyAdvancedSearchRequest, fetchManySqlAnd, resultToAccept);
router.post('/search/download', authenticated(), parseFamilyAdvancedSearchRequest, fetchManySqlAnd, resultToJsonDownload);

/** Get a single family. */
router.get('/:family_id', function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('family_view'),
    id: req.params.family_id
  };
  next();

}, fetchById, resultToJson);


/** Create a family */
router.post('/', authenticated(), function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('family'),
    toSave: entity
  };
  next();

}, create, resultToJson);


/** Update a family */
router.put('/:family_id', authenticated(), function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('family'),
    toUpdate: entity
  };
  next();

}, updateById, resultToJson);


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
