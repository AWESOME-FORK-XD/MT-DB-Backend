/*

  Converts a v1 product database to a v2 product database for Medten.

  useful:
  SELECT group_concat( ' ', COLUMN_NAME ) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = Database() AND TABLE_NAME = 't_product_oem_reference' ;
*/

use productdb_v2;

DELETE FROM t_product_set;
DELETE FROM t_product_oem_reference;
DELETE FROM t_product_image;
DELETE FROM t_product_filter_option;
DELETE FROM t_product_family_connect;
DELETE FROM t_product_family;
DELETE FROM t_product_equipment_connect;
DELETE FROM t_product_custom_attribute;
DELETE FROM t_product_certificate;
DELETE FROM t_product_supplier;
DELETE FROM t_product;
DELETE FROM t_product_type;
DELETE FROM t_family;

ALTER TABLE t_product_set AUTO_INCREMENT = 1;
ALTER TABLE t_product_oem_reference AUTO_INCREMENT = 1;
ALTER TABLE t_product_image AUTO_INCREMENT = 1;
ALTER TABLE t_product_filter_option AUTO_INCREMENT = 1;
ALTER TABLE t_product_family_connect AUTO_INCREMENT = 1;
ALTER TABLE t_product_family AUTO_INCREMENT = 1;
ALTER TABLE t_product_equipment_connect AUTO_INCREMENT = 1;
ALTER TABLE t_product_custom_attribute AUTO_INCREMENT = 1;
ALTER TABLE t_product_certificate AUTO_INCREMENT = 1;
ALTER TABLE t_product_supplier AUTO_INCREMENT = 1;
ALTER TABLE t_product AUTO_INCREMENT = 1;
ALTER TABLE t_product_type AUTO_INCREMENT = 1;
ALTER TABLE t_family AUTO_INCREMENT = 1;


DELETE FROM t_supplier;
DELETE FROM t_equipment_image;
DELETE FROM t_equipment_group;
DELETE FROM t_equipment_available_region;
DELETE FROM t_equipment;
DELETE FROM t_group;
DELETE FROM t_equipment_type;

ALTER TABLE t_supplier AUTO_INCREMENT = 1;
ALTER TABLE t_equipment_image AUTO_INCREMENT = 1;
ALTER TABLE t_equipment_group AUTO_INCREMENT = 1;
ALTER TABLE t_equipment_available_region AUTO_INCREMENT = 1;
ALTER TABLE t_equipment AUTO_INCREMENT = 1;
ALTER TABLE t_group AUTO_INCREMENT = 1;
ALTER TABLE t_equipment_type AUTO_INCREMENT = 1;


DELETE FROM t_packaging_factor;
DELETE FROM t_lifecycle;
DELETE FROM t_image_type;
DELETE FROM t_filter_option;
DELETE FROM t_filter;
DELETE FROM t_certificate;
DELETE FROM t_category;
DELETE FROM t_formula;
DELETE FROM t_brand;
DELETE FROM t_available_region;

ALTER TABLE t_packaging_factor AUTO_INCREMENT = 1;
ALTER TABLE t_lifecycle AUTO_INCREMENT = 1;
ALTER TABLE t_image_type AUTO_INCREMENT = 1;
ALTER TABLE t_filter_option AUTO_INCREMENT = 1;
ALTER TABLE t_filter AUTO_INCREMENT = 1;
ALTER TABLE t_certificate AUTO_INCREMENT = 1;
ALTER TABLE t_category AUTO_INCREMENT = 1;
ALTER TABLE t_formula AUTO_INCREMENT = 1;
ALTER TABLE t_brand AUTO_INCREMENT = 1;
ALTER TABLE t_available_region AUTO_INCREMENT = 1;


--
-- General tables...
-- 


INSERT INTO productdb_v2.t_available_region (id, name_en) VALUES
(1, 'USA'),
(2, 'EU'),
(3, 'China'),
(4, 'Latin America'),
(5, 'Asia (outside of China)');


INSERT INTO productdb_v2.t_brand (
 id, name_en, name_zh, parent_id, created, updated, version, is_oem
) SELECT 
 id, name_en, name_zh, parent_id, created, updated, version, 0
FROM productdb.t_brand;


INSERT INTO productdb_v2.t_formula (
 id,name,content,created,updated,version
) SELECT 
 id,name,content,created,updated,version
FROM productdb.t_formula;


INSERT INTO productdb_v2.t_category (
 id,name_en,name_zh,parent_id,product_name_formula_id,product_description_formula_id,created,updated,version
) SELECT 
 id,name_en,name_zh,parent_id,product_name_formula_id,product_description_formula_id,created,updated,version
FROM productdb.t_category;


INSERT INTO productdb_v2.t_certificate (
 id,name_en,created,updated,version
 ) SELECT 
 id,name_en,created,updated,version
FROM productdb.t_certificate;


INSERT INTO productdb_v2.t_filter 
SELECT * FROM  productdb.t_filter;


INSERT INTO productdb_v2.t_filter_option (
id,filter_id,option_en,option_zh,created,updated,version,option_us
) SELECT 
id,filter_id,option_en,option_zh,created,updated,version,option_en
FROM productdb.t_filter_option;

 
INSERT INTO productdb_v2.t_image_type 
SELECT * FROM  productdb.t_image_type;


INSERT INTO productdb_v2.t_lifecycle 
SELECT * FROM  productdb.t_lifecycle;

INSERT INTO productdb_v2.t_packaging_factor (
id,name,created,updated,version
) SELECT 
id,value,created,updated,version
FROM productdb.t_packaging_factor;

--
-- groups, equipment-related...
-- 

 
INSERT INTO productdb_v2.t_equipment_type 
SELECT * FROM  productdb.t_equipment_type;
 
INSERT INTO productdb_v2.t_group 
SELECT * FROM  productdb.t_group;
 
INSERT INTO productdb_v2.t_equipment 
SELECT * FROM  productdb.t_equipment;
 
INSERT INTO productdb_v2.t_equipment_group 
SELECT * FROM  productdb.t_equipment_group;

INSERT INTO productdb_v2.t_equipment_image 
SELECT * FROM  productdb.t_equipment_image;

INSERT INTO productdb_v2.t_supplier 
SELECT * FROM  productdb.t_supplier;
--
-- families and products
-- 


INSERT INTO productdb_v2.t_family (
id, family_code, group_id, family_connector_code, image_link_connector_distal, created, updated, version, name_en, name_edit_user_id, name_edit_timestamp, video_link
) SELECT 
id, family_code, group_id, family_connector_code, image_link_connector_distal, created, updated, version, NULL,    NULL,              NULL,                NULL 
FROM  productdb.t_family;


INSERT INTO productdb_v2.t_product_type 
SELECT * FROM  productdb.t_product_type;


INSERT INTO productdb_v2.t_product (
 id, sku, product_type_id, oem, oem_brand_id, family_id, category_id, name_en, description_en, name_zh, 
 description_zh, packaging_factor_id, price_us, weight_kg, warranty_duration_months, tags, lifecycle_id, created, updated, version, 
 is_oem
) SELECT 
 id, sku, product_type_id, oem, oem_brand_id, family_id, category_id, name_en, description_en, name_zh, 
 description_zh, packaging_factor_id, price,    weight,    warranty_duration_months, tags, lifecycle_id, created, updated, version,
 0
FROM productdb.t_product;


INSERT INTO productdb_v2.t_product_certificate 
SELECT * FROM  productdb.t_product_certificate;


INSERT INTO productdb_v2.t_product_custom_attribute 
SELECT * FROM  productdb.t_product_custom_attribute;


INSERT INTO productdb_v2.t_product_equipment_connect 
SELECT * FROM  productdb.t_product_equipment_connect;


INSERT INTO productdb_v2.t_product_family 
SELECT * FROM  productdb.t_product_family;


INSERT INTO productdb_v2.t_product_family_connect 
SELECT * FROM  productdb.t_product_family_connect;


INSERT INTO productdb_v2.t_product_filter_option (
id, product_id, filter_option_id, created, updated, version, priority_order
)
SELECT 
id, product_id, filter_option_id, created, updated, version, 0 
FROM  productdb.t_product_filter_option;


INSERT INTO productdb_v2.t_product_image (
id, product_id, image_type_id, image_link, created, updated, version, priority_order
)
SELECT 
id, product_id, image_type_id, image_link, created, updated, version, 0 
FROM  productdb.t_product_image;


INSERT INTO productdb_v2.t_product_oem_reference (
id, product_id, brand_id, name, created, updated, version, is_oem
)
SELECT 
id, product_id, brand_id, name, created, updated, version, 0
FROM  productdb.t_product_oem_reference;


INSERT INTO productdb_v2.t_product_set 
SELECT * FROM  productdb.t_product_set;


--
-- Orgs, Users, Roles etc.
--
/*
INSERT INTO productdb_v2.t_org (id, name) VALUES (1, 'Medten');

INSERT INTO productdb_v2.t_user ( id, username, email, email_verified, first_name, last_name, status, must_reset_password ) VALUES 
(1, 'andres', 'andres@medten.com', 1, 'Andres', 'Orjuela', 'active', 1),
(2, 'mike', 'mike@medten.com', 1, 'Mike', 'Shao', 'active', 1),
(3, 'derek', 'dere@apigrate.com', 1, 'Derek', 'Gau', 'active', 1);

INSERT INTO productdb_v2.t_user_role ( user_id, role ) VALUES 
(1, 'admin'),
(2, 'admin'),
(3, 'admin');

INSERT INTO productdb_v2.t_user_org ( user_id, org_id, is_default ) VALUES 
(1, 1, 1),
(2, 1, 1),
(3, 1, 1);
*/
