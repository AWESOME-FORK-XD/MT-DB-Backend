/* 
  Adds marketing region, cost, and profit info to product supplier.

  Created:          01/03/2023 by Derek Gau
  Deployed to TEST: 01/03/2023 by Derek Gau
  Deployed to PROD: 01/03/2023 by Derek Gau

*/
alter table t_product_supplier 
add column marketing_region_id int unsigned default null,
add column purchase_price decimal(9,2) default null,
add column minimum_profit int default null,
add column import_duty_us decimal(9,2) default null,
add column import_duty_eu decimal(9,2) default null,
add column import_duty_zh decimal(9,2) default null,
add column shipping_cost_us decimal(9,2) default null,
add column shipping_cost_eu decimal(9,2) default null,
add column shipping_cost_zh decimal(9,2) default null,
add column dealer_price_eu decimal(9,2) default null,
add column dealer_price_us decimal(9,2) default null,
add column dealer_price_zh decimal(9,2) default null;

alter table t_product_supplier 
add constraint fk_product_supplier_mktg_region  FOREIGN KEY (`marketing_region_id`) REFERENCES `t_marketing_region` (`id`);