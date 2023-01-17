/* 
  Adds buyer pricing tables to the database.
  
  Created: 12/05/2022 by Derek Gau
  Deployed to TEST: 12/05/2022 by Derek Gau
  Deployed to PROD:  1/17/2023 by Derek Gau
*/

drop table if exists t_product_buyer;

drop table if exists t_buyer_price;

CREATE TABLE `t_buyer_price` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `org_id` int(11) unsigned NOT NULL, -- buyer is identified via t_user_org
  `product_id` int(11) unsigned DEFAULT NULL,
  `category_id` int(11) unsigned DEFAULT NULL,
  `lifecycle_id` int(11) unsigned DEFAULT NULL,
  `discount` decimal(9,2) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_product_buyer` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `org_id` int(11) unsigned NOT NULL, -- buyer is identified via t_user_org
  `product_id` int(11) unsigned DEFAULT NULL,
  `sku` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE `t_buyer_price` 
  ADD CONSTRAINT `fk_buyer_price_org` FOREIGN KEY (`org_id`) REFERENCES `t_org` (`id`);

ALTER TABLE `t_buyer_price` 
  ADD CONSTRAINT `fk_buyer_price_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`);

ALTER TABLE `t_buyer_price` 
  ADD CONSTRAINT `fk_buyer_price_category` FOREIGN KEY (`category_id`) REFERENCES `t_category` (`id`);

ALTER TABLE `t_buyer_price` 
  ADD CONSTRAINT `fk_buyer_price_lifecycle` FOREIGN KEY (`lifecycle_id`) REFERENCES `t_lifecycle` (`id`);

ALTER TABLE `t_product_buyer` 
  ADD CONSTRAINT `fk_product_buyer_org` FOREIGN KEY (`org_id`) REFERENCES `t_org` (`id`);

ALTER TABLE `t_product_buyer` 
  ADD CONSTRAINT `fk_product_buyer_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`);
