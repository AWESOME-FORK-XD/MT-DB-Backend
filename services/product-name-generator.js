const debug = require('debug')('medten:services');
/**
 * Generates product names and/or product descriptions based on the
 * name and description-generation formulas associated with the product
 * category.
 */
class ProductNameGenerator {
  constructor(database){
    this.db = database;
    this.families = [];
  }

  async _getFamily(family_id){
    let family = this.families.find(f=>{return f.id == family_id;});
    if(family) return family;
    family = await this.db.getDao("family_view").get(family_id);
    if(family){
      this.families.push(family);
    }
    return family;
  }
 
  /**
   * 
   */
  async generate(product_id, forName, forDescription){
    try{
      if(!forName && !forDescription) return;

      let product = await this.db.getDao("product_view").get(product_id);
      if(!product){
        debug(`Product ${product_id} not found.`);
        return;
      }

      let generateName = null;
      if(forName){
        if(!product.product_name_formula){
          debug(`Product ${product_id} has no name formula associated with it.`);
        } else {
          generateName = eval(product.product_name_formula);
        }
      }

      let generateDescription = null;
      if(forDescription){
        if(!product.product_description_formula){
          debug(`Product ${product_id} has no description formula associated with it.`);
        } else {
          generateDescription = eval(product.product_description_formula);
        }
      } 

      if(!generateName && !generateDescription) {
        debug(`No formulas available for product ${product_id}. Skipping.`);
        return;
      }

      let context = {
        product
      };

      //Family needed?
      context.family = await this._getFamily(product.family_id);


      //Filter options needed?
      context.filter_options = await this.db.getDao("product_filter_option_view").filter({product_id: product_id});

      if(forName && generateName){
        debug(`Generating name for product ${product_id}...`);
        product.name_en = generateName(context, 'en').replace(/null|undefined/gi,'');
        debug(`  name_zh: ${product.name_en}`);
        product.name_zh = generateName(context, 'zh').replace(/null|undefined/gi,'');
        debug(`  name_zh: ${product.name_zh}`);
      }
      
      if(forDescription && generateDescription){
        debug(`Generating name for product ${product_id}...`);
        product.description_en = generateDescription(context, 'en').replace(/null|undefined/gi,'');
        debug(`  description_en: ${product.description_en}`);
        product.description_zh = generateDescription(context, 'zh').replace(/null|undefined/gi,'');
        debug(`  description_zh: ${product.description_zh}`);
      }

      await this.db.getDao("product").update(product);
      
    }catch(ex){
      console.error(ex);
      throw ex;
    }
    
  }

}

exports.ProductNameGenerator = ProductNameGenerator;