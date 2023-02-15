/* 
  Adds lifecycle_id to product catalog view so it can be used to search for similar products with a specific lifecycle id.
  
  Created:          02/15/2015 by dgau
  Deployed to TEST: 02/15/2015 by dgau
  Deployed to PROD: MM/DD/YYYY by (author)

*/
drop view if exists v_product_catalog;

create view v_product_catalog as
select p.id, p.name_en, p.description_en, p.name_seo, p.sku, p.category_id, p.category_en, p.oem_brand_id, p.oem_brand_en, p.oem, 
p.publish, p.stock_usa, p.stock_eu, p.stock_zh, p.popular, p.featured, p.has_components, p.created, p.updated,
p.outsourced, p.source_region, p.minimum_profit_pct, p.leadtime, p.dealer_price,
p.ad_url, p.list_price_us, p.list_price_eu, p.list_price_zh, p.new_arrival,
p.family_image_link, p.family_image_type_id, p.lifecycle_id,
mods.models, 
oref.oem_refs, p.family_id,
pfilo.filter_option_ids
from v_product p
left outer join (
  select product_id, group_concat( distinct name separator '|' ) as oem_refs from t_product_oem_reference group by product_id
) as oref on oref.product_id = p.id
left outer join (
  select p.id, GROUP_CONCAT(eq.model ORDER BY eq.model ASC SEPARATOR '|') as models
  from v_product p
  join t_family f on f.id = p.family_id
  join t_equipment_group g on g.group_id = f.group_id
  join t_equipment eq on eq.id = g.equipment_id
  group by p.id
) as mods on mods.id = p.id
left outer join (
  select product_id, GROUP_CONCAT( distinct filter_option_id separator '|' ) as filter_option_ids from t_product_filter_option group by product_id
) as pfilo on pfilo.product_id = p.id;