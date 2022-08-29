
-- use crud; 
-- create table user(id int(11) primary key not null auto_increment,
-- email varchar(255),
-- passwrd varchar(255),
-- is_verified int(11) default 0,
-- token varchar(255),
-- is_deleted boolean default 0,
-- created_by int(11) default 1,
-- updated_by int(11),
-- created_at datetime default current_timestamp,
-- updated_at datetime);
-- desc user;
select * from user;
-- delete from user where id= 3;
select email from user;
-- update user set token = null,is_verified = 1 where id = 50;
