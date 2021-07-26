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

-- 
-- seed data authorization data
-- 
insert into t_org (id, name) values (1, 'Medten');

insert into t_user (id, username, password, email, first_name, last_name, status) values
(1, 'andres', '', 'andres@medten.com', 'Andres', 'Orjuela', 'active'),
(2, 'scott', '', 'scott@medten.com', 'Scott', 'Ly', 'active'),
(3, 'derek', '', 'derek@apigrate.com', 'Derek', 'Gau', 'active'),
(4, 'data', '', 'test+data@apigrate.com', 'Commander', 'Data', 'active');

insert into t_user_role (user_id, role) values
(1, 'admin'),
(2, 'admin'),
(3, 'admin'),
(4, 'data entry');

insert into t_user_org (user_id, org_id) values 
(1, 1),
(2, 1),
(3, 1),
(4, 1);