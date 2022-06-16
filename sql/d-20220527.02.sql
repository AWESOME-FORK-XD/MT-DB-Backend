/* 
  Modify filter option and product catalog views to return filter option information for each product.
  Created: 5/27/2022 by Derek Gau
  Deployed: 

*/
drop view if exists v_filter_option;

-- filters and filter options
create view v_filter_option as 
select f.category_id, c.name_en as category_en, c.name_zh as category_zh, f.id as filter_id, f.visible_in_catalog, f.name_en as filter_en, f.name_zh as filter_zh, 
o.id as filter_option_id, o.option_en, o.option_zh, o.option_us
from t_filter f 
join t_category c on c.id = f.category_id
join t_filter_option o on o.filter_id = f.id
order by filter_id asc, filter_option_id asc;


drop view if exists v_product_catalog;

create view v_product_catalog as
select p.id, p.name_en, p.sku, p.category_id, p.category_en, p.family_id, p.oem_brand_id, p.oem_brand_en, p.oem, 
mods.models, 
oref.oem_refs, 
pfilo.filter_option_ids
from v_product p
left outer join (
  select product_id, GROUP_CONCAT( distinct name separator '|' ) as oem_refs from t_product_oem_reference group by product_id
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