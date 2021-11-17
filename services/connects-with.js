const SENSOR_CATEGORY_IDS = [5,6,12,18,23];
const ECG_CATEGORY_IDS = [12];
const debug = require('debug')('medten:services');
const Logger = require('@apigrate/logger');

/**
 * Service that can generate "connects-with" relationships between products and other families of products.
 */
class ProductionConnectionRelationshipService {
  constructor(daoFactory){
    this.daoFactory = daoFactory;
  }


  /**
   * For Sensor products, identifies and generates compatible "connects with" relationships
   * to other product families in the database. 
   * 
   * If the product is an adapter product, it should be ignored.
   * 
   * Note, this ONLY applies to products in these general categories:
   * - SPO2
   * - ECG
   * - Temperature
   * - NIBP
   * @param {integer} product_id the product ()
   * @returns a transcript of the logger process.
   */
  async generateProductConnections(product_id){
    let logger = new Logger(process.env.LOG_LEVEL||'debug');
    try{
      let productDao = this.daoFactory.getDao("product");
      let product = await productDao.get(product_id);
      if(!product) return;
      logger.info(``)
      logger.info(`Processing product id=${product.id}, sku=${product.sku}...`)
      //Must be a sensor.
      if(!SENSOR_CATEGORY_IDS.includes(product.category_id)){
        logger.info("This product is not a sensor, and will not be processed.");
        return;
      } 

      let productFamilyDao = this.daoFactory.getDao("product_family");
      let variantFamilyRel = await productFamilyDao.one({product_id: product_id, is_primary: true});
      if(!variantFamilyRel) throw new Error(`No primary product family was found.`);
      let variantFamilyId = variantFamilyRel.family_id;

      let familyDao = this.daoFactory.getDao("family");
      let variantFamily = await familyDao.get(variantFamilyId);
      let variantFamilyCode = variantFamily.family_code;

      let connectsToFamilyCode = `${variantFamilyCode}-C`;

      let connectsToFamily = await familyDao.one({family_code: connectsToFamilyCode});

      let productFamilyConnectDao = this.daoFactory.getDao("product_family_connect");

      if(!connectsToFamily){

        // Identify the products that should belong to this family.
        let familyConnectMembers = await productFamilyConnectDao.filter({family_id: variantFamilyId});
        familyConnectMembers = familyConnectMembers.filter(vfp=>vfp.product_id!=product_id);

        if(familyConnectMembers.length>0){
          // Add the "Connects-To" Products to the new family.
          for(let member of familyConnectMembers){
            //TODO: special filtering for ECG category. The SKU endings (last chars) must match the SKU ending on the product
            if(ECG_CATEGORY_IDS.includes(product.category_id) ){
              debug(`Verifying SKU compatibility for category ${product.category_id}`);
              let memberProduct = await productDao.get(member.product_id);
              if(!memberProduct) continue;//shouldn't happen
              if( memberProduct.sku.endsWith(product.sku.substring(product.sku.length-1) )){
                debug(`Found Compatible SKU: parent=${product.sku} candidate=${memberProduct.sku}`);
                //Last character must match.
              } else {
                debug(`Discarded incompatible SKU: parent=${product.sku} candidate=${memberProduct.sku}`);
                continue;
              }
            }

            if(!connectsToFamily){
              // Create a "Connects-To" Family to contain new Products (same as variant family but with family_code + "-C" appended)
              // Do this once (as long as there are member products) 
              connectsToFamily = await familyDao.create({
                family_code: connectsToFamilyCode, 
                group_id: variantFamily.group_id, 
                family_connector_code: variantFamily.family_connector_code, 
                image_link_connector_distal: variantFamily.image_link_connector_distal 
              });
              logger.info(`  ...created "connects-to" family id=${connectsToFamily.id}`);

            }
            await productFamilyDao.create({
              product_id: member.product_id,
              family_id: connectsToFamily.id,
              is_primary: 0,
            });
            logger.info(`  ...with member product id=${member.product_id}`);
          }

          // Finally Associate the "Connects-To" family with the original product.
          await productFamilyConnectDao.create({
            product_id,
            family_id: connectsToFamily.id
          });

          logger.info(`Complete. The "connects-to" family code=${connectsToFamily.family_code} is now associated with this product.`);

        } else {
          logger.info(`There are no "connects-to" products available in variant family ${variantFamilyCode}.`)
        }
        
      } else {
        logger.info(`  ...a "connects-to" family id=${connectsToFamily.id} code=${connectsToFamily.family_code} was found`);
        // Check if relationship exists.
        let family_connect_count = await productFamilyConnectDao.count({product_id, family_id: connectsToFamily.id });
        
        // If not, add it.
        if(family_connect_count===0){
          await productFamilyConnectDao.create({product_id, family_id: connectsToFamily.id});
          logger.info(`  ...the "connects-to" family code=${connectsToFamily.family_code} had to be associated with this product.`);
          
        }

      }

    }catch(err){
      logger.error("Could not generate connects-with data. "+err.message);
      logger.error(err.stack);
    } finally {
      return logger.transcript(); 
    }

  }
}

exports.ProductionConnectionRelationshipService = ProductionConnectionRelationshipService;