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
    nic VARCHAR(11) NOT NULL,
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
    insurance VARCHAR(30) NOT NULL,
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
    PRIMARY KEY(order_id, driver_id));

/* Insert into Tables */
INSERT INTO vehicle_types(vehicle_type) VALUES ('Bike'), ('Bicycle'), ('Three Wheeler');

INSERT INTO payment_methods(payment_method) VALUES ('Cash'), ('Credit Card'), ('Debit Card');

INSERT INTO statuses(status) VALUES ('PENDING'), ('ACCEPTED'), ('SUCCESSFUL'), ('AVAILABLE'), ('ONRIDE'), ('OFFLINE');

INSERT INTO users(username, password, first_name, last_name, address, nic, mobile_number, is_active, role) VALUES ('admin', '$2a$10$fc9f1/78KeFbWcKGMEKmcuvAGLdYGS8zmu1Rq94HJ7Yis.sK97waS', 'admin', 'admin', '', '', '', true, 'Admin');