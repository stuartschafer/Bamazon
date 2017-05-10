-- This seeds everything to start over so I won't have to re-write everything

CREATE DATABASE Bamazon;

USE Bamazon;

CREATE TABLE products (
	id INTEGER(11) AUTO_INCREMENT NOT NULL,
	product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2),
	stock_quantity INTEGER(10),
	product_sales DECIMAL(10, 2),
	PRIMARY KEY (id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Globber", "Gizmos", 9.50, 20);

INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Dragit", "Gizmos", 12.45, 10);

INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Plisam", "Gizmos", 19.99, 5);

INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Junicraws", "Gizmos", 74.70, 8);

INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Hilvone", "Dohickeys", 14.25, 38);

INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Wefflo", "Dohickeys", 4.99, 84);

INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Grabbler", "Dohickeys", 41.95, 4);

INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Trazlopemy", "Dohickeys", 61.05, 14);

INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Cranlock", "Thingamabobs", 25.00, 18);

INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Allinack", "Thingamabobs", 17.10, 29);

INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Eriland", "Thingamabobs", 101.65, 2);

INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Pruckle", "Thingamabobs", 82.15, 3);

SELECT * FROM products;


-- For Challenge 3
CREATE TABLE departments (
	department_id INTEGER(11) AUTO_INCREMENT NOT NULL,
	department_name VARCHAR(100) NOT NULL,
    over_head_costs VARCHAR(100) NOT NULL,
    total_sales DECIMAL(10, 2),
	PRIMARY KEY (department_id)
);

SELECT * FROM departments;