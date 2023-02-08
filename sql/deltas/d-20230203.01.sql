/* 
  Add a uniqueness constraint to the product OEM reference table to prevent duplicate brand/name combinations per product.

  Provide a short list of database changes in this script.
  
  Created:          2/1/2023 by Derek Gau
  Deployed to TEST: 2/1/2023 by Derek Gau
  Deployed to PROD: MM/DD/YYYY by (author)

  Note: please keep any data load scripts in a separate file. Structural changes should generally not be mixed with data additions.
*/

ALTER TABLE `t_product_oem_reference`
  ADD CONSTRAINT `product_oem_brand_name_UNIQUE` UNIQUE(product_id, brand_id, name);

