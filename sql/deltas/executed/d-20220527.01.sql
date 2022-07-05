/* 
  Add a column governing whether a filter is visible on the product catalog.
  Created: 5/27/2022 by Derek Gau
  Deployed: 7/5/2022 by Derek Gau

*/
alter table t_filter add column visible_in_catalog bit not null;