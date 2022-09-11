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
select * from user where id = 90;
select unix_timestamp(now()) as time;

-- delete from user where id= 3;
-- select email from user;
-- update user set token = null,is_verified = 1 where id = 50;
-- ALTER TABLE user
-- ADD token_forPass varchar(255);
-- ALTER TABLE user
-- ADD used int(11);

-- ALTER TABLE user
-- ALTER used SET DEFAULT 0;

-- ALTER TABLE user
-- ADD loginCount int(11);

-- ALTER TABLE user
-- ALTER loginCount SET DEFAULT 0;

-- ALTER TABLE user
-- ADD isBlocked int(11) default 0;

-- ALTER TABLE user
-- ADD blockTime timestamp;

-- select now() as time;
-- select unix_timestamp(now()) as time;
-- select unix_timestamp();

-- ALTER TABLE user
-- MODIFY COLUMN blockTime varchar(50);

-- update user set blockTime=unix_timestamp(now()), isBlocked=0 where id=50;
-- update user set loginCount = 3 where id = 94; 
