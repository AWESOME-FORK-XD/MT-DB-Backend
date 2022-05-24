/* 
  Create a product catalog view. It is similar to the product view, 
  but it contains the queryable fields for searching products, 
  it also contains oem refs in one column

  Created: 3/18/2022 by Derek Gau
  Deployed: 5/24/2022 by Derek Gau

*/
drop view if exists v_product_catalog;

create view v_product_catalog as
select p.id, p.name_en, p.sku, p.category_id, p.category_en, p.oem_brand_id, p.oem_brand_en, p.oem, eq.id as oem_equipment_id, oref.oem_refs, p.family_id
from v_product p
left outer join (
  select product_id, group_concat( distinct name separator '|' ) as oem_refs from t_product_oem_reference group by product_id
) as oref on oref.product_id = p.id
left outer join t_equipment eq on eq.model = p.oem;