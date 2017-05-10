var mysql = require("mysql");
var prompt = require('prompt');
var Table = require('easy-table');
var colors = require("colors/safe");

// To initialize the connection with the database
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'Bamazon'
});

// This is used for the prompt to buy something
var schema = {
    properties: {
        id_Number: {
            pattern: /^[0-9]+$/i,
            description: colors.green("Please enter the id Number"),
            required: true
        },
        units_to_Buy: {
            pattern: /^[0-9]+$/i,
            description: colors.green("How many do you wish to purchase?"),
            required: true
        }
    }
};

// This is used for the Yes or No prompt
var yesorno = {
    properties: {
        All: {
            pattern: /^[a-z]+$/i,
            description: colors.yellow("Buy all? (Y/y/N/n)"),
            required: true
        }
    }
};

var t = new Table;

// Starts the connection with the database
connection.connect();

// This runs the function that shows all avalable items for sale
showTable();

function showTable() {
    console.log(colors.bgWhite.magenta("\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n=-= BAMAZON, for when you want to be better than Amazon =-=\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n"));
    // This will show all items available for sale that have at least 1 in stock
    connection.query("SELECT * FROM products WHERE stock_quantity > 0", function(err, res) {
		if (err) throw err;

        var t = new Table
        
        // This displays the table of all the items for sale
        res.forEach(function(product) {
            t.cell('Product Id', product.id)
            t.cell('Product Name', product.product_name)
            t.cell('Department', product.department_name)
            t.cell('Price, USD', ("$" + (product.price).toFixed(2)))
            t.cell('Stock', product.stock_quantity)
            t.newRow()
        })
        console.log(t.toString())
        buySomething();
    });
}

// This runs after the table of items are shown, and asks the user to purchase something
function buySomething() {
    connection.query("SELECT * FROM products", function(err, res) {
    console.log(colors.blue("\nEnter 0 for either choice to buy nothing and exit.\n"));
    prompt.start();
        prompt.get(schema, function (err, result) {
            if (result.id_Number === "0" || result.units_to_Buy === "0") {
                console.log(colors.cyan("\nThank you for looking, please visit us again soon!"));
                endProgram();
                return null;
            // This checks to make sure the item they entered is a valid id number
            } else if (typeof res[(result.id_Number - 1)] === 'undefined' || res[(result.id_Number - 1)].stock_quantity === 0) {
                console.log(colors.cyan.underline("\nSorry we do not have that item, please choose again."));
                buySomething();
                return null;
            }
            var totalStock = res[result.id_Number - 1].stock_quantity;
            var itemtoBuy = res[result.id_Number - 1].product_name;
            var price = res[result.id_Number - 1].price;
            var previousSales = res[result.id_Number - 1].product_sales;

            // This runs if the user entered more than what is in stock
            if (result.units_to_Buy > totalStock) {
                lowStock();
                return null;
            } else {
                buyingStock = result.units_to_Buy;
                buyStock();
                return null;
            }
            // This is the function that runs if the user wants to buy more stock than what is in stock.
            // It gives them the option to buy all available stock
            function lowStock() {
                console.log(colors.bgYellow.red("\nSorry, we do not have enough stock of that item, would you like to buy all " + totalStock + "\nType Y/y for YES, or N/n for NO\n"));
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
            // This runs when the user has made a purchase.  It will give a review of their purchase and tally up a total.
            function buyStock() {
                var stockRemaining = totalStock - buyingStock;
                var totalCost = buyingStock * price;
                var updatedSales = previousSales + totalCost;
                // This writes to the database and changes the stock according to how many the user bought
                connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: stockRemaining, product_sales: updatedSales}, {id: result.id_Number}], function (err, res) {
                    if (err) throw err;
                    console.log(colors.yellow("\nCongrats! You just bought " + buyingStock + " " + itemtoBuy));
                    console.log("Total amount due is $" + totalCost.toFixed(2));
                    endProgram();
                    return null;
                    });   
            }
            endProgram();
            return null;
        });
    });
}

// This ends the program
function endProgram() {
    console.log(colors.cyan("\nThank you for chosing Bamazon! Come back soon. Have a great day!\n"));
    connection.end();
}