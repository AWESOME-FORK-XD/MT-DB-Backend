/*
  Fix field name issues with v_product_oem_reference
  Created: 10/1/2021 by Derek Gau
  Deployed: 
*/

drop view if exists v_product_oem_reference;

create view v_product_oem_reference as
select por.*, b.is_oem, b.name_en as brand_en, b.name_zh as brand_zh
from t_product_oem_reference por
left outer join t_brand b on b.id = por.brand_id; 