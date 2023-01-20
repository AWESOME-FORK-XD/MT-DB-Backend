/* 
  Adds a uniqueness constraint to the t_equipment table on brand id and model.
 
  Created:          01/20/2023 by Derek Gau
  Deployed to TEST: 
  Deployed to PROD: 

*/

ALTER TABLE `t_equipment`
  ADD CONSTRAINT `equipment_brand_model_UNIQUE` UNIQUE(brand_id, model);

