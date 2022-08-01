const {Dao} = require('@apigrate/dao');
/**
 * Provides access to the backend database by giving access to individual data 
 * access objects (DAOs) that facade each database table or view.
 */
class DaoFactory {
  /**
   * @constructor
   * @param {*} pool a mysql database connection pool object is required
   */
  constructor(pool){
    this.pool = pool;
    this.standard_opts = {
      created_timestamp_column: 'created',
      updated_timestamp_column: 'updated',
      version_number_column: 'version'
    };
    this.registry=[
      // auth-related tables
      {table: 't_org',                         entity: 'org',                         options: this.standard_opts },
      {table: 't_user',                        entity: 'user',                        options: this.standard_opts },
      {table: 't_user_org',                    entity: 'user_org',                    options: this.standard_opts },
      {table: 't_user_role',                   entity: 'user_role',                   options: this.standard_opts },
                  
      // product data tables
      {table: 't_available_region',            entity: 'available_region',            options: this.standard_opts },
      {table: 't_brand',                       entity: 'brand',                       options: this.standard_opts },
      {table: 't_category',                    entity: 'category',                    options: this.standard_opts },
      {table: 't_certificate',                 entity: 'certificate',                 options: this.standard_opts },
      {table: 't_custom_attribute',            entity: 'custom_attribute',            options: this.standard_opts },
      {table: 't_equipment',                   entity: 'equipment',                   options: this.standard_opts },
      {table: 't_equipment_available_region',  entity: 'equipment_available_region',  options: this.standard_opts },
      {table: 't_equipment_group',             entity: 'equipment_group',             options: this.standard_opts },
      {table: 't_equipment_image',             entity: 'equipment_image',             options: this.standard_opts },
      {table: 't_equipment_type',              entity: 'equipment_type',              options: this.standard_opts },
      {table: 't_family',                      entity: 'family',                      options: this.standard_opts },
      {table: 't_family_group',                entity: 'family_group',                options: this.standard_opts },
      {table: 't_filter',                      entity: 'filter',                      options: this.standard_opts },
      {table: 't_filter_option',               entity: 'filter_option',               options: this.standard_opts },
      {table: 't_group',                       entity: 'group',                       options: this.standard_opts },
      {table: 't_image_type',                  entity: 'image_type',                  options: this.standard_opts },
      {table: 't_lifecycle',                   entity: 'lifecycle',                   options: this.standard_opts },
      {table: 't_marketing_region',            entity: 'marketing_region',            options: this.standard_opts },
      {table: 't_packaging_factor',            entity: 'packaging_factor',            options: this.standard_opts },
      {table: 't_product',                     entity: 'product',                     options: this.standard_opts },
      {table: 't_product_certificate',         entity: 'product_certificate',         options: this.standard_opts },
      {table: 't_product_custom_attribute',    entity: 'product_custom_attribute',    options: this.standard_opts },
      {table: 't_product_equipment_connect',   entity: 'product_equipment_connect',   options: this.standard_opts },
      
      {table: 't_product_family_connect',      entity: 'product_family_connect',      options: this.standard_opts },
      {table: 't_product_filter_option',       entity: 'product_filter_option',       options: this.standard_opts },
      {table: 't_product_image',               entity: 'product_image',               options: this.standard_opts },
      {table: 't_product_marketing_region',    entity: 'product_marketing_region',    options: this.standard_opts },
      {table: 't_product_oem_reference',       entity: 'product_oem_reference',       options: this.standard_opts },
      {table: 't_product_set',                 entity: 'product_set',                 options: this.standard_opts },
      {table: 't_product_supplier',            entity: 'product_supplier',            options: this.standard_opts },
      {table: 't_product_type',                entity: 'product_type',                options: this.standard_opts },
      {table: 't_supplier',                    entity: 'supplier',                    options: this.standard_opts },
      
      {table: 't_test_pet',                    entity: 'pet',                         options: this.standard_opts },//for dataload testing
      

      //views
      {table: 'v_category',                    entity: 'category_view'},
      {table: 'v_equipment_available_region',  entity: 'equipment_available_region_view'},
      {table: 'v_equipment_group',             entity: 'equipment_group_view'},
      {table: 'v_equipment',                   entity: 'equipment_view'},
      {table: 'v_family',                      entity: 'family_view'},
      {table: 'v_filter_option',               entity: 'filter_option_view'},
      {table: 'v_product',                     entity: 'product_view'},
      {table: 'v_product_catalog',             entity: 'product_catalog_view'},
      {table: 'v_product_custom_attribute',    entity: 'product_custom_attribute_view'},
      {table: 'v_product_equipment_connect',   entity: 'product_equipment_connect_view'},
      {table: 'v_product_filter_option',       entity: 'product_filter_option_view'},
      {table: 'v_product_image',               entity: 'product_image_view'},
      {table: 'v_product_marketing_region',    entity: 'product_marketing_region_view'},
      {table: 'v_product_oem_reference',       entity: 'product_oem_reference_view'},
      {table: 'v_product_set',                 entity: 'product_set_view'},
      {table: 'v_product_specifications',      entity: 'product_specifications_view'},
      
    ];

  }

  /**
   * Gets a data access object (DAO) for a database table or view model interactions
   * @param {string} entity lowercased, underscored entity name
   */
   getDao(entity){
    let e = this.registry.find((reg)=>{return reg.entity === entity; });
    if(!e) throw new Error(`No registered database entity found for "${entity}".`);
    return new Dao(e.table, e.entity, e.options, this.pool);
  }
}

exports.DaoFactory = DaoFactory;