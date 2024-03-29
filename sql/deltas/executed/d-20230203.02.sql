/* 
  For: Card 43 - OPC - Search result - product images (show all, not just 2)

  Adds image_link_connector_distal and image_type_id from t_family to the product view and product catalog view.

  Created:          2/1/2023 by Derek Gau
  Deployed to TEST: 2/1/2023 by Derek Gau
  Deployed to PROD: 2/7/2023 by Derek Gau

  Note: please keep any data load scripts in a separate file. Structural changes should generally not be mixed with data additions.
*/

drop view if exists v_product;

create view v_product as select 
p.id, p.sku, p.oem, p.is_oem, p.name_en, p.name_seo, p.description_en, p.name_zh, p.description_zh, 
p.product_type_id, t.name_en as product_type_en, t.name_zh as product_type_zh, 
p.family_id, f.family_code, f.family_connector_code, f.name_en as family_name_en, f.video_link as family_video_link, 
f.image_link_connector_distal as family_image_link, f.image_type_id as family_image_type_id,
f.group_id, g.group_code,
p.oem_brand_id, b.name_en as oem_brand_en, b.name_zh as oem_brand_zh,
p.category_id, c.name_en as category_en, c.name_zh as category_zh,
p.publish, p.stock_usa, p.stock_eu, p.stock_zh, p.popular, p.featured,
p.has_components,
p.outsourced, p.source_region, p.minimum_profit_pct, p.leadtime, p.dealer_price,
p.ad_url, p.list_price_us, p.list_price_eu, p.list_price_zh, p.new_arrival,
nf.content as product_name_formula, 
df.content as product_description_formula, 
pf.name as packaging_factor, p.packaging_factor_id, p.price_us, p.price_zh, p.price_eu,
p.weight_kg, p.weight_lbs, p.warranty_duration_months, p.tags, p.video_link, p.note_internal, p.note_client,
p.lifecycle_id, l.name_en as lifecycle_en, l.name_zh as lifecycle_zh,
pi.image_type_id, pi.image_link, 
p.created, p.updated, p.version
from t_product p
left outer join t_category     c on c.id = p.category_id
left outer join t_formula      nf on nf.id = c.product_name_formula_id
left outer join t_formula      df on df.id = c.product_description_formula_id
left outer join t_family       f on f.id = p.family_id
left outer join t_group        g on g.id = f.group_id
left outer join t_product_type t on t.id = p.product_type_id
left outer join t_lifecycle    l on l.id = p.lifecycle_id
left outer join t_brand        b on b.id = p.oem_brand_id
left outer join t_packaging_factor pf on pf.id = p.packaging_factor_id
left outer join (
  select image_type_id, image_link, product_id from t_product_image
  where id in (
    select min(id) from t_product_image group by product_id
  )
) as pi on pi.product_id = p.id;
-- the last join selects the 1st available image from the product image table (added Jan 2023). 

drop view if exists v_product_catalog;

create view v_product_catalog as
select p.id, p.name_en, p.description_en, p.name_seo, p.sku, p.category_id, p.category_en, p.oem_brand_id, p.oem_brand_en, p.oem, 
p.publish, p.stock_usa, p.stock_eu, p.stock_zh, p.popular, p.featured, p.has_components, p.created, p.updated,
p.outsourced, p.source_region, p.minimum_profit_pct, p.leadtime, p.dealer_price,
p.ad_url, p.list_price_us, p.list_price_eu, p.list_price_zh, p.new_arrival,
p.family_image_link, p.family_image_type_id,
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