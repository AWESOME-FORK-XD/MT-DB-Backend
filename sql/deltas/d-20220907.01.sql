/* 
  Adds a created column to the product catalog view 
  
  Created: 9/7/2022 by Derek Gau
  Deployed: 
*/

drop view if exists v_product_catalog;

create view v_product_catalog as
select p.id, p.name_en, p.sku, p.category_id, p.category_en, p.oem_brand_id, p.oem_brand_en, p.oem, 
p.publish, p.stock_usa, p.stock_eu, p.stock_zh, p.popular, p.featured, p.has_components, p.created, p.updated,
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

