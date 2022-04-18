/**
  Seeds the user data for the app.

  Note, you should modify this script with manually-hashed passwords (or manually update the user passwords after running it);

  Authors: Andres Orjuela, Derek Gau
*/
insert into t_org (id, name) values 
(1, 'Medten');

insert into t_user (id, username, password, email, first_name, last_name, status) values
(1, 'andres',   'update me', 'andres@medten.com', 'Andres', 'Orjuela', 'active'),
(2, 'mike',     'update me', 'mike@apigrate.com', 'Mike', 'Shao',  'active'),
(3, 'datamike', 'update me', 'mike+data@medten.com', 'Mike', 'Shao (Data)','active'),
(4, 'derek',    'update me', 'derek@apigrate.com', 'Derek', 'Gau','active');

insert into t_user_role (user_id, role) values
(1, 'admin'),
(2, 'admin'),
(3, 'data entry'),
(4, 'admin');

insert into t_user_org (user_id, org_id, is_default) values
(1, 1, 1),
(2, 1, 1), 
(3, 1, 1), 
(4, 1, 1);
