function BamazonItem(id, product_name, department_name, price, stock_quantity) {
	this.id = id;
	this.product_name = product_name;
    this.department_name = department_name;
    this.price = price;
    this.stock_quantity = stock_quantity
}

module.exports = BamazonItem;