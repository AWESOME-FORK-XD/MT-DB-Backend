const express = require('express');
const {parse} = require('fast-csv');

let router = express.Router({ mergeParams: true });
const {fetchManyAnd, resultToCsv, resultToJsonDownload, resultToJson} = require('./db-api-ext');

const import_constraints = {
  t_product:{
    unique_keys: [
      ['sku'], //each array is a list of fields that together imply unique key
    ]
  },
  t_product_oem_reference:{
    unique_keys: [
      ['product_id','brand_id','name'], 
    ]
  },
  t_test_pet:{
    unique_keys: [
      ['name'],
    ]
  }
};

let debug = require('debug')('medten:routes');


/** Get the available table entities (not the table names themselves, though) */
router.get('/tables', async function (req, res, next) {
  let tableRegistry = req.app.locals.database.registry
    .filter((e)=>{return e.entity.includes("view") ? false : true;});
  let names = tableRegistry.map( (e) => { return e.entity; });
  res.status(200).json({tables: names});
  return;
});


/** Get all the fields for a given entity (table) */
router.get('/:entity/metadata', validateDao, async function (req, res, next) {
  let metadata = [];

  //remove audit columns, and add js type validation
  res.locals.dao.metadata.forEach((m,idx)=>{
    if(m.is_updated_timestamp || m.is_created_timestamp || m.is_updated_version ){
      return;
    }
    delete m.autoincrement;
    delete m.is_updated_timestamp;
    delete m.is_created_timestamp;
    delete m.is_updated_version;

    metadata.push(m);
  });

  res.status(200).json({
    name: res.locals.dao.entity,
    plural: res.locals.dao.plural,
    table: res.locals.dao.table,
    columns: metadata
  });
  
});


/** Perform a data load in insert mode. */
router.post('/:entity/bulkinsert', validateDao, async function (req, res, next) {
  try{
    let to_process = await parseData(req.body, null, res.locals.dao);

    let inserted = 0;
    let skipped = 0;
    let warnings = to_process.warnings;

    //Each row
    // let promises = [];
    for(let idx = 0;  idx < to_process.data.length; idx++ ){
      let row = to_process.data[idx];
      try{
        // check uniqueness.
        let exists = false;
        let uniqueQuery = null;
        let constraints = import_constraints[res.locals.dao.table]
        if(constraints){
          if(constraints.unique_keys){
            for(let keys of constraints.unique_keys){
              uniqueQuery = {};
              keys.forEach(k=>{
                uniqueQuery[k] = row[k];
              });
              let results = await res.locals.dao.filter(uniqueQuery);//check for uniqueness
              exists = results && results.length > 0;
              if(exists) break;
            }
          }
        }
        if(exists) throw new Error(`${res.locals.dao.entity} already exists for: ${JSON.stringify(uniqueQuery)}.`)
        // promises.push( res.locals.dao.create(row,{explicit_pk: true}) );
        await res.locals.dao.create(row,{explicit_pk: true});
        inserted++;

      }catch(ex){
        console.error(ex);
        skipped++;
        warnings.push(`Row ${idx+1}: ${ex.message}`);
      }

    }
    
    // let resultant = await Promise.allSettled(promises);
    // resultant.forEach((p,idx) => {
    //   if(p.status === 'fulfilled'){
    //     inserted++;
    //   } else if (p.status === 'rejected'){
    //     skipped++;
    //     warnings.push(`Row ${idx+1}: ${p.reason}`);
    //   }
    // });

    res.status(200).json({
      total: to_process.data.length,
      inserted,
      skipped,
      warnings
    });
  } catch (err){
    console.error(err);
    res.status(500).json({message:"Error loading data.", error: err.message});
  }

  
});

/** Perform a data load in update mode */
router.post('/:entity/bulkupdate', validateDao, async function (req, res, next) {
  try{
    let to_process = await parseData(req.body, null, res.locals.dao);

    let updated = 0;
    let skipped = 0;
    let warnings = to_process.warnings;

    //Each row
    // let promises = [];
    for(let idx = 0;  idx < to_process.data.length; idx++ ){
      let row = to_process.data[idx];
      try{
        // check uniqueness.
        let exists = false;
        let uniqueQuery = null;
        let constraints = import_constraints[res.locals.dao.table]
        if(constraints){
          if(constraints.unique_keys){
            for(let keys of constraints.unique_keys){
              uniqueQuery = {};
              keys.forEach(k=>{
                uniqueQuery[k] = row[k];
              });
              let results = await res.locals.dao.filter(uniqueQuery);//check for uniqueness
              exists = results && results.length > 0 && results.filter(r=>r.id!=row.id).length>0;
              if(exists) break;
            }
          }
        }
        if(exists) throw new Error(`${res.locals.dao.entity} already exists for: ${JSON.stringify(uniqueQuery)}.`)
        // promises.push( res.locals.dao.update(row) );
        let update_result = await res.locals.dao.update(row);
        if(update_result._affectedRows>0){
          updated++;
        } else {
          throw new Error(`${res.locals.dao.entity} not found for id: ${row.id}.`)
        }
        

      }catch(ex){
        console.error(ex);
        skipped++;
        warnings.push(`Row ${idx+1}: ${ex.message}`);
      }

    }
    
    // let resultant = await Promise.allSettled(promises);
    // resultant.forEach((p,idx) => {
    //   if(p.status === 'fulfilled'){
    //     updated++;
    //   } else if (p.status === 'rejected'){
    //     skipped++;
    //     warnings.push(`Row ${idx+1}: ${p.reason}`);
    //   }
    // });

    res.status(200).json({
      total: to_process.data.length,
      updated,
      skipped,
      warnings
    });
  } catch (err){
    console.error(err);
    res.status(500).json({message:"Error loading data.", error: err.message});
  }

  
});

/** Downloads an entire table of data (as JSON) */
router.post('/:entity/download', validateDao, async function (req, res, next) {
  //Which columns are output...
   let query_options = {
     limit: 100000
   };
   let items = await res.locals.dao.all( query_options );

   let headers = [];
   res.locals.dao.metadata.forEach( field => { headers.push( field.column ); } );

   res.status(200).json({
     total: items.length,
     headers,
     items,
   })
   return; 
 });


/**
 * Middleware which loads a dao into the `res.locals.dao` property based on 
 * the entity name. The dao is initialized with database metadata.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function validateDao(req, res, next){
  let dao = req.app.locals.database.getDao(req.params.entity);
  if(!dao){
    res.status(400).json({message: "There is no support for that type of data."});
    return;
  }
  await dao.loadMetadata();

  res.locals.dao = dao;
  next();
}


/**
 * Parses tab-delimited data.
 * @param {string} raw raw tab-delimited data to parse
 * @param {string} delimiter (optional) defaults to tab
 * @returns {Promise<object>} an array of objects
 * @example {
 *  pk: string the primary key header name, if detected
 *  warnings: Array<string> warning messages associated with the parse.
 *  data: Array<object> parsed data
 * }
 */
async function parseData(raw, delimiter, dao){

  return new Promise(function(resolve, reject){
    let parseres = {
      pk: null,
      warnings: [],
      data: []
    };

    const stream = parse({delimiter: delimiter || '\t', headers: true})
    .on('headers', headers => {
      debug(headers);
      headers.forEach(h=>{
        let match = dao.metadata.find(c => {
          return c.column === h;
        });
        if(!match){
          parseres.warnings.push(`Header "${h}" not recognized. Associated data will be ignored.`);
        } else {
          if(match.pk){
            console.log(`Detected pk "${match.column}"`);
            parseres.pk = match.column;
          }
        }

      });
      

    })
    .on('data', row => { 
      parseres.data.push(row); 
    })
    .on('error', error => { 
      console.error(error); 
      reject(error); 
    })
    .on('end', rowCount => { 
      debug(`Parsed ${rowCount} rows.`);
      resolve(parseres);
    });

    stream.write(Buffer.from(raw,'utf-8'));
    stream.end();
    
  });
}


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
