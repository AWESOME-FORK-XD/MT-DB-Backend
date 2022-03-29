var express = require('express');
var router = express.Router({ mergeParams: true });
let { fetchMany, parseQueryOptions, fetchById, updateById, resultToJson} = require('@apigrate/dao/lib/express/db-api');
const { fetchManySqlAnd } = require('./db-api-ext');
const { CriteriaHelper } = require('@apigrate/dao/lib/criteria-helper');

router.get('/available_regions', 
  parseQueryOptions(['name_en','id'], ['+name_en','+id'], 1000),
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('available_region'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options
    };
    next();
  }, fetchMany, resultToJson);

router.get('/brands', 
  parseQueryOptions(['name_en','name_zh','id'], ['+name_en','+id'], 1000),
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('brand'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options
    };
    next();
  }, fetchMany, resultToJson);

/** Get a brand by id */
router.get('/brands/:brand_id', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('brand'),
    id: req.params.brand_id
  };
  next();

}, fetchById, resultToJson);

/** Update a brand */
router.put('/brands/:brand_id', function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('brand'),
    toUpdate: entity
  };
  next();

}, updateById, resultToJson);


router.get('/categories', parseQueryOptions(['name_en','id'], ["+parent_id","+id"], 1000),
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('category_view'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options
    };
    next();
  }, fetchMany, function(req, res, next){
    //decorate with path property
    let categories = res.locals.result.category_views;

    let ancestorChain = (me, chain)=>{
      if(!chain) chain = [];
      chain.push(me.id);
      let parent = categories.find(c => c.id == me.parent_id);
      if(!parent) return chain;
      return ancestorChain(parent, chain);
    }

    categories.forEach(c=>{
      c.path = ancestorChain(c).reverse();
    });

    res.locals.result.category_views = categories;

    next();
  }, resultToJson);

router.get('/certificates', parseQueryOptions(['name_en','id'], ['+name_en','+id'], 1000), 
  function (req, res, next) {
  
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('certificate'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options
    };
    next();
  }, fetchMany, resultToJson);

router.get('/custom_attributes', parseQueryOptions(['category_id','name_en','name_zh'], ['+category_id','+name_en'], 1000),
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('custom_attribute'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options
    };
    next();
  }, fetchMany, resultToJson);

router.get('/equipment_groups', parseQueryOptions(['id','equipment_id','model','group_id','group_code', 'created','updated'], ['+model','+group_code'], 1000),
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('equipment_group_view'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options
    };
    next();
  }, fetchMany, resultToJson);

router.get('/equipment_types', parseQueryOptions(['id','name_en','name_zh'], ['+name_en','+name_zh'], 1000),
    function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('equipment_type'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options
    };
    next();
  }, fetchMany, resultToJson);

router.get('/equipment_models', function (req, res, next) {
  let criteria = new CriteriaHelper();
  if(req.query.model_search){
    criteria.and('model', 'LIKE', `%${req.query.model_search}%`);
  }
  if(req.query.brand_id){
    criteria.and('brand_id', '=',  req.query.brand_id);
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
    dao: req.app.locals.database.getDao('equipment_view'),
    sql: sql,
    sql_count: sql_count,
    collection_name: `equipment_models`
  };
  
  next();
}, fetchManySqlAnd, resultToJson);

router.get('/filter_option_views', parseQueryOptions(['category_id','filter_id','filter_option_id','filter_en','filter_zh','option_en','option_zh'], ['+filter_id','+filter_option_id'],  1000),
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('filter_option_view'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options
    };
    next();
  }, fetchMany, resultToJson);

router.get('/filters', parseQueryOptions(['category_id','name_en','name_zh','id'], ['+name_en','+category_id','+id'], 1000), 
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('filter'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options
    };
    next();
  }, fetchMany, resultToJson);

router.get('/filters/options', parseQueryOptions(['filter_id','option_en','option_zh','id'], ['filter_id','+option_en','+id'], 1000),
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('filter_option'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options
    };
    next();
  }, fetchMany, resultToJson);


router.get('/groups', 
  parseQueryOptions(['id','group_code','created','updated'], ['+group_code','+id'], 1000), 
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('group'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options
    };
    next();
  }, fetchMany, resultToJson);

router.get('/image_types', parseQueryOptions(['name','id'], ['+name','+id'], 1000),
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('image_type'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options
    };
    next();
  }, fetchMany, resultToJson);


router.get('/lifecycles', parseQueryOptions(['name_en','id'], ['+name_en','+id'], 1000),
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('lifecycle'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options
    };
    next();
  }, fetchMany, resultToJson);


router.get('/marketing_regions', parseQueryOptions(['name_en','id'], ['+name_en','+id'], 1000), 
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('marketing_region'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options
    };
    next();
  }, fetchMany, resultToJson);


router.get('/packaging_factors', parseQueryOptions(['name','value','id'], ['+name','+id'], 1000),
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('packaging_factor'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options
    };
    next();
  }, fetchMany, resultToJson);


router.get('/product-types', parseQueryOptions(['name_en','id'], ['+name_en','+id'], 1000),
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('product_type'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options
    };
    next();
  }, fetchMany, resultToJson);

router.get('/suppliers', parseQueryOptions(['name_en','name_zh','id'], ['+name_en','+id'], 1000), 
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('supplier'),
      query: res.locals.modified_query,
      query_options: res.locals.query_options
    };
    next();
  }, fetchMany, resultToJson);


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
