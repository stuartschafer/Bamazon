var mysql = require("mysql");
var prompt = require('prompt');
var Table = require('easy-table');
var BamazonItem = require("./bamazon_contructor.js");

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'Bamazon'
});

var schema = {
    properties: {
        id_Number: {
            pattern: /^[0-9]+$/i,
            message: 'Please enter only numbers',
            required: true
        },
        units_to_Buy: {
            pattern: /^[0-9]+$/i,
            message: 'Please enter only numbers',
            required: true
        }
    }
};

var yesorno = {
    properties: {
        All: {
            pattern: /^[a-z]+$/i,
            message: 'Please enter Y or N',
            required: true
        }
    }
};

var t = new Table;

connection.connect();

showTable();

function showTable() {
    var data = [];
    console.log("\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\nBAMAZON, for when you want to be better than Amazon\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n");
    connection.query("SELECT * FROM products", function(err, res) {
        totalProducts = res.length;
		if (err) throw err;
            for (var i = 0; i < res.length; i++) { 
                var itemList = new BamazonItem (res[i].id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity);
                data.push(itemList);
            }

        var t = new Table
        
        data.forEach(function(product) {
            t.cell('Product Id', product.id)
            t.cell('Product Name', product.product_name)
            t.cell('Department', product.department_name)
            t.cell('Price, USD', product.price, Table.number(2))
            t.cell('Stock', product.stock_quantity)
            t.newRow()
        })
        console.log(t.toString())
        buySomething();
    });
}

function buySomething() {
    connection.query("SELECT * FROM products", function(err, res) {
    console.log("Please enter the id Number of the item you wish to purcahse and How many of those you wish to purchase");
    prompt.start();
        prompt.get(schema, function (err, result) {

            if (result.id_Number > res.length) {
                console.log("Sorry we do not have that item, please choose again.");
                console.log("====================================================");
                buySomething();
                return null;
            }
            var totalStock = res[result.id_Number - 1].stock_quantity;
            var itemtoBuy = res[result.id_Number - 1].product_name;
            var price = res[result.id_Number - 1].price;

            if (result.units_to_Buy > totalStock) {
            lowStock();
            return null;
            } else {
                buyingStock = result.units_to_Buy;
                buyStock();
                return null;
            }
        
            function lowStock() {
                console.log("Sorry, we do not have enough stock of that item, would you like to buy all " + totalStock);
                prompt.get(yesorno, function (err, result) {
                    if (result.All === "Y" || result.All === "y") {
                        buyingStock = totalStock;
                        buyStock();
                        return null;
                    } else if (result.All === "N" || result.All === "n") {
                        buySomething();
                        return null;
                    } else {
                        console.log("Please enter Y or N");
                        lowStock();
                        return null;
                    }
                });
            }

            function buyStock() {
                // console.log(buyingStock);
                var stockRemaining = totalStock - buyingStock;
                var totalCost = buyingStock * price;
                connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: stockRemaining}, {id: result.id_Number}], function (err, res) {
                    if (err) throw err;
                    console.log("Congrats! You just bought " + buyingStock + " " + itemtoBuy);
                    console.log("Total amount due is $" + totalCost);
                    endProgram();
                    return null;
                    });   
            }
            endProgram();
            return null;
        });
    });
}

function endProgram() {
    connection.end();
}