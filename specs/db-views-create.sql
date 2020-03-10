
-- main product view
create view v_product as select 
p.id, p.sku, p.oem, p.name_en, p.description_en, p.name_zh, p.description_zh, 
p.product_type_id, t.name_en as product_type_en, t.name_zh as product_type_zh, 
p.family_id, f.family_code, f.family_connector_code,
b.id as brand_id, b.name_en as brand_en, b.name_zh as brand_zh,
p.category_id, c.name_en as category_en, c.name_zh as category_zh, c.product_name_formula, c.product_description_formula, c.valid_image_types,
p.packaging_factor, p.price,
p.supplier_id, u.name_en as supplier_en, u.name_zh as supplier_zh,
p.weight, p.warranty_duration_months, p.tags,
p.lifecycle_id, l.name_en as lifecycle_en, l.name_zh as lifecycle_zh,
p.created, p.updated, p.version
from t_product p
join t_category     c on c.id = p.category_id
left outer join t_family       f on f.id = p.family_id
left outer join t_product_type t on t.id = p.product_type_id
left outer join t_supplier     u on u.id = p.supplier_id
left outer join t_lifecycle    l on l.id = p.lifecycle_id
left outer join t_brand        b on b.id = f.brand_id;

-- filters and filter options
create view v_filter_option as 
select f.category_id, f.id as filter_id, f.name_en as filter_en, f.name_zh as filter_zh, 
o.id as filter_option_id, o.option_en, o.option_zh
from t_filter f 
join t_filter_option o on o.filter_id = f.id
order by filter_id asc, filter_option_id asc;

-- filter_id is needed to render the dynamic elements properly.
create view v_product_filter_option
as select pfo.id, pfo.product_id, f.filter_id as filter_id, filter_option_id, pfo.created, pfo.updated, pfo.version
from t_product_filter_option pfo
join t_filter_option f on f.id = pfo.filter_option_id
order by product_id asc, filter_id asc;

-- family with brand, group and technology info
create view v_family as select f.`id`, f.`family_code`, f.`family_connector_code`, 
f.`brand_id`, b.`name_en` as brand_en, b.`name_zh` as brand_zh,
f.`group_id`, g.`group_code`,
f.`technology_id`, t.`name` as technology,
f.`image_link_connector_distal`, f.`created`, f.`updated`
from t_family f
left outer join t_brand b on b.id=f.brand_id 
left outer join t_group g on g.id=f.group_id 
left outer join t_technology t on t.id=f.technology_id;
