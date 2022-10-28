/* 
  Several database changes to control visibility, manage UI filtering.

  Created: 10/27/2022 by Derek Gau
  Deployed: 10/28/2022 by Derek Gau
*/

-- Trello Card #23
ALTER TABLE t_family ADD column image_type_id int unsigned DEFAULT null;

ALTER TABLE t_family ADD CONSTRAINT fk_family_distal_image_type FOREIGN KEY (image_type_id) REFERENCES t_image_type (id);

DROP VIEW IF EXISTS v_family;

CREATE VIEW v_family AS SELECT f.id, f.name_en, f.family_code, f.family_connector_code, 
f.group_id, g.group_code,
f.image_type_id, f.image_link_connector_distal, f.video_link, f.created, f.updated
FROM t_family f
LEFT OUTER JOIN t_group g ON g.id=f.group_id;

-- Trello Card #45
DROP VIEW IF EXISTS v_product_filter_option;

create view v_product_filter_option
as select pfo.id, pfo.product_id, 
f.id as filter_id, f.name_en as filter_en, f.name_zh as filter_zh, f.visible_in_catalog,
fo.id as filter_option_id, fo.option_en, fo.option_zh, fo.option_us,
pfo.priority_order, pfo.created, pfo.updated, pfo.version
from t_product_filter_option pfo
left outer join t_filter_option fo on fo.id = pfo.filter_option_id
left outer join t_filter f on f.id = fo.filter_id
order by pfo.product_id asc, fo.filter_id asc;


-- Trello Card #7
ALTER TABLE t_category ADD column `publish` bit not null;

DROP VIEW IF EXISTS v_category;

create view v_category as select 
c.id, c.name_en, c.name_zh, c.parent_id, c.publish, c.featured, c.image_url,
nf.content as product_name_formula, df.content as product_description_formula, ff.content as family_name_formula,
c.created, c.updated, c.version
from t_category c 
left outer join t_formula      nf on nf.id = c.product_name_formula_id
left outer join t_formula      df on df.id = c.product_description_formula_id
left outer join t_formula      ff on ff.id = c.family_name_formula_id;