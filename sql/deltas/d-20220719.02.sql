/* 
  Adds featured flag, category image url to the category table. These features are used on the catalog landing page.
  Created: 7/22/2022 by Derek Gau
*/

alter table t_category add column featured bit not null;
alter table t_category add column image_url varchar(255) not null;

--
-- drop and re-add related views.
--
drop view if exists v_category;

create view v_category as select 
c.id, c.name_en, c.name_zh, c.parent_id, c.featured, c.image_url,
nf.content as product_name_formula, df.content as product_description_formula, ff.content as family_name_formula,
c.created, c.updated, c.version
from t_category c 
left outer join t_formula      nf on nf.id = c.product_name_formula_id
left outer join t_formula      df on df.id = c.product_description_formula_id
left outer join t_formula      ff on ff.id = c.family_name_formula_id;