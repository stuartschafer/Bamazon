var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require('easy-table');
// var prompt = require('prompt');
var colors = require("colors/safe");
var sales = 0;
var departmentArray = [];
var salesArray = [];

// To initialize the connection with the database
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'Bamazon'
});

var t = new Table;

// Starts the connection with the database
connection.connect();

// This runs the function that gives the manager options on what to do
startingMenu();

function startingMenu() {
    inquirer.prompt([
        {
            type: "list",
            message: colors.bgWhite.magenta("Welcome Mr. Supervisor.  What would you like to do?"),
            choices: ["QUIT", "View Product Sales by Department", "Create New Department"],
            name: "choices"
        }
    ]).then(function(answers) {
        // This runs the function depending on what the user selects
        switch(answers.choices) {
            case "QUIT":
                console.log(colors.cyan("\nWe here at Bamazon appreciate all your hard work! Have a great day!\n"));
                connection.end();
                return null;
            case "View Product Sales by Department":
                viewProductSales();
                break;
            case "Create New Department":
                createNewDepartment();
                break;
        }
    });
}

function viewProductSales() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {
            if (departmentArray.indexOf(res[i].department_name) === -1) {
                departmentArray.push(res[i].department_name);
            }
        }
        for (var j = 0; j < departmentArray.length; j++) {
            connection.query("SELECT * FROM products WHERE ?", {department_name: departmentArray[j]}, function(err, response) {
                for (var k = 0; k < response.length; k++) {
                    sales = sales + response[k].product_sales;  
                }
                console.log(sales);
                salesArray.push(sales);
                sales = 0;
                show();
            });
        }
        connection.end(); 
    }); 
}



function show() {
        for (var l = 0; l < departmentArray.length; l++) {
            console.log("Sales for " + departmentArray[l] + " are: $" + salesArray[l]);
        }
}




        // var t = new Table
        // res.forEach(function(product) {
            // t.cell('Product Id', departments.department_id)
            // t.cell('Department Name', product.product_name)
            // t.cell('Product Name', ("$" + (products.over_head_costs).toFixed(2)))
            // t.cell('Price, USD', product.product_sales)
            // t.cell('Price, USD', ("$" + (products.total_profit).toFixed(2)))
            // t.newRow()
        // })
        // console.log(t.toString())
        // startingMenu();