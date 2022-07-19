const express = require('express');
const router = express.Router({ mergeParams: true });
const { create, deleteById, fetchById, fetchMany, parseQueryOptions, resultToJson, saveAll, updateById } = require('@apigrate/dao/lib/express/db-api');
const { fetchManySqlAnd, resultToCsv, resultToJsonDownload, resultToAccept} = require('./db-api-ext');
const debug = require('debug')('medten:routes');
const {parseAdvancedSearchRequest} = require('./common');
const authenticated = require('../middleware/authenticated');
const { CriteriaHelper } = require('@apigrate/dao');

const ALLOWED_SEARCH_PARAMETERS = [ 
  'id', 
  'sku',
  'oem',
  'name_en', 
  'name_zh',
  'oem_brand_id',
  'oem_brand_en',
  'oem_brand_zh',
  'description_en',
  'description_zh',
  'product_type_en',
  'product_type_zh',
  'family_id',
  'family_code',
  'family_name_en',
  'featured',
  'category_id',
  'category_en',
  'category_zh',
  'certificate_id',
  'search_term',
  'search_term_fields',
  'popular',
  'created',
  'updated',

  'oem_reference_name' //special handling in common.js
];

const SEARCH_FILTERS = {
  "oem_brands": {
    where_column: "oem_brand_id",
  },
  "certificates": {
    join_table: "t_product_certificate",
    join_column: "product_id",
    where_column: "certificate_id",
  },
  "custom_attributes": {
    join_table: "t_product_custom_attribute",
    join_column: "product_id",
    where_column: "custom_attribute_id",
  },
  "image_type": {
    join_table: "t_product_image",
    join_column: "product_id",
    where_column: "image_type_id",
  },
  "lifecycles": {
    where_column: "lifecycle_id",
  },
  "marketing_regions": {
    join_table: "t_product_marketing_region",
    join_column: "product_id",
    where_column: "marketing_region_id",
  },
  "packaging_factors": {
    where_column: "packaging_factor_id",
  },
  "suppliers": {
    join_table: "t_product_supplier",
    join_column: "product_id",
    where_column: "supplier_id",
  },
  "oem_references": {
    join_table: "t_product_oem_reference",
    join_column: "product_id",
    where_column: "brand_id",
  },
  "product_types": {
    where_column: "product_type_id",
  },
};

// when product is known, find equipment 
const EQUIPMENT_COMPATIBILITY_QUERY_SQL = `select eg.group_id, eg.equipment_id, eg.model, eg.brand_id, eg.brand_en, brand_zh
from t_product p
join v_family f on f.id = p.family_id 
join v_equipment_group eg on eg.group_id = f.group_id
where p.id=?
group by group_id, equipment_id, model, brand_id, brand_en, brand_zh
order by brand_en asc, model asc`;

// when product is known, find other compatible products based on family
const USED_WITH_QUERY_SQL = `select p.id, p.name_en, p.name_zh, p.sku, p.oem_brand_en, p.oem_brand_zh, p.lifecycle_en, p.lifecycle_zh, sp.specifications_en, sp.specifications_zh 
from t_product_family_connect fc
join t_product_family pf on pf.family_id = fc.family_id
join v_product p on p.id = pf.product_id
join v_product_specifications sp on sp.id = p.id
where fc.product_id=?
order by oem_brand_en asc, sku asc`;

/** Query for products using a simple parametric search. Array values not supported. */
router.get('/', parseQueryOptions(ALLOWED_SEARCH_PARAMETERS, ['+name_en', '+id'], 1000), async function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_view'),
    // query: res.locals.modified_query,
    criteria: res.locals.criteria,
    query_options: res.locals.query_options,
    with_total: true,
  };

  next();
  
}, fetchMany, resultToJson);

/** 
 * Query for products using an advanced search.
 * 
 * Expected body:
 * @example 
 * {
 *   search_term: "SA-024",
 *   search_term_fields: ["oem", "model"],
 *   category_id: [5, 7],
 *   oem_brand_id: 3,
 *   order_by: ["sku"],
 *   limit: 10,
 *   offset: 0
 * }
 * In this example, the oem and model fields will be wildcard searched for "SA-024", and the other 
 * criteria on the search payload will be used to further filter the selection.
 * 
*/
router.post('/search', async function (req, res, next) {
  
  let payload = {};
  Object.assign(payload, req.body);
  
  res.locals.dbInstructions = {
    searchable_columns: ALLOWED_SEARCH_PARAMETERS,
    filter_definitions: SEARCH_FILTERS,
    exclude_columns_on_output: ['product_name_formula', 'product_description_formula'],
    search_payload: payload,
    dao: req.app.locals.database.getDao('product_view'),
    sql: null,
    sql_count: null
  };
  
  next();
  
}, parseAdvancedSearchRequest, fetchManySqlAnd, function(req, res, next){
  //Allows the headers to be provided for CSV output in the client.
  if(res.locals.result && req.body && req.body.with_headers===true && res.locals.dbInstructions){
    let theHeaders = [];
    res.locals.dbInstructions.dao.metadata.forEach( (meta) => {
      theHeaders.push(meta.column);
    });
    res.locals.result.headers = theHeaders
  }
  next();
}, resultToAccept);


router.get('/search/download', authenticated(), async function (req, res, next) {
  if(!req.query.payload){
    res.status(400).json({message: "Unable to download.", error: "Invalid parameters."});
  }
  try{
    let payload = {};
    Object.assign(payload, JSON.parse(req.query.payload));
    
    res.locals.dbInstructions = {
      searchable_columns: ALLOWED_SEARCH_PARAMETERS,
      filter_definitions: SEARCH_FILTERS,
      exclude_columns_on_output: ['product_name_formula', 'product_description_formula'],
      search_payload: payload,
      dao: req.app.locals.database.getDao('product_view'),
      sql: null,
      sql_count: null
    };
   
    next();
  }catch(ex){
    console.error(ex);
    res.status(400).json({message: "Download failed.", error: ex.message});
  }

  
}, parseAdvancedSearchRequest, fetchManySqlAnd, resultToCsv);

router.post('/search/download', authenticated(), async function (req, res, next) {
 
  try{
    let payload = {};
    Object.assign(payload, req.body);
    
    res.locals.dbInstructions = {
      searchable_columns: ALLOWED_SEARCH_PARAMETERS,
      filter_definitions: SEARCH_FILTERS,
      exclude_columns_on_output: ['product_name_formula', 'product_description_formula'],
      search_payload: payload,
      dao: req.app.locals.database.getDao('product_view'),
      sql: null,
      sql_count: null
    };
   
    next();
  }catch(ex){
    console.error(ex);
    res.status(400).json({message: "Download failed.", error: ex.message});
  }

  
}, parseAdvancedSearchRequest, fetchManySqlAnd, resultToJsonDownload);


/** Gets an array of all distinct SKUs across all products. Used for validation. A SKU should be globally unique. */
router.get('/skus', async function (req, res, next) {
  debug(`Getting distinct SKUs...`);
  let ProductView = req.app.locals.database.getDao('product_view');
  let qresult = await ProductView.sqlCommand(`SELECT DISTINCT(sku) as sku FROM ${ProductView.table} WHERE sku <> '' and sku is not null ORDER BY sku ASC`);
  res.status(200).json(qresult.map(r=>{return r.sku;}));
});

/** Gets a full list of all searchable fields in one dump. The user then refines it inside the browser. */
router.post('/catalog', async function (req, res, next) {
 
  let ProductCatalogView = req.app.locals.database.getDao('product_catalog_view');
  let qresult = await ProductCatalogView.all();
  res.status(200).json(qresult);
});

/** Gets an array products meeting the specified criteria. The search term checks the sku, oem fields on the t_product table and the t_product_oem_reference.name field for matches and partial matches. */
router.get('/quicksearch', async function (req, res, next) {
  let locale = "US";

  let search_term = req.query ? req.query.search_term : "";
  if(!search_term){
    search_term = "%";
  } else {
    search_term = `%${search_term}%`;
  }

  let criteria = new CriteriaHelper();
   
  // Search term finds anything... (OR)
  criteria.andGroup()
    .or('pc.category_en', '<>', '')
    .or('pc.category_en', 'LIKE', search_term)
    .or('pc.sku', '<>', '')
    .or('pc.sku', 'LIKE', search_term)
    .or('pc.oem', '<>', '')
    .or('pc.oem', 'LIKE', search_term)
    .or('pc.oem_brand_en', '<>', '')
    .or('pc.oem_brand_en', 'LIKE', search_term)
    .or('pc.oem_refs', '<>', '')
    .or('pc.oem_refs', 'LIKE', search_term)
    .groupEnd();

  // published for the locale?
  if(locale === 'US') criteria.and('pc.publish_usa', '=', true);
  else if(locale === 'EU') criteria.and('pc.publish_eu', '=', true);

  // Specific values narrow the search... (AND)
  let equipment_clause = '';//special case
  if(req.query){
    if(req.query.brand_ids){
      criteria.and ( 'pc.oem_brand_id', 'IN', req.query.brand_ids.split('|') );
    }
  
    if(req.query.category_ids){
      criteria.and ( 'pc.category_id', 'IN', req.query.category_ids.split('|') );
    }
    

    // when model is known, find compatible products based on equipment/group/family/product relationship

    if(req.query.model){
      const MODEL_COMPATIBILITY_QUERY_SQL = `SELECT DISTINCT(p.id)
FROM v_equipment_group eg
JOIN t_group g on g.id = eg.group_id
JOIN t_family f on f.group_id = g.id
JOIN v_product p on p.family_id = f.id
where model = ?`;

      equipment_clause = ` INNER JOIN( ${MODEL_COMPATIBILITY_QUERY_SQL} ) AS modsearch ON modsearch.id = pc.id `;
      criteria.parms.splice( 0, 0, req.query.model );
    }
  }

  let criteria_clause = `${equipment_clause} WHERE ${criteria.whereClause}`;
  
  let ProductCatalogView = req.app.locals.database.getDao('product_catalog_view');
  let ProductView = req.app.locals.database.getDao('product_view');
  
  let qresult = { total: 0, products:[]};

  // get count first
  let fullCountSql = `SELECT COUNT(pc.id) AS total FROM v_product_catalog pc ${criteria_clause}`;
  // console.log(`\n\nfull quicksearch count sql: ${fullCountSql}\n\n`);
  let qtotal = await ProductCatalogView.sqlCommand(fullCountSql, criteria.parms);
  qresult.total = qtotal[0].total;

  if(qresult.total>0){
    let offset = Number.isFinite( Number.parseInt(req.query.offset) ) ?  Number.parseInt(req.query.offset) : 0;
    let limit = Number.isFinite( Number.parseInt(req.query.limit) ) ? Number.parseInt(req.query.limit) : 5000;
  
    const PRODUCT_FIELDS = ['id','category_id','name_en','description_en','oem','oem_brand_en','oem_brand_id','packaging_factor','product_type_id','price_us','sku'];
 
    let fullSql = `SELECT ${PRODUCT_FIELDS.map(x=>`p.${x}`).join(', ')}, pc.models, pc.filter_option_ids FROM v_product_catalog pc INNER JOIN v_product p ON p.id=pc.id ${criteria_clause} ORDER BY p.sku ASC LIMIT ${limit} OFFSET ${offset}`;
    // console.log(`\n\nfull quicksearch sql: ${fullSql}\n\n`);

    qresult.products = await ProductView.sqlCommand(fullSql, criteria.parms);
  
  
    // additional decoration?
    if(req.query && req.query.with){
      if(req.query.with.includes('images')){

        const product_image_query = `SELECT pi.* FROM v_product_image pi INNER JOIN ( SELECT pc.id FROM v_product_catalog pc ${criteria_clause}) AS query ON pi.product_id = query.id ORDER BY pi.product_id ASC, pi.priority_order ASC`;

        qresult.product_images = await ProductView.sqlCommand(product_image_query, criteria.parms);
      }
    }
  }
  res.status(200).json(qresult);
  
});

/** Gets an array of all distinct OEMs across all products. Used for validation. A SKU should be globally unique. */
router.get('/oems', async function (req, res, next) {
  debug(`Getting distinct SKUs...`);
  let Product = req.app.locals.database.getDao('product');
  let qresult = await Product.sqlCommand(`SELECT id, oem FROM ${Product.table} WHERE oem <> '' and oem is not null GROUP BY id, oem ORDER BY oem ASC`);
  res.status(200).json({total: qresult.length, product_oems: qresult});
});



/** 
 * Purpose-built API for displaying the full product and info on the catalog page. The extended view of the product is returned. 
 * along with other decorating data.
 */
router.get('/:product_id/detail', async function (req, res, next) {

  let result = {
    //...product fields

    //...additional product data
    // category_path:[],
    compatibility:[],
    custom_attributes:[],
    family: null,
    filter_options: [],
    images:[],
    oem_products:[], //share the same oem as this product
    oem_references:[], //other oem values potentially valid for this product
  };

  //product view
  let productViewDao = req.app.locals.database.getDao('product_view');

  let pv = await productViewDao.get(req.params.product_id);
  
  Object.assign(result, pv);

  // //category path
  // let categoryDao = req.app.locals.database.getDao('category');
  // let depth = 0;
  // let populateAncestorCategories = async (id)=>{
  //   let c = await categoryDao.get(id);
  //   depth++;
  //   result.category_path.push({category_id: c.id, name_en: c.name_en, name_zh: c.name_zh });
  //   if(!c || c.parent_id > 0 || depth > 4) populateAncestorCategories(c.parent_id);
  // };
  // await populateAncestorCategories(result.category_id); 
    
  //daos for related data...
  let porViewDao = req.app.locals.database.getDao('product_oem_reference_view');
  let pfoViewDao = req.app.locals.database.getDao('product_filter_option_view');
  let pcaViewDao = req.app.locals.database.getDao('product_custom_attribute_view');
  let piViewDao = req.app.locals.database.getDao('product_image_view');
  let famViewDao = req.app.locals.database.getDao('family_view');

  //parallel retrieval
  let related = [
    productViewDao.sqlCommand(EQUIPMENT_COMPATIBILITY_QUERY_SQL, [req.params.product_id]), //0: compatibility
    porViewDao.filter({product_id: req.params.product_id}, {orderBy: ['brand_en']}), //1: oem references
    pfoViewDao.filter({product_id: req.params.product_id}), //2: filter options
    pcaViewDao.filter({product_id: req.params.product_id}), //3: custom attributes
    piViewDao.filter({product_id: req.params.product_id}), //4: product images
    productViewDao.filter({oem: result.oem}, {orderBy: ['product_type_id']}), //5: oem products
    result.family_id ? famViewDao.get(result.family_id) : null, //6: family
  ];

  let related_results = await Promise.allSettled(related);

  result.compatibility     = related_results[0].value;
  result.oem_references    = related_results[1].value;
  result.filter_options    = related_results[2].value;
  result.custom_attributes = related_results[3].value;
  result.images            = related_results[4].value;
  result.oem_products      = related_results[5].value;
  result.family            = related_results[6].value;

  // redact internal notes, supplier info.
  delete result.note_internal;
  delete result.product_name_formula;
  delete result.product_description_formula;

  result.oem_products = result.oem_products.map(oemp=>{
    delete oemp.note_internal;
    delete oemp.product_name_formula;
    delete oemp.product_description_formula;
    return oemp;
  });

  res.locals.result = result;

  next();

}, resultToJson);

/** Standard product by id getter for an extended view of the product (no other decorations) */
router.get('/:product_id', function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_view'),
    id: req.params.product_id
  };
  next();

}, fetchById, resultToJson);


/** Create a product */
router.post('/', authenticated(), function (req, res, next) {

  let entity = req.body;
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product'),
    toSave: entity
  };
  next();

}, create, resultToJson);


/** Update a product */
router.put('/:product_id', authenticated(), async function (req, res, next) {
  try{
    let latest = req.body;
    let productDao = req.app.locals.database.getDao('product');
    
    // First retrieve, then overlay.
    let existing = await productDao.get(latest.id);
    let toSave = {};
    toSave = Object.assign(toSave, existing);
    toSave = Object.assign(toSave, latest);//overlay

    //If new category is or is underneath one of the major categories, err.
    if(latest.category_id && latest.category_id != existing.category_id){
      debug(`A product category change has been detected...`);
      let categoryDao = req.app.locals.database.getDao('category');

      let sourceCategory = await topCategoryFor(categoryDao, existing.category_id);
      let targetCategory = await topCategoryFor(categoryDao, latest.category_id);
      
      if(sourceCategory.id !== targetCategory.id){
        res.status(400).json({message: "Unable to save product.", error: "Changing categories to another top level category hierarchy is not allowed."});
        return;
      }

      //Delete category-dependent data.
      //Filter Options
      debug(`...deleting old filter options.`);
      await req.app.locals.database.getDao('product_filter_option').deleteMatching({product_id: existing.product_id});
      //Custom attributes
      debug(`...deleting old custom attributes.`);
      await req.app.locals.database.getDao('product_custom_attribute').deleteMatching({product_id: existing.product_id});

    }

    //Now save.
    await productDao.update(toSave);
    
    //Now update the product family table from the family_id (if necessary)
    let productFamilyDao = req.app.locals.database.getDao('product_family');
    let current_pf = await productFamilyDao.one({product_id: toSave.id, is_primary: 1});
    if(latest.family_id && (!current_pf || current_pf.family_id != latest.family_id) ){
      await productFamilyDao.deleteMatching({product_id: toSave.id, is_primary: 1});
      await productFamilyDao.create({product_id: toSave.id, family_id: latest.family_id, is_primary: 1});
    }

    res.locals.result = toSave;

    next();
  }catch(err){
    console.error(err);
    next(err);
  }

}, resultToJson );


/**
 * Returns the top-level category for a given subcategory id.
 * @param {object} categoryDao @apigrate/mysql category dao
 * @param {integer} categoryId category id
 * @return the category entity
 * @throws error if category ids refer to nonexistent categories in the database.
 */
async function topCategoryFor(categoryDao, categoryId){
  let current = await categoryDao.get(categoryId);
  if(!current) throw new Error(`No category for id=${categoryId}`);
  if(current.parent_id === 0){
    return current;
  }

  let maxDepth = 7;
  let count = 1;
  let category = current;
  
  do{
    category = await categoryDao.get(category.parent_id);
    if(!category) throw new Error(`No category for id=${categoryId}`);
    if(category.parent_id === 0){
      return category;
    }
    count++;
  }while(count <= maxDepth);

  debug(`Max depth reached, returning highest ancestor found.`);
  return category;
}


/** Delete a product (database cascades related entities) */
router.delete('/:product_id', authenticated(), function (req, res, next) {

  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product'),
    id: req.params.product_id
  };
  next();

}, deleteById, resultToJson);


// Get all product certificates
router.get('/:product_id/certificates', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_certificate'),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  };
  next();
}, fetchMany, resultToJson);

/** Saves product certificates */
router.post('/:product_id/certificates', authenticated(), function (req, res, next) {
  
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_certificate'),
    toSave: req.body, //assuming an array
    query: {product_id: req.params.product_id},
    comparison: function(v){ return v.certificate_id; }
  };
  next();
}, saveAll, resultToJson);

/** Get all custom attribute values for a product. */
router.get('/:product_id/custom_attributes', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_custom_attribute_view'),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  };
  next();
}, fetchMany, resultToJson);

/** Save all product custom attributes. */
router.post('/:product_id/custom_attributes', authenticated(), function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_custom_attribute'),
    toSave: req.body, //assuming an array of objects
    query: {product_id: req.params.product_id},
    comparison: function(obj){ return `${obj.custom_attribute_id}|${obj.value_en}|${obj.value_zh}`; }
  };
  next();
}, saveAll, resultToJson);


// Get all product equipment connections
router.get('/:product_id/equipment', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_equipment_connect_view'),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  };
  next();
}, fetchMany, resultToJson);

/** Save all product equipment connections. */
router.post('/:product_id/equipment', authenticated(), function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_equipment_connect'),
    toSave: req.body, //assuming an array
    query: {product_id: req.params.product_id},
    comparison: function(obj){ return obj.equipment_id; }
  };
  next();
}, saveAll, resultToJson);

// Get all product equipment connections ("compatibility" is not the best name)
router.get('/:product_id/equipment-compatibility', async function (req, res, next) {

  //Compatibility query:

  res.locals.result = await req.app.locals.database.getDao('product').sqlCommand(EQUIPMENT_COMPATIBILITY_QUERY_SQL, [req.params.product_id]);
  
  next();

}, resultToJson);

/** For a given model, return products that may be associated with it via the equipment -> group -> family -> product relationship  */
router.get('/model-compatibility/:model', async function (req, res, next) {
  res.locals.result = await req.app.locals.database.getDao('product').sqlCommand(MODEL_COMPATIBILITY_QUERY_SQL, [req.params.model]);
  next();
}, resultToJson);

// Get all product family relationship data for a given product
router.get('/:product_id/product-families', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_family'),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  }
  next();
}, fetchMany, resultToJson);

// Get all products the specified product is used with. This is simply done by querying the product_family_connect table to find the family the product connects with, then getting the products
// and all the specification data for each product in that family.
router.get('/:product_id/used-with', async function (req, res, next) {
  
  try{
    let dao = req.app.locals.database.getDao('product_family');
    let results = await dao.sqlCommand(USED_WITH_QUERY_SQL, [req.params.product_id]);
    res.status(200).json({used_with: results});
  }catch(err){
    console.error(err);
    next(err);
  }
  
});

router.post('/:product_id/generate-connects-to', async function (req, res, next) {
  let transcript = null;
  try{
    let {ProductionConnectionRelationshipService} = require('../../services/connects-with');
    let service = new ProductionConnectionRelationshipService(req.app.locals.database);
    transcript = await service.generateProductConnections(req.params.product_id);
    res.status(200).json({success: true, transcript});
  }catch(err){
    console.error(err);
    res.status(500).json({success: false, message: err.message, error: err.stack, transcript});
    return;
  }
});


// Get all product family connections
router.get('/:product_id/families', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_family_connect'),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  };
  next();
}, fetchMany, resultToJson);

/** Save all product family connections. */
router.post('/:product_id/families', authenticated(), function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_family_connect'),
    toSave: req.body, //assuming an array
    query: {product_id: req.params.product_id},
    comparison: function(obj){ return obj.family_id; }
  };
  next();
}, saveAll, resultToJson);

router.get('/:product_id/filter_options', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_filter_option_view'),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  };
  next();
}, fetchMany, resultToJson);

/** Save all product filter options. */
router.post('/:product_id/filter_options', authenticated(), function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_filter_option'),
    toSave: req.body, //assuming an array
    query: {product_id: req.params.product_id},
    comparison: function(obj){ return `${obj.filter_option_id}|${obj.product_id}|${obj.priority_order}`; }
  };
  next();
}, saveAll, resultToJson);

// Get all product family connections
router.get('/:product_id/images', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_image_view'),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  };
  next();
}, fetchMany, resultToJson);

/** Save all product images. */
router.post('/:product_id/images', authenticated(), function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_image'),
    toSave: req.body, //assuming an array of objects
    query: {product_id: req.params.product_id},
    comparison: function(obj){ return `${obj.image_link}|${obj.image_type_id}|${obj.priority_order}`; }
  };
  next();
}, saveAll, resultToJson);


// Get all product marketing regions
router.get('/:product_id/marketing_regions', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_marketing_region_view'),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  };
  next();
}, fetchMany, resultToJson);

/** Save all product marketing regions. */
router.post('/:product_id/marketing_regions', authenticated(), function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_marketing_region'),
    toSave: req.body, //assuming an array of objects
    query: {product_id: req.params.product_id},
    comparison: function(obj){ return `${obj.marketing_region_id}`; }
  };
  next();
}, saveAll, resultToJson);

// Get all product oem references
router.get('/:product_id/oem_references', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_oem_reference_view'),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  };
  next();
}, fetchMany, resultToJson);

/** Save all product oem references */
router.post('/:product_id/oem_references', authenticated(), function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_oem_reference'),
    toSave: req.body, //assuming an array of objects
    query: {product_id: req.params.product_id},
    comparison: function(obj){ return `${obj.brand_id}|${obj.name}`; }
  };
  next();
}, saveAll, resultToJson);


/** Get all set values for a product. */
router.get('/:product_id/sets', function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_set_view'),
    query: {parent_product_id: req.params.product_id},
    //query_options: q.query_options
  };
  next();
}, fetchMany, resultToJson);

/** Save all product sets values. */
router.post('/:product_id/sets', authenticated(), function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_set'),
    toSave: req.body, //assuming an array of objects
    query: {parent_product_id: req.params.product_id},
    comparison: function(obj){ return `${obj.child_product_id}|${obj.quantity}`; }
  };
  next();
}, saveAll, resultToJson);


/** Get product supplier values. (Suppliers are private data and should not be made available publicly) */
router.get('/:product_id/suppliers', authenticated(), function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_supplier'),
    query: {product_id: req.params.product_id},
    //query_options: q.query_options
  };
  next();
}, fetchMany, resultToJson);


/** Save all product supplier values. */
router.post('/:product_id/suppliers', authenticated(), function (req, res, next) {
  res.locals.dbInstructions = {
    dao: req.app.locals.database.getDao('product_supplier'),
    toSave: req.body, //assuming an array of objects
    query: {product_id: req.params.product_id},
    comparison: function(obj){ return `${obj.supplier_id}|${obj.supplier_price}`; }
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
