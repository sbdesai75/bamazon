DROP DATABASE IF EXISTS bamazonCustomer_DB;
CREATE DATABASE bamazonCustomer_DB;

USE bamazonCustomer_DB;

CREATE TABLE auctions(
  id INT NOT NULL AUTO_INCREMENT,
  item_id INT default 0,
  product_name VARCHAR(45) NOT NULL,
  department_name VARCHAR(40) NOT NULL,
  price INT default 0,
  stock_quality VARCHAR(40) NOT NULL,
  PRIMARY KEY (id)
);