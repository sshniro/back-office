/* Drop Tables */
DROP TABLE IF EXISTS notified_drivers, customer_feedbacks, orders, customers, vehicles, drivers, users, statuses, payment_methods, vehicle_types CASCADE;

/* Create Tables */
CREATE TABLE vehicle_types(
    vehicle_type_id serial NOT NULL PRIMARY KEY,
    vehicle_type VARCHAR(50) NOT NULL);

CREATE TABLE payment_methods(
    payment_method_id serial NOT NULL PRIMARY KEY,
    payment_method VARCHAR(50) NOT NULL);

CREATE TABLE statuses(
    status_id serial NOT NULL PRIMARY KEY,
    status VARCHAR(50) NOT NULL);

CREATE TABLE users(
    user_id serial NOT NULL PRIMARY KEY,
    username VARCHAR(30) UNIQUE,
    password VARCHAR(256) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    nic VARCHAR(20) NOT NULL,
    mobile_number VARCHAR(12) NOT NULL,
    is_active BOOLEAN NOT NULL,
    role VARCHAR(100) NOT NULL);

CREATE TABLE drivers(
    driver_id INT NOT NULL PRIMARY KEY REFERENCES users(user_id),
    license_number VARCHAR(100) NOT NULL,
    total_rating real NOT NULL,
    total_raters real NOT NULL,
    current_vehicle INT UNIQUE);

CREATE TABLE vehicles(
    vehicle_id serial NOT NULL PRIMARY KEY,
    driver_id INT NOT NULL REFERENCES drivers(driver_id),
    vehicle_type INT NOT NULL REFERENCES vehicle_types(vehicle_type_id),
    vehicle_model VARCHAR(50) NOT NULL,
    ownership_status VARCHAR(100),
    insurance VARCHAR(40) NOT NULL,
    current_location_latitude DOUBLE PRECISION,
    current_location_longitude DOUBLE PRECISION,
    availability INT REFERENCES statuses(status_id));

ALTER TABLE drivers
   ADD CONSTRAINT fk_current_vehicle
   FOREIGN KEY (current_vehicle)
   REFERENCES vehicles(vehicle_id);

CREATE TABLE customers(
    customer_id INT NOT NULL PRIMARY KEY REFERENCES users(user_id),
    card_info VARCHAR(256));

CREATE TABLE orders(
    order_id serial NOT NULL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(customer_id),
    origin_latitude_longitude VARCHAR(256) NOT NULL,
    destination_latitude_longitude VARCHAR(256) NOT NULL,
    origin_address VARCHAR(255) NOT NULL,
    destination_address VARCHAR(255) NOT NULL,
    distance INT NOT NULL,
    duration INT NOT NULL,
    order_status INT NOT NULL REFERENCES statuses(status_id),
    timestamp BIGINT NOT NULL,
    payment_method INT NOT NULL REFERENCES payment_methods(payment_method_id),
    order_acceptor_vehicle_id INT REFERENCES vehicles(vehicle_id));

CREATE TABLE customer_feedbacks(
    order_id INT NOT NULL PRIMARY KEY REFERENCES orders(order_id),
    customer_feedback VARCHAR(255) NOT NULL,
    driver_rating real);

CREATE TABLE notified_drivers(
    order_id INT NOT NULL REFERENCES orders(order_id),
    driver_id INT NOT NULL REFERENCES drivers(driver_id),
    created_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY(order_id, driver_id));

/* Insert into Tables */
INSERT INTO vehicle_types(vehicle_type) VALUES ('Bike'), ('Bicycle'), ('Three Wheeler');

INSERT INTO payment_methods(payment_method) VALUES ('Cash'), ('Credit Card'), ('Debit Card');

INSERT INTO statuses(status) VALUES ('PENDING'), ('ACCEPTED'), ('SUCCESSFUL'), ('AVAILABLE'), ('ONRIDE'), ('OFFLINE');

INSERT INTO users(username, password, first_name, last_name, address, nic, mobile_number, is_active, role) VALUES ('admin', '$2a$10$fc9f1/78KeFbWcKGMEKmcuvAGLdYGS8zmu1Rq94HJ7Yis.sK97waS', 'admin', 'admin', '', '', '', true, 'Admin');



/* Batch Data Insert */
INSERT INTO users (username,password,first_name,last_name,address,nic,mobile_number,is_active,role) VALUES (
    'driver01-malwatta-rd','$2a$10$fc9f1/78KeFbWcKGMEKmcuvAGLdYGS8zmu1Rq94HJ7Yis.sK97waS','Mccray','Barnes',
    'Ap #226-7706 Nullam St.','1634051175299V','+09807370971','true','Driver,Customer');

INSERT INTO users (username,password,first_name,last_name,address,nic,mobile_number,is_active,role) VALUES (
    'driver02-hill-street','$2a$10$fc9f1/78KeFbWcKGMEKmcuvAGLdYGS8zmu1Rq94HJ7Yis.sK97waS','Robbins','Conley',
    '7909 Nec Rd.','1644023081799V','+90312552571','true','Driver,Customer');

INSERT INTO users (username,password,first_name,last_name,address,nic,mobile_number,is_active,role) VALUES (
    'driver03-dehiwala-station','$2a$10$fc9f1/78KeFbWcKGMEKmcuvAGLdYGS8zmu1Rq94HJ7Yis.sK97waS','Morin','Fuller',
    '6351 Conubia St.','1677102478999V','+01169367959','true','Driver,Customer');

INSERT INTO users (username,password,first_name,last_name,address,nic,mobile_number,is_active,role) VALUES (
    'driver04-dharmarama-rd','$2a$10$fc9f1/78KeFbWcKGMEKmcuvAGLdYGS8zmu1Rq94HJ7Yis.sK97waS','Blevins','Cruz',
    'P.O. Box 361, 956 Senectus Rd.','1610120814999V','+10372095577','true','Driver,Customer');

INSERT INTO users (username,password,first_name,last_name,address,nic,mobile_number,is_active,role) VALUES (
    'driver05-galvahara-rd','$2a$10$fc9f1/78KeFbWcKGMEKmcuvAGLdYGS8zmu1Rq94HJ7Yis.sK97waS','Burke','Davenport',
    '570-9558 In Ave','1641011631999V','+75437834269','true','Driver,Customer');

INSERT INTO users (username,password,first_name,last_name,address,nic,mobile_number,is_active,role) VALUES (
    'driver06-b11-rd','$2a$10$fc9f1/78KeFbWcKGMEKmcuvAGLdYGS8zmu1Rq94HJ7Yis.sK97waS','Guzman','Ballard',
    'P.O. Box 832, 2756 Semper Rd.','1689010861599V','+53219587587','true','Driver,Customer');

INSERT INTO users (username,password,first_name,last_name,address,nic,mobile_number,is_active,role) VALUES (
    'driver07-hena-rd','$2a$10$fc9f1/78KeFbWcKGMEKmcuvAGLdYGS8zmu1Rq94HJ7Yis.sK97waS','Chandler','Mcfadden',
    '450-5975 A, Rd.','1634093073299V','+76208246582','true','Driver,Customer');

INSERT INTO users (username,password,first_name,last_name,address,nic,mobile_number,is_active,role) VALUES (
    'driver08-fifth-lane','$2a$10$fc9f1/78KeFbWcKGMEKmcuvAGLdYGS8zmu1Rq94HJ7Yis.sK97waS','John','Smith',
    '457-3435 A, Rd.','1634093073299V','+76208246582','true','Driver,Customer');

INSERT INTO users (username,password,first_name,last_name,address,nic,mobile_number,is_active,role) VALUES (
    'driver09-bekariya-junction','$2a$10$fc9f1/78KeFbWcKGMEKmcuvAGLdYGS8zmu1Rq94HJ7Yis.sK97waS','Rosario','Savage',
    '9097 Velit St.','1613021834499V','+92955314888','true','Driver,Customer');

INSERT INTO users (username,password,first_name,last_name,address,nic,mobile_number,is_active,role) VALUES (
    'driver10-kadawatha-rd','$2a$10$fc9f1/78KeFbWcKGMEKmcuvAGLdYGS8zmu1Rq94HJ7Yis.sK97waS','Bernard','Shepherd',
    '742-2273 Facilisi. Rd.','1634032115399V','+31324331034','true','Driver,Customer');

INSERT INTO users (username,password,first_name,last_name,address,nic,mobile_number,is_active,role) VALUES (
    'driver11-lawrence-rd','$2a$10$fc9f1/78KeFbWcKGMEKmcuvAGLdYGS8zmu1Rq94HJ7Yis.sK97waS','Fernandez','Miranda',
    'P.O. Box 255, 6791 Sit Avenue','1614030520199V','+01041681487','true','Driver,Customer');

INSERT INTO users (username,password,first_name,last_name,address,nic,mobile_number,is_active,role) VALUES (
    'driver12-jayasinghe-mawatha','$2a$10$fc9f1/78KeFbWcKGMEKmcuvAGLdYGS8zmu1Rq94HJ7Yis.sK97waS','Hancock','Harrington',
    '390-4102 Sapien. St.','1696060215099V','+55459879663','true','Driver,Customer');

INSERT INTO users (username,password,first_name,last_name,address,nic,mobile_number,is_active,role) VALUES (
    'driver13-colombo-seven','$2a$10$fc9f1/78KeFbWcKGMEKmcuvAGLdYGS8zmu1Rq94HJ7Yis.sK97waS','Cardenas','Luna',
    'P.O. Box 251, 6412 Volutpat. Street','1665072513799','+15833291716','true','Driver,Customer');

INSERT INTO users (username,password,first_name,last_name,address,nic,mobile_number,is_active,role) VALUES (
    'driver14-reid-ave','$2a$10$fc9f1/78KeFbWcKGMEKmcuvAGLdYGS8zmu1Rq94HJ7Yis.sK97waS','Rollins','Shannon',
    '849-9985 Pharetra St.','1612071155899','+01356354739','true','Driver,Customer');

INSERT INTO users (username,password,first_name,last_name,address,nic,mobile_number,is_active,role) VALUES (
    'customer01','$2a$10$fc9f1/78KeFbWcKGMEKmcuvAGLdYGS8zmu1Rq94HJ7Yis.sK97waS','Luffy','Monkey D',
    'One Piece','1612071155899','+01356354739','true','Customer');


INSERT INTO drivers (driver_id,license_number,total_rating,total_raters) VALUES (2,'1CFB1A38-898D-4B74-9E52-87917FB47082',0,0);
INSERT INTO drivers (driver_id,license_number,total_rating,total_raters) VALUES (3,'471548CD-64E9-BC12-3286-05EFCB868684',0,0);
INSERT INTO drivers (driver_id,license_number,total_rating,total_raters) VALUES (4,'F5BD545C-66E2-0B2B-B0D2-FE28F59AEC05',0,0);
INSERT INTO drivers (driver_id,license_number,total_rating,total_raters) VALUES (5,'08060AD5-8340-60A0-37C2-354C5EAF4BD1',0,0);
INSERT INTO drivers (driver_id,license_number,total_rating,total_raters) VALUES (6,'60743C5C-9401-1954-56FF-742AAC02EA34',0,0);
INSERT INTO drivers (driver_id,license_number,total_rating,total_raters) VALUES (7,'9DA87AAB-122E-EC37-F707-3879D56D2557',0,0);
INSERT INTO drivers (driver_id,license_number,total_rating,total_raters) VALUES (8,'29B91388-CAAE-D3C4-28B3-B4278801067B',0,0);
INSERT INTO drivers (driver_id,license_number,total_rating,total_raters) VALUES (9,'08E22AF4-E5E3-F356-C6D7-85765FEA0E8D',0,0);
INSERT INTO drivers (driver_id,license_number,total_rating,total_raters) VALUES (10,'9EDD7D42-DD41-21B0-652C-FD18F60CF3CA',0,0);
INSERT INTO drivers (driver_id,license_number,total_rating,total_raters) VALUES (11,'42D351FC-E313-2967-5E69-A9D33180E777',0,0);
INSERT INTO drivers (driver_id,license_number,total_rating,total_raters) VALUES (12,'F3FE2BE0-2EF2-C9DD-AA1D-729E9B09490A',0,0);
INSERT INTO drivers (driver_id,license_number,total_rating,total_raters) VALUES (13,'175E7EDD-14B1-206F-EE1E-A401FD753FB0',0,0);
INSERT INTO drivers (driver_id,license_number,total_rating,total_raters) VALUES (14,'9DA8A215-5CEF-5782-68F7-1BCFBFBF69E8',0,0);
INSERT INTO drivers (driver_id,license_number,total_rating,total_raters) VALUES (15,'58FC210E-8058-06C4-3143-4741AFFEC024',0,0);


INSERT INTO vehicles (driver_id,vehicle_type,vehicle_model,ownership_status,insurance,current_location_latitude,current_location_longitude,availability)
    VALUES (2,'1','Mercedes-Benz','Leased','44341D0A-0ECD-C33B-ECF2-32C7300C4D76','6.853915','79.868029',4);

INSERT INTO vehicles (driver_id,vehicle_type,vehicle_model,ownership_status,insurance,current_location_latitude,current_location_longitude,availability)
    VALUES (3,'1','Porsche','Owned','1033B283-7105-9DC9-33E4-4B2CE34F3F60','6.850999','79.867979',4);

INSERT INTO vehicles (driver_id,vehicle_type,vehicle_model,ownership_status,insurance,current_location_latitude,current_location_longitude,availability)
    VALUES (4,'2','Daihatsu','Owned','A3FC6C42-74CD-6849-4651-C792D09BEA77','6.850740','79.862529',4);

INSERT INTO vehicles (driver_id,vehicle_type,vehicle_model,ownership_status,insurance,current_location_latitude,current_location_longitude,availability)
    VALUES (5,'2','Acura','Owned','23019380-C9B2-5B52-708F-85D1E7A9CCB8','6.849377','79.873545',4);

INSERT INTO vehicles (driver_id,vehicle_type,vehicle_model,ownership_status,insurance,current_location_latitude,current_location_longitude,availability)
    VALUES (6,'2','Ford','Leased','BC8926D3-DDF9-6541-CAAF-68E7A21EB39C','6.850304','79.875723',4);

INSERT INTO vehicles (driver_id,vehicle_type,vehicle_model,ownership_status,insurance,current_location_latitude,current_location_longitude,availability)
    VALUES (7,'3','Peugeot','Leased','7279EF1D-8E74-3176-57E6-C696EA1CAE6E','6.851155','79.872016',4);

INSERT INTO vehicles (driver_id,vehicle_type,vehicle_model,ownership_status,insurance,current_location_latitude,current_location_longitude,availability)
    VALUES (8,'3','Vauxhall','Leased','38A79502-B1DE-DF7F-A46A-92B1DDE35EB6','6.827976','79.869536',4);

INSERT INTO vehicles (driver_id,vehicle_type,vehicle_model,ownership_status,insurance,current_location_latitude,current_location_longitude,availability)
    VALUES (9,'1','Nissan','Owned','0CAAE783-ADBF-2EEA-F6FD-B47EBB9CFD3A','6.816769','79.878820',4);

INSERT INTO vehicles (driver_id,vehicle_type,vehicle_model,ownership_status,insurance,current_location_latitude,current_location_longitude,availability)
    VALUES (10,'1','Smart','Leased','1D629A20-D05C-EC52-6ADE-20FEA81B91A0','6.826914','79.884904',4);

INSERT INTO vehicles (driver_id,vehicle_type,vehicle_model,ownership_status,insurance,current_location_latitude,current_location_longitude,availability)
    VALUES (11,'2','Nissan','Leased','208089E7-15E6-3B14-5FEA-3F2972F904BE','6.856924','79.878723',4);

INSERT INTO vehicles (driver_id,vehicle_type,vehicle_model,ownership_status,insurance,current_location_latitude,current_location_longitude,availability)
    VALUES (12,'3','Toyota','Owned','46A46227-13A5-CA99-06F0-ABEB4D07DC41','6.873073','79.864404',4);

INSERT INTO vehicles (driver_id,vehicle_type,vehicle_model,ownership_status,insurance,current_location_latitude,current_location_longitude,availability)
    VALUES (13,'1','JLR','Leased','4FBBAC70-6211-EDC4-7BF9-2DCB90A17339','6.866655','79.884382',4);

INSERT INTO vehicles (driver_id,vehicle_type,vehicle_model,ownership_status,insurance,current_location_latitude,current_location_longitude,availability)
    VALUES (14,'1','Daimler','Leased','D53392C7-566B-C37B-9585-F1E2EFAC5410','6.906790','79.869705',4);

INSERT INTO vehicles (driver_id,vehicle_type,vehicle_model,ownership_status,insurance,current_location_latitude,current_location_longitude,availability)
    VALUES (15,'3','Lincoln','Owned','A09B14F3-4F0F-AE83-57B0-A65FB6D19785','6.902645','79.862495',4);


UPDATE drivers SET current_vehicle = 1 WHERE driver_id = 2;
UPDATE drivers SET current_vehicle = 2 WHERE driver_id = 3;
UPDATE drivers SET current_vehicle = 3 WHERE driver_id = 4;
UPDATE drivers SET current_vehicle = 4 WHERE driver_id = 5;
UPDATE drivers SET current_vehicle = 5 WHERE driver_id = 6;
UPDATE drivers SET current_vehicle = 6 WHERE driver_id = 7;
UPDATE drivers SET current_vehicle = 7 WHERE driver_id = 8;
UPDATE drivers SET current_vehicle = 8 WHERE driver_id = 9;
UPDATE drivers SET current_vehicle = 9 WHERE driver_id = 10;
UPDATE drivers SET current_vehicle = 10 WHERE driver_id = 11;
UPDATE drivers SET current_vehicle = 11 WHERE driver_id = 12;
UPDATE drivers SET current_vehicle = 12 WHERE driver_id = 13;
UPDATE drivers SET current_vehicle = 13 WHERE driver_id = 14;
UPDATE drivers SET current_vehicle = 14 WHERE driver_id = 15;







INSERT INTO customers (customer_id,card_info) VALUES (2,'%B4508644117826150^YokoPhelps^83107965?4');
INSERT INTO customers (customer_id,card_info) VALUES (3,'%B5337945194784715^XerxesWilkinson^07026474348? ');
INSERT INTO customers (customer_id,card_info) VALUES (4,'%B4905488717421189^EvangelineLangley^80041678?9');
INSERT INTO customers (customer_id,card_info) VALUES (5,'%B5462278556220657^BriarCooper^04026473743?6');
INSERT INTO customers (customer_id,card_info) VALUES (6,'%B4556780826639^DorianGuzman^71069922454?8');
INSERT INTO customers (customer_id,card_info) VALUES (7,'%B30451683264609^PrestonBryan^8812915266?5');
INSERT INTO customers (customer_id,card_info) VALUES (8,'%B6522309851054784^DominicGallagher^80094938? ');
INSERT INTO customers (customer_id,card_info) VALUES (9,'%B377567003293373^CodyBruce^1110945657?1');
INSERT INTO customers (customer_id,card_info) VALUES (10,'%B4905988684941044^LoganCaldwell^0008169318?2');
INSERT INTO customers (customer_id,card_info) VALUES (11,'%B214900505972060^DanteRandall^70057153?4');
INSERT INTO customers (customer_id,card_info) VALUES (12,'%B565316651969^HirokoDyer^04056779? ');
INSERT INTO customers (customer_id,card_info) VALUES (13,'%B348488842901512^IrmaBartlett^26095988? ');
INSERT INTO customers (customer_id,card_info) VALUES (14,'%B180071703872195^PandoraPowell^82127399220?4');
INSERT INTO customers (customer_id,card_info) VALUES (15,'%B4911939148892762^HayleyWeber^12049432273?2');
INSERT INTO customers (customer_id,card_info) VALUES (16,'%B4911939148892762^HayleyWeber^12049432273?2');