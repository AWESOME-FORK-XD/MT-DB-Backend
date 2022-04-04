/*
  useful:

SELECT group_concat( COLUMN_NAME )
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE 
    TABLE_SCHEMA = Database()
AND TABLE_NAME = 't_equipment_' ;

*/

--
-- General tables...
-- 

-- done
INSERT INTO t_available_region (id, name_en) VALUES
(1, 'USA'),
(2, 'EU'),
(3, 'China'),
(4, 'Latin America'),
(5, 'Asia (outside of China)');

-- done
INSERT INTO productdb_v2.t_brand (
 id, name_en, name_zh, parent_id, created, updated, version, is_oem
) SELECT 
 id, name_en, name_zh, parent_id, created, updated, version, 0
FROM productdb.t_brand;

-- done
INSERT INTO productdb_v2.t_formula (
 id,name,content,created,updated,version
) SELECT 
 id,name,content,created,updated,version
FROM productdb.t_formula;

-- done
INSERT INTO productdb_v2.t_category (
 id,name_en,name_zh,parent_id,product_name_formula_id,product_description_formula_id,created,updated,version
) SELECT 
 id,name_en,name_zh,parent_id,product_name_formula_id,product_description_formula_id,created,updated,version
FROM productdb.t_category;

-- done
INSERT INTO productdb_v2.t_certificate (
 id,name_en,created,updated,version
 ) SELECT 
 id,name_en,created,updated,version
FROM productdb.t_certificate;

--done
INSERT INTO productdb_v2.t_filter 
SELECT * FROM  productdb.t_filter;

--done
INSERT INTO productdb_v2.t_filter_option (
id,filter_id,option_en,option_zh,created,updated,version,option_us
) SELECT 
id,filter_id,option_en,option_zh,created,updated,version,option_en
FROM productdb.t_filter_option;

--done 
INSERT INTO productdb_v2.t_image_type 
SELECT * FROM  productdb.t_image_type;

--done
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

--done 
INSERT INTO productdb_v2.t_equipment_type 
SELECT * FROM  productdb.t_equipment_type;
--done 
INSERT INTO productdb_v2.t_group 
SELECT * FROM  productdb.t_group;
--done 
INSERT INTO productdb_v2.t_group 
SELECT * FROM  productdb.t_group;
--done 
INSERT INTO productdb_v2.t_equipment 
SELECT * FROM  productdb.t_equipment;
--done
INSERT INTO productdb_v2.t_equipment_image 
SELECT * FROM  productdb.t_equipment_image;
--done
INSERT INTO productdb_v2.t_supplier 
SELECT * FROM  productdb.t_supplier;
--
-- families and products
-- 

--done
INSERT INTO productdb_v2.t_family (
id, family_code, group_id, family_connector_code, image_link_connector_distal, created, updated, version, name_en, name_edit_user_id, name_edit_timestamp, video_link
) SELECT 
id, family_code, group_id, family_connector_code, image_link_connector_distal, created, updated, version, NULL,    NULL,              NULL,                NULL 
FROM  productdb.t_family;

--done
INSERT INTO productdb_v2.t_product_type 
SELECT * FROM  productdb.t_product_type;

--done
INSERT INTO productdb_v2.t_product (
 id, sku, product_type_id, oem, oem_brand_id, family_id, category_id, name_en, description_en, name_zh, 
 description_zh, packaging_factor_id, price_us, weight_kg, warranty_duration_months, tags, lifecycle_id, created, updated, version, 
 is_oem
) SELECT 
 id, sku, product_type_id, oem, oem_brand_id, family_id, category_id, name_en, description_en, name_zh, 
 description_zh, packaging_factor_id, price,    weight,    warranty_duration_months, tags, lifecycle_id, created, updated, version,
 0
FROM productdb.t_product;

--done
INSERT INTO productdb_v2.t_product_certificate 
SELECT * FROM  productdb.t_product_certificate;

--done
INSERT INTO productdb_v2.t_product_custom_attribute 
SELECT * FROM  productdb.t_product_custom_attribute;

--done
INSERT INTO productdb_v2.t_product_equipment_connect 
SELECT * FROM  productdb.t_product_equipment_connect;

--done
INSERT INTO productdb_v2.t_product_family 
SELECT * FROM  productdb.t_product_family;

--done
INSERT INTO productdb_v2.t_product_family_connect 
SELECT * FROM  productdb.t_product_family_connect;

--done
INSERT INTO productdb_v2.t_product_filter_option (
id, product_id, filter_option_id, created, updated, version, priority_order
)
SELECT 
id, product_id, filter_option_id, created, updated, version, 0 
FROM  productdb.t_product_filter_option;

--done
INSERT INTO productdb_v2.t_product_image (
id, product_id, image_type_id, image_link, created, updated, version, priority_order
)
SELECT 
id, product_id, image_type_id, image_link, created, updated, version, 0 
FROM  productdb.t_product_image;

--done
INSERT INTO productdb_v2.t_product_oem_reference (
id, product_id, brand_id, name, created, updated, version, is_oem
)
SELECT 
id, product_id, brand_id, name, created, updated, version, 0
FROM  productdb.t_product_oem_reference;

--done
INSERT INTO productdb_v2.t_product_set 
SELECT * FROM  productdb.t_product_set;


--
-- Orgs, Users, Roles etc.
--

INSERT INTO t_org (id, name) VALUES (1, 'Medten');

INSERT INTO t_user ( id, username, email, email_verified, first_name, last_name, status, must_reset_password ) VALUES 
(1, 'andres', 'andres@medten.com', 1, 'Andres', 'Orjuela', 'active', 1),
(2, 'mike', 'mike@medten.com', 1, 'Mike', 'Shao', 'active', 1),
(3, 'derek', 'dere@apigrate.com', 1, 'Derek', 'Gau', 'active', 1);

INSERT INTO t_user_role ( user_id, role ) VALUES 
(1, 'admin'),
(2, 'admin'),
(3, 'admin');

INSERT INTO t_user_org ( user_id, org_id, is_default ) VALUES 
(1, 1, 1),
(2, 1, 1),
(3, 1, 1);

