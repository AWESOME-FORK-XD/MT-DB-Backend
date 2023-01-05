/* 
  Adds one (if available) image and its type id from the product image table to the base product view. This facilitates some 
  basic display behavior in the db maintenance app.

  Also adds group_id and group_code for link convenience.
  
  Created:          01/04/2023 by Derek Gau 
  Deployed to TEST: 01/04/2023 by Derek Gau 
  Deployed to PROD: 

*/
drop view if exists v_product;

create view v_product as select 
p.id, p.sku, p.oem, p.is_oem, p.name_en, p.name_seo, p.description_en, p.name_zh, p.description_zh, 
p.product_type_id, t.name_en as product_type_en, t.name_zh as product_type_zh, 
p.family_id, f.family_code, f.family_connector_code, f.name_en as family_name_en, f.video_link as family_video_link,
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