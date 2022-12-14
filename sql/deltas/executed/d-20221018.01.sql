/* 
  Adds customer branding tables to the database.
  
  Created: 10/18/2022 by Derek Gau
  Deployed to TEST: 11/30/2022 by Derek Gau
  Deployed to PROD: 12/14/2022 by Derek Gau
*/

drop table if exists t_product_customer;
drop table if exists t_customer;

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

ALTER TABLE `t_customer` 
  ADD CONSTRAINT `fk_customer_marketing_region` FOREIGN KEY (`marketing_region_id`) REFERENCES `t_marketing_region` (`id`);


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

ALTER TABLE `t_product_customer` 
  ADD CONSTRAINT `fk_prodcust_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`);

ALTER TABLE `t_product_customer` 
  ADD CONSTRAINT `fk_prodcust_customer` FOREIGN KEY (`customer_id`) REFERENCES `t_customer` (`id`);

INSERT INTO t_customer (id, company_name, marketing_region_id) values
(1, 'Medten', 1),
(2, 'MoMedico', 2);