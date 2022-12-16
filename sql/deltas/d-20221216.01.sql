/* 
  Adds `is_popular_branded` column to t_brand table.
  Created: 12/16/2022 by Derek Gau
  Deployed to TEST: 12/16/2022 by Derek Gau
  Deployed to PROD: 

*/
alter table t_brand add column `is_popular_branded` bit not null;
