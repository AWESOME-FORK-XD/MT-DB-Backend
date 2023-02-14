/* 
  Adjust buyer price table to include negotiated price, remove decimal precision from discount and rename it to discount_percentage.
  Reference: https://trello.com/c/QOjrc42o/197-backend-197-tbuyerprice-additions
  
  Add "manually created" checkboxes on t_product for title and description fields.
  Reference: https://trello.com/c/QFxgGg9c/199-backend-199-add-title-and-description-boolean-fields-to-tproduct

  Created:          02/08/2023 by Derek Gau
  Deployed to TEST: MM/DD/YYYY by (author)
  Deployed to PROD: MM/DD/YYYY by (author)

*/

-- buyer price
ALTER TABLE t_buyer_price MODIFY COLUMN `discount` SMALLINT unsigned DEFAULT NULL;
ALTER TABLE t_buyer_price RENAME COLUMN  `discount` TO  `discount_percentage`;
ALTER TABLE t_buyer_price ADD COLUMN `discount_price` DECIMAL(9,2) DEFAULT NULL;

-- product and product view
ALTER TABLE t_product 
  ADD COLUMN  `name_en_customized` BIT NOT NULL,
  ADD COLUMN  `description_en_customized` BIT NOT NULL,
  ADD COLUMN  `name_zh_customized` BIT NOT NULL,
  ADD COLUMN  `description_zh_customized` BIT NOT NULL;

DROP VIEW IF EXISTS v_product;

CREATE VIEW v_product as select 
p.id, p.sku, p.oem, p.is_oem, p.name_en, p.name_en_customized, p.name_seo, p.description_en, p.description_zh_customized, p.name_zh, p.name_zh_customized, p.description_zh, p.description_zh_customized,
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