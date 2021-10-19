/* 
  Add IS OEM column to tables and views.

  Created: 11/19/2021 by Derek Gau
  Deployed: 
*/
alter table t_product_oem_reference add column is_oem bit not null;

-- drop and recreate dependent view to get new column.
drop view if exists v_product_oem_reference;

create view v_product_oem_reference as
select por.*, b.name_en as brand_en, b.name_zh as brand_zh
from t_product_oem_reference por
left outer join t_brand b on b.id = por.brand_id;