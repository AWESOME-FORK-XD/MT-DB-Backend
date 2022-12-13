var express = require('express');
var router = express.Router({ mergeParams: true });
let { create, fetchById, fetchMany, parseQueryOptions, resultToJson, saveAll, updateById} = require('@apigrate/dao/lib/express/db-api');
const authenticated = require('../middleware/authenticated');
const debug = require('debug')('app:routes');
/** Query all prices for an org */
router.get('/org/:org_id', 
  function (req, res, next) {
    res.locals.dbInstructions = {
      dao: req.app.locals.database.getDao('buyer_price'),
      query: {org_id: req.params.org_id},
      query_options: {order_by: ['+product_id','+lifecycle_id','+category_id']},
      with_total: true,
    };
    
    next();
    
  }, fetchMany, resultToJson);

/** Given an array of products, return prices for each product. */
router.post('/org/:org_id/lookup', async function(req, res, next){ 
  try{
    if(!req.body || !req.body.product_ids || req.body.product_ids.length === 0){ 
      res.status(200).json([]);
      return;
    }

    let buyerPriceDao = req.app.locals.database.getDao('buyer_price');
    let price_rules = await buyerPriceDao.filter({org_id: req.params.org_id});

    let productViewDao = req.app.locals.database.getDao('product_view');
    let products = await productViewDao.sqlCommand(
      `select id, sku, name_en, category_id, category_en, lifecycle_id, lifecycle_en, list_price_us from v_product where id in (?)`,
      [req.body.product_ids]
    );

    let results = [];
    if(price_rules.length === 0){
      //No customized pricing. Just return regular prices.
      console.log(products);
      results = products.map(p=>{
        return {
          product_id: p.id,
          price: p.list_price_us
        };
      });
    
    } else {
      // Customized pricing...
      let categories = []; //if needed.
      let categoryDao = req.app.locals.database.getDao('category');
      for(let p of products){
        let discount = null;
        let price = p.list_price_us; // default is the list price.

        // Product id match?
        let rule_match = price_rules.find(pr=>pr.product_id === p.id);
        if(!rule_match){

          
          if(!rule_match){
           
            // Search up the category tree...
            if(categories.length === 0) {
              categories = await categoryDao.sqlCommand(`select id, parent_id from t_category order by id asc`);
            }

            let searchPriceRulesByCategory = ( category_id, lifecycle_id ) => {
              debug(`search for price rule match on category_id ${category_id}...`)
              let matches = price_rules.filter(pr => pr.category_id == category_id);
              if(matches.length > 0){ 
                debug(`found ${matches.length} price rules...`)
                let match = null;
                if(lifecycle_id) {
                  //prefer a lifecycle-specific match.
                  match = matches.find(pr => pr.lifecycle_id == lifecycle_id);
                }
                if(match){
                  debug(`found match on lifecycle...`);
                  return match;
                } else {
                  //if no lifecycle-specific match then take a rule without lifeycle
                  match = matches.find(pr => pr.lifecycle_id != lifecycle_id);
                }
                if(match){
                  debug(`found general category match...`);
                  return match;
                } 
              }
              // No match. Get parent and iterate...
              let category = categories.find(c=>c.id==category_id);
              if(!category || !category.parent_id) return null;
              return searchPriceRulesByCategory(category.parent_id);
              
            };

            // Category match?
            rule_match = searchPriceRulesByCategory(p.category_id, p.lifecycle_id);

          }

        }

        if(rule_match){
          discount = rule_match.discount;
        } 

        if(discount){
          price = price - ( (discount / 100.0000) * price );
        }
        results.push({
          product_id:           p.id, 
          product_category_id:  p.category_id, 
          list_price:           p.list_price_us, 
          price_rule_id:        rule_match?.id, 
          percent_discount:     rule_match?.discount, 
          price 
        });

      }//next product
    }
    
    res.status(200).json(results);
    return;

  }catch(err){
    console.error(`Error looking up prices. ${err.message}`);
    console.error(err);
    next(err)
  }
});

//Default error handling
router.use(function (err, req, res, next) {
  console.error(err);
  let errMessage = err.message;
  if (err.sqlState) {
    errMessage = `Pricing data error. ${errMessage} (code=${err.sqlState})`;
  }
  res.status(500).json({
    message: "Unexpected error.",
    error: errMessage
  });
});


module.exports = router;
