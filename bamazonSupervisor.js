var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require('easy-table');
var prompt = require('prompt');
var colors = require("colors/safe");

To initialize the connection with the database
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'Bamazon'
});

// This is used to add a new department into the departments table in the database
var addNew = {
    properties: {
        department_name: {
            description: colors.green('Please enter the DEPARTMENT NAME. Enter q/Q to quit.'),
            required: true
        },
        overHeadCost: {
            pattern: /^[0-9]+$/i,
            description: colors.green('Please enter the value for OVERHEAD COSTS'),
            required: true
        }
    }
};

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

// This will display the table of all info
function viewProductSales() {
    var total_profit = 0;
    var t = new Table;
    
    console.log(colors.bgWhite.magenta("\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-="));
    console.log(colors.bgWhite.magenta("------------------------ PRODUCT SALES BY DEPARTMENT ----------------------"));
    console.log(colors.bgWhite.magenta("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n"));

    // This gets info from the departments table in the database
    connection.query("SELECT * FROM departments", function(err, res) {
        if (err) throw err;
        
        // This calculates the difference of the Overhead Costs - Product Sales, 
        // and adds this attribute to the res object so it will display in the table
        for (var i = 0; i < res.length; i++) {
            total_profit = res[i].product_sales - res[i].over_head_costs;
            res[i].total_profit = total_profit;
        }

        res.forEach(function(departments) {
            t.cell('Department Id', departments.department_id)
            t.cell('Department Name', departments.department_name)
            t.cell('Overhead Costs', ("$" + (departments.over_head_costs.toFixed(2))))
            t.cell('Product Sales', ("$" + (departments.product_sales.toFixed(2))))
            t.cell('Total Profit', ("$" + (departments.total_profit.toFixed(2))))
            t.newRow()
        })
        console.log(t.toString())
        startingMenu();
    return null;
    });
}

// This function will create a new department and add it to the departments table in the database
function createNewDepartment() {
    var deptArray = [];
    // This gets info from the departments table in the database
    connection.query("SELECT * FROM departments", function(err, res) {
        if (err) throw err;
        
        // This creates an array of department names and will be used to make sure the department name doesn't already exist
        // This is checked a few lines down
        for (var i = 0; i < res.length; i++) {
            deptArray.push(res[i].department_name.toLowerCase());
        }
    });

    prompt.start();
    prompt.get(addNew, function (err, result) {
        
        // This will return to the main menu
        if (result.department_name.toLowerCase() === "q") {
            startingMenu();
            return null;
        // This checks to make sure the dept name isn't in use already
        } else if (deptArray.indexOf(result.department_name.toLowerCase()) != -1) {
            console.log(colors.bgYellow.red("This department already exists.  Please try again."));
            createNewDepartment();
            return null;
        } else if (result.overHeadCost <= 0) {
            console.log(colors.bgYellow.red("Please enter a value for the Overhead cost. Costs cannot be 0"));
            createNewDepartment();
            return null;
        }
        // This writes the new department name and overhead costs to the departments table in the database.
        // The product cost is 0, b/c nothing has been purchased yet.
        connection.query("INSERT INTO departments SET ?", [{department_name: result.department_name, over_head_costs: result.overHeadCost, product_sales: 0}], function (err, res) {
            if (err) throw err;
        });
        console.log(colors.yellow("******************************"));
        console.log(result.department_name + " was just added.\nOverhead Cost is $" + result.overHeadCost);
        console.log(colors.yellow("******************************\n"));
        startingMenu();
        return null;
    });
}  