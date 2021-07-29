var express = require('express');
var router = express.Router({ mergeParams: true });
var _ = require('lodash');
let { fetchMany, parseQueryOptions, fetchById, updateById} = require('@apigrate/dao/lib/express/db-api');
const { fetchManySqlAnd, resultToJson } = require('./db-api-ext');
const { CriteriaHelper } = require('@apigrate/dao/lib/criteria-helper');

router.get('/available_regions', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name_en','id'], ['+name_en','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('available_region'),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/brands', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name_en','name_zh','id'], ['+name_en','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('brand'),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

/** Get a brand by id */
router.get('/brands/:brand_id', function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('brand'),
    id: req.params.brand_id
  }
  next();

}, fetchById);

/** Update a brand */
router.put('/brands/:brand_id', function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('brand'),
    toUpdate: entity
  }
  next();

}, updateById);


router.get('/categories', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name_en','id'], ["+parent_id","+id"], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('category_view'),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/certificates', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name_en','id'], ['+name_en','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('certificate'),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/custom_attributes', function (req, res, next) {
  let  q = parseQueryOptions(req, ['category_id','name_en','name_zh'], ['+category_id','+name_en'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('custom_attribute'),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/equipment_groups', function (req, res, next) {
  let  q = parseQueryOptions(req, ['id','equipment_id','model','group_id','group_code', 'created','updated'], ['+model','+group_code'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('equipment_group_view'),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/equipment_types', function (req, res, next) {
  let  q = parseQueryOptions(req, ['id','name_en','name_zh'], ['+name_en','+name_zh'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('equipment_type'),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/equipment_models', function (req, res, next) {
  let criteria = new CriteriaHelper();
  if(req.query.model_search){
    criteria.and('model', 'LIKE', `%${req.query.model_search}%`);
  }
  if(req.query.brand_id){
    criteria.and('brand_id', '=',  req.query.brand_id)
  } 
  
  let where= ``;
  if(criteria.whereClause){
    where= `WHERE ${criteria.whereClause}`;
  }

  let fullQuery = `select model, brand_id, brand_en, brand_zh from v_equipment ${where} group by model, brand_id, brand_en, brand_zh order by model asc`;
  let countQuery = `select count(distinct(model)) as count from v_equipment ${where}`;
  let sql = {
    statement: fullQuery,
    parms: criteria.parms
  };
  let sql_count = {
    statement: countQuery,
    parms: criteria.parms
  };

  res.locals.dbInstructions = {
    dao: req.app.locals.database.get('equipment_view'),
    sql: sql,
    sql_count: sql_count,
    collection_name: `equipment_models`
  };
  
  next();
}, fetchManySqlAnd, resultToJson);

router.get('/filter_option_views', function (req, res, next) {
  let  q = parseQueryOptions(req, ['category_id','filter_id','filter_option_id','filter_en','filter_zh','option_en','option_zh'], ['+filter_id','+filter_option_id'],  1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('filter_option_view'),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/filters', function (req, res, next) {
  let  q = parseQueryOptions(req, ['category_id','name_en','name_zh','id'], ['+name_en','+category_id','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('filter'),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/filters/options', function (req, res, next) {
  let  q = parseQueryOptions(req, ['filter_id','option_en','option_zh','id'], ['filter_id','+option_en','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('filter_option'),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);


router.get('/groups', function (req, res, next) {
  let  q = parseQueryOptions(req, ['id','group_code','created','updated'], ['+group_code','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('group'),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);


router.get('/image_types', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name','id'], ['+name','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('image_type'),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);


router.get('/lifecycles', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name_en','id'], ['+name_en','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('lifecycle'),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);


router.get('/marketing_regions', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name_en','id'], ['+name_en','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('marketing_region'),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);


router.get('/packaging_factors', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name','value','id'], ['+name','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('packaging_factor'),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);


router.get('/product-types', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name_en','id'], ['+name_en','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_type'),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);

router.get('/suppliers', function (req, res, next) {
  let  q = parseQueryOptions(req, ['name_en','name_zh','id'], ['+name_en','+id'], 1000);
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('supplier'),
    query: q.query,
    query_options: q.query_options
  }
  next();
}, fetchMany);


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
  })
})


module.exports = router;
