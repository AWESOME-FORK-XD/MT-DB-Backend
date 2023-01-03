/* 
  Adjust priority order of product and family images by using the t_image_type ordering.
  
  Created: 01/03/2022 by Derek Gau
  Deployed to TEST: 01/03/2022 by Derek Gau
  Deployed to PROD: 01/03/2022 by Derek Gau
*/

drop view if exists v_product_image;

create view v_product_image as select pi.id, pi.product_id, pi.image_type_id,
it.name as image_type, it.priority as image_type_priority,
pi.image_link, pi.created, pi.updated, pi.version 
from t_product_image pi 
left outer join t_image_type it on it.id = pi.image_type_id;

drop view if exists v_family;

create view v_family as select f.id, f.name_en, f.family_code, f.family_connector_code, 
f.group_id, g.group_code, f.image_type_id, f.image_link_connector_distal, f.video_link, f.created, f.updated,
it.priority as image_type_priority
from t_family f
left outer join t_image_type it on it.id=f.image_type_id
left outer join t_group g on g.id=f.group_id;
