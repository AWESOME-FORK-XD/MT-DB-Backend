/**
  Table creation script for the Medten Product database.

  Authors: Andres Orjuela, Derek Gau
*/

--
-- org, user, and related authorization tables.
--
drop table if exists t_user_org;
drop table if exists t_user_role;
drop table if exists t_user;
drop table if exists t_org;

CREATE TABLE `t_user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified` BIT NOT NULL,
  `email_verification_token` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `mobile_phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `must_reset_password`  BIT NOT NULL,
  `bad_login_attempts` int(11) NOT NULL DEFAULT '0',
  `last_login` timestamp NULL DEFAULT NULL,
  `login_count` int(11) NOT NULL DEFAULT '0',
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_token_expires` timestamp NULL DEFAULT NULL,
  `timezone` varchar(100) DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  FULLTEXT KEY `username` (`username`,`first_name`,`last_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `t_user_role` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `role` varchar(100) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/**
  Users can be assigned an org
*/
CREATE TABLE `t_org` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `t_user_org` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `org_id` int(11) unsigned NOT NULL,
  `is_default` BIT NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Auth relationships
ALTER TABLE `t_user_role`
  ADD CONSTRAINT `fk_user_role_user` FOREIGN KEY (`user_id`) REFERENCES `t_user` (`id`);

ALTER TABLE `t_user_org`
  ADD CONSTRAINT `fk_user_org_client` FOREIGN KEY (`org_id`) REFERENCES `t_org` (`id`);

ALTER TABLE `t_user_org`
  ADD CONSTRAINT `fk_user_org_user` FOREIGN KEY (`user_id`) REFERENCES `t_user` (`id`);



-- Create syntax for TABLE 't_brand'
CREATE TABLE `t_brand` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `parent_id` int(11) unsigned DEFAULT NULL,
  `is_oem` tinyint(3) NOT NULL DEFAULT '0',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_category'
CREATE TABLE `t_category` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `parent_id` int(11) unsigned DEFAULT NULL,
  `product_name_formula_id` int(11) unsigned DEFAULT NULL,
  `product_description_formula_id` int(11) unsigned DEFAULT NULL,
  `featured` bit not null,
  `image_url` varchar(255) not null,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_certificate'
CREATE TABLE `t_certificate` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_custom_attribute'
CREATE TABLE `t_custom_attribute` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int(11) unsigned NOT NULL,
  `value_en` varchar(255) DEFAULT NULL,
  `value_zh` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_product_custom_attribute'
CREATE TABLE `t_product_custom_attribute` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `custom_attribute_id` int(11) unsigned NOT NULL,
  `product_id` int(11) NOT NULL,
  `name_en` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `name_zh` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_equipment'
CREATE TABLE `t_equipment` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `brand_id` int(11) unsigned NOT NULL,
  `equipment_type_id` int(11) unsigned NOT NULL,
  `model` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_equipment_group'
CREATE TABLE `t_equipment_group` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `equipment_id` int(11) unsigned NOT NULL,
  `group_id` int(11) unsigned NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_equipment_image'
CREATE TABLE `t_equipment_image` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `equipment_id` int(11) unsigned NOT NULL,
  `image_link` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_equipment_type'
CREATE TABLE `t_equipment_type` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_family'
CREATE TABLE `t_family` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `family_code` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `group_id` int(11) unsigned NOT NULL,
  `family_connector_code` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `image_link_connector_distal` varchar(255) DEFAULT NULL,
  `name_en` varchar(255) DEFAULT null,
  `name_edit_user_id` int unsigned DEFAULT null,
  `name_edit_timestamp` timestamp DEFAULT null,
  `video_link` varchar(255) DEFAULT null,
  `family_name_formula_id` int unsigned DEFAULT null
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- Create syntax for TABLE 't_filter'
CREATE TABLE `t_filter` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int(11) unsigned NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `name_zh` varchar(255) DEFAULT NULL,
  `visible_in_catalog` bit NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 't_filter_option'
CREATE TABLE `t_filter_option` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `filter_id` int(11) unsigned NOT NULL,
  `option_en` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `option_zh` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `option_us` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 't_group'
CREATE TABLE `t_group` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `group_code` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_image_type'
CREATE TABLE `t_image_type` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_lifecycle'
CREATE TABLE `t_lifecycle` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_product'
CREATE TABLE `t_product` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `sku` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `product_type_id` int(11) unsigned DEFAULT NULL,
  `oem` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `is_oem` bit NOT NULL,
  `oem_brand_id` int(11) unsigned DEFAULT NULL,
  `family_id` int(11) unsigned DEFAULT NULL,
  `category_id` int(11) unsigned DEFAULT NULL,
  `name_en` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `name_en_edit_user_id` int unsigned DEFAULT null,
  `name_en_edit_timestamp` timestamp DEFAULT null,
  `description_en` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `name_zh` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `name_zh_edit_user_id` int unsigned DEFAULT null,
  `name_zh_edit_timestamp` timestamp DEFAULT null,
  `description_zh` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `packaging_factor_id` int(11) unsigned DEFAULT NULL,
  -- `packaging_factor` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '1',
  `price_us` decimal(9,2) DEFAULT NULL,
  `price_zh` decimal(9,2) DEFAULT NULL,
  `price_eu` decimal(9,2) DEFAULT NULL,
  `weight_kg` decimal(9,4) DEFAULT NULL,
  `weight_lbs` decimal(9,4) DEFAULT NULL,
  `warranty_duration_months` smallint(6) DEFAULT '0',
  `tags` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `lifecycle_id` int(11) unsigned DEFAULT NULL,
  `video_link` varchar(255) DEFAULT null,
  `note_internal` varchar(512) DEFAULT null,
  `note_client` varchar(512) DEFAULT null,
  `publish` bit not null,
  `stock_usa` smallint unsigned not null default '0', 
  `stock_eu` smallint unsigned not null default '0', 
  `stock_zh` smallint unsigned not null default '0',
  `outsourced` bit not null,
  `source_region` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `minimum_profit_pct` smallint(6) DEFAULT NULL,
  `leadtime` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `dealer_price` decimal(9,2) DEFAULT NULL,
  `ad_url` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `list_price_us` decimal(9,2) DEFAULT NULL,
  `new_arrival` bit not null,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_product_certificate'
CREATE TABLE `t_product_certificate` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned NOT NULL,
  `certificate_id` int(11) unsigned NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- Create syntax for TABLE 't_product_equipent_connect'
CREATE TABLE `t_product_equipment_connect` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(10) unsigned DEFAULT NULL,
  `equipment_id` int(10) unsigned DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 't_product_family_connect'
CREATE TABLE `t_product_family_connect` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned DEFAULT NULL,
  `family_id` int(11) unsigned DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 't_product_image'
CREATE TABLE `t_product_image` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned DEFAULT NULL,
  `image_type_id` int(11) unsigned DEFAULT NULL,
  `image_link` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `priority_order` smallint DEFAULT 0,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 't_product_oem_reference'
CREATE TABLE `t_product_oem_reference` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned NOT NULL,
  `brand_id` int(11) unsigned NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `is_oem` bit NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_product_filter_option'
CREATE TABLE `t_product_filter_option` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned NOT NULL,
  `filter_option_id` int(11) unsigned NOT NULL,
  `priority_order` smallint unsigned NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
);

-- Create syntax for TABLE 't_product_set'
CREATE TABLE `t_product_set` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `parent_product_id` int(11) unsigned NOT NULL,
  `child_product_id` int(11) unsigned NOT NULL,
  `description` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT '1',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 't_product_type'
CREATE TABLE `t_product_type` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_supplier'
CREATE TABLE `t_supplier` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL DEFAULT '',
  `name_zh` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_formula'
CREATE TABLE `t_formula` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 't_packaging_factor'
CREATE TABLE `t_packaging_factor` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Create syntax for TABLE 't_account'
CREATE TABLE `t_user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified` BIT NOT NULL,
  `email_verification_token` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `mobile_phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `must_reset_password`  BIT NOT NULL,
  `bad_login_attempts` int(11) NOT NULL DEFAULT '0',
  `last_login` timestamp NULL DEFAULT NULL,
  `login_count` int(11) NOT NULL DEFAULT '0',
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_token_expires` timestamp NULL DEFAULT NULL,
  `timezone` varchar(100) DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  FULLTEXT KEY `username` (`username`,`first_name`,`last_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Create syntax for TABLE 't_api_key'. Keys can be long-lived, or they can be generated on user login for temporary access.
CREATE TABLE `t_api_key` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned DEFAULT NULL,
  `account_id` int(11) unsigned NOT NULL,
  `apikey` varchar(50) NOT NULL DEFAULT '',
  `description` varchar(255) NOT NULL DEFAULT '',
  `status` varchar(20) NOT NULL,
  `expires` timestamp NULL DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 't_product_supplier'
CREATE TABLE `t_product_supplier` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned DEFAULT NULL,
  `supplier_id` int(11) unsigned DEFAULT NULL,
  `supplier_price` decimal(9,2) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 't_available_region'
CREATE TABLE `t_available_region` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 't_equipment_available_region'
CREATE TABLE `t_equipment_available_region` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `equipment_id` int(11) unsigned DEFAULT NULL,
  `available_region_id` int(11) unsigned DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 't_marketing_region'
CREATE TABLE `t_marketing_region` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 't_product_marketing_region'
CREATE TABLE `t_product_marketing_region` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned DEFAULT NULL,
  `marketing_region_id` int(11) unsigned DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `t_user_role` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `role` varchar(100) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- for branded experience...
CREATE TABLE `t_customer` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) NOT NULL DEFAULT '',
  `marketing_region_id` int(11) unsigned NOT NULL,
  `email` varchar(255) NOT NULL DEFAULT '',
  `phone` varchar(255) NOT NULL DEFAULT '',
  `primary_color` varchar(10) NOT NULL DEFAULT '',
  `primary_text` varchar(500) NOT NULL DEFAULT '',
  `secondary_color` varchar(10) NOT NULL DEFAULT '',
  `secondary_text` varchar(500) NOT NULL DEFAULT '',
  `logo_url` varchar(255) NOT NULL DEFAULT '',
  `about_url` varchar(255) NOT NULL DEFAULT '',
  `cart_form_post_url` varchar(255) NOT NULL DEFAULT '',
  `origin` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_product_customer` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned NOT NULL,
  `customer_id` int(11) unsigned NOT NULL,
  `sku` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*
  Foreign Key relationships follow.
*/
ALTER TABLE `t_category` 
  ADD CONSTRAINT `fk_product_name_formula` FOREIGN KEY (`product_name_formula_id`) REFERENCES `t_formula` (`id`);

ALTER TABLE `t_category` 
  ADD CONSTRAINT `fk_product_description_formula` FOREIGN KEY (`product_description_formula_id`) REFERENCES `t_formula` (`id`);


ALTER TABLE `t_custom_attribute` 
  ADD CONSTRAINT `fk_custom_attribute_category` FOREIGN KEY (`category_id`) REFERENCES `t_category` (`id`);


ALTER TABLE `t_product_custom_attribute` 
  ADD CONSTRAINT `fk_custom_attribute_option` FOREIGN KEY (`custom_attribute_id`) REFERENCES `t_custom_attribute` (`id`);

ALTER TABLE `t_product_custom_attribute` 
  ADD CONSTRAINT `fk_custom_attribute_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;


ALTER TABLE `t_equipment` 
  ADD CONSTRAINT `fk_equipment_brand` FOREIGN KEY (`brand_id`) REFERENCES `t_brand` (`id`);
  
ALTER TABLE `t_equipment` 
  ADD CONSTRAINT `fk_equipment_type` FOREIGN KEY (`equipment_type_id`) REFERENCES `t_equipment_type` (`id`);


ALTER TABLE `t_equipment_group` 
  ADD CONSTRAINT `fk_equipment_group_equip` FOREIGN KEY (`equipment_id`) REFERENCES `t_equipment` (`id`);
  
ALTER TABLE `t_equipment_group` 
  ADD CONSTRAINT `fk_equipment_group_group` FOREIGN KEY (`group_id`) REFERENCES `t_group` (`id`);


ALTER TABLE `t_equipment_image` 
  ADD CONSTRAINT `fk_equipment_image_equip` FOREIGN KEY (`equipment_id`) REFERENCES `t_equipment` (`id`);


ALTER TABLE `t_family` 
  ADD CONSTRAINT `fk_family_group` FOREIGN KEY (`group_id`) REFERENCES `t_group` (`id`);


ALTER TABLE `t_filter` 
  ADD CONSTRAINT `fk_filter_category` FOREIGN KEY (`category_id`) REFERENCES `t_category` (`id`);


ALTER TABLE `t_filter_option` 
  ADD CONSTRAINT `fk_filter_option_filter` FOREIGN KEY (`filter_id`) REFERENCES `t_filter` (`id`);


ALTER TABLE `t_product` 
  ADD CONSTRAINT `fk_product_type` FOREIGN KEY (`product_type_id`) REFERENCES `t_product_type` (`id`);

ALTER TABLE `t_product` 
  ADD CONSTRAINT `fk_product_family` FOREIGN KEY (`family_id`) REFERENCES `t_family` (`id`);

ALTER TABLE `t_product` 
  ADD CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `t_category` (`id`);

ALTER TABLE `t_product` 
  ADD CONSTRAINT `fk_product_lifecycle` FOREIGN KEY (`lifecycle_id`) REFERENCES `t_lifecycle` (`id`);

ALTER TABLE `t_product` 
  ADD CONSTRAINT `fk_oem_brand` FOREIGN KEY (`oem_brand_id`) REFERENCES `t_brand` (`id`);


ALTER TABLE `t_product_certificate` 
  ADD CONSTRAINT `fk_product_certificate_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`)  ON DELETE CASCADE;

ALTER TABLE `t_product_certificate` 
  ADD CONSTRAINT `fk_product_certificate_cert` FOREIGN KEY (`certificate_id`) REFERENCES `t_certificate` (`id`);


ALTER TABLE `t_product_equipment_connect` 
  ADD CONSTRAINT `fk_product_equipment_connect_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`)  ON DELETE CASCADE;

ALTER TABLE `t_product_equipment_connect` 
  ADD CONSTRAINT `fk_product_equipment_connect_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `t_equipment` (`id`);
  

ALTER TABLE `t_product_family_connect` 
  ADD CONSTRAINT `fk_product_family_connect_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;

ALTER TABLE `t_product_family_connect` 
  ADD CONSTRAINT `fk_product_family_connect_family` FOREIGN KEY (`family_id`) REFERENCES `t_family` (`id`);


ALTER TABLE `t_product_image` 
  ADD CONSTRAINT `fk_product_image_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;

ALTER TABLE `t_product_image` 
  ADD CONSTRAINT `fk_product_image_type` FOREIGN KEY (`image_type_id`) REFERENCES `t_image_type` (`id`);


ALTER TABLE `t_product_oem_reference` 
  ADD CONSTRAINT `fk_product_oem_reference_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;

ALTER TABLE `t_product_oem_reference` 
  ADD CONSTRAINT `fk_product_oem_reference_brand` FOREIGN KEY (`brand_id`) REFERENCES `t_brand` (`id`);


ALTER TABLE `t_product_filter_option` 
  ADD CONSTRAINT `fk_product_option_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;

ALTER TABLE `t_product_filter_option` 
  ADD CONSTRAINT `fk_product_option_option` FOREIGN KEY (`filter_option_id`) REFERENCES `t_filter_option` (`id`);


ALTER TABLE `t_product_set` 
  ADD CONSTRAINT `fk_product_set_parent_product` FOREIGN KEY (`parent_product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;

ALTER TABLE `t_product_set` 
  ADD CONSTRAINT `fk_product_set_child_product` FOREIGN KEY (`child_product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;


ALTER TABLE `t_product_supplier` 
  ADD CONSTRAINT `fk_product_supplier_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;

ALTER TABLE `t_product_supplier` 
  ADD CONSTRAINT `fk_product_supplier_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `t_supplier` (`id`);


ALTER TABLE `t_equipment_available_region` 
  ADD CONSTRAINT `fk_equip_avail_region_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `t_equipment` (`id`);

ALTER TABLE `t_equipment_available_region` 
  ADD CONSTRAINT `fk_equip_avail_region_region` FOREIGN KEY (`available_region_id`) REFERENCES `t_available_region` (`id`);


ALTER TABLE `t_product_marketing_region` 
  ADD CONSTRAINT `fk_prod_mkt_reg_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`) ON DELETE CASCADE;

ALTER TABLE `t_product_marketing_region` 
  ADD CONSTRAINT `fk_prod_mkt_reg_region` FOREIGN KEY (`marketing_region_id`) REFERENCES `t_marketing_region` (`id`);

ALTER TABLE `t_family` 
  ADD CONSTRAINT `fk_family_name_formula` FOREIGN KEY (`family_name_formula_id`) REFERENCES `t_formula` (`id`);


-- Auth relationships

ALTER TABLE `t_user` 
  ADD CONSTRAINT `fk_user_account` FOREIGN KEY (`default_account_id`) REFERENCES `t_account` (`id`);

ALTER TABLE `t_api_key` 
  ADD CONSTRAINT `fk_api_key_account` FOREIGN KEY (`account_id`) REFERENCES `t_account` (`id`);

ALTER TABLE `t_api_key` 
  ADD CONSTRAINT `fk_api_key_user` FOREIGN KEY (`user_id`) REFERENCES `t_user` (`id`);


ALTER TABLE `t_user_role`
  ADD CONSTRAINT `fk_user_role_user` FOREIGN KEY (`user_id`) REFERENCES `t_user` (`id`);

-- for branding tables
ALTER TABLE `t_customer` 
  ADD CONSTRAINT `fk_customer_marketing_region` FOREIGN KEY (`marketing_region_id`) REFERENCES `t_marketing_region` (`id`);

ALTER TABLE `t_product_customer` 
  ADD CONSTRAINT `fk_prodcust_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`);

ALTER TABLE `t_product_customer` 
  ADD CONSTRAINT `fk_prodcust_customer` FOREIGN KEY (`customer_id`) REFERENCES `t_customer` (`id`);

