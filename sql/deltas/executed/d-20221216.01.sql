/* 
  Adds `is_popular_branded` column to t_brand table.

  Remove deprecated `opc_visible` field from t_filter table.
  
  Created: 12/16/2022 by Derek Gau
  Deployed to TEST: 12/16/2022 by Derek Gau
  Deployed to PROD: 1/4/2023 by Derek Gau

*/
alter table t_brand add column `is_popular_branded` bit not null;

alter table t_filter drop column `opc_visible`;