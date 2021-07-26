/* 
  Drop old user tables and recreate new ones for auth architecture.

  Created: 7/26/2021 by Derek Gau
  Deployed: 
*/
drop table if exists t_api_key;
drop table if exists t_user_role;
drop table if exists t_user; 
drop table if exists t_account;
-- org, user, and related authorization tables.
--
drop table if exists t_user_org;
drop table if exists t_user_role;
drop table if exists t_user;
drop table if exists t_org;

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
