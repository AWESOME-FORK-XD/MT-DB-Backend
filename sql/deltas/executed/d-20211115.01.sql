

/*

  "Used-With" enhancements to v2 database.

  Author: Derek Gau
	Updated: 11/15/2021

	Adds a new table (t_product_family) to represent the product relationships with families.
	The simple 1:1 relationship in the current DB structure not sufficient to represent all types of 
	data relationships between products and families.
	
	For example:
	- a product belongs to a family (classication relationship)
	- a product is compatible with (products in) a family (compatibility)
	
  Adds a new view v_product_specifications which concatenates product filter option readable values into a
  comma-separated (en) or space-separated (zh) list of specifications for each product in the database.
*/
CREATE TABLE `t_product_family` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned NOT NULL,
  `family_id` int(11) unsigned NOT NULL,
  `is_primary` bit NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `version` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `t_product_family` 
  ADD CONSTRAINT `fk_product_family_product` FOREIGN KEY (`product_id`) REFERENCES `t_product` (`id`);

ALTER TABLE `t_product_family` 
  ADD CONSTRAINT `fk_product_family_family` FOREIGN KEY (`family_id`) REFERENCES `t_family` (`id`);

INSERT INTO t_product_family (product_id, family_id, is_primary) 
SELECT p.id, p.family_id, 1 FROM t_product p WHERE p.family_id IS NOT NULL;

-- Eventually these drops should be made after the application has been updated:
-- ALTER TABLE `t_product` DROP CONSTRAINT `fk_product_family`;
-- ALTER TABLE `t_product` DROP COLUMN `family_id`; 

-- product specifications view (concatenates product filter option_en, option_zh)
create view v_product_specifications as
select p.id, p.sku, p.name_en, p.name_zh, 
GROUP_CONCAT(pfo.option_en ORDER BY pfo.option_en ASC SEPARATOR ', ') as specifications_en,
GROUP_CONCAT(pfo.option_zh ORDER BY pfo.option_zh ASC SEPARATOR ' ') as specifications_zh 
from v_product_filter_option pfo
join v_product p on pfo.product_id = p.id  
GROUP BY p.id, p.sku, p.name_en, p.name_zh;
