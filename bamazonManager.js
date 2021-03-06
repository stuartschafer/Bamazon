var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require('easy-table');
var prompt = require('prompt');
var colors = require("colors/safe");
var showInv = "";

// To initialize the connection with the database
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'Bamazon'
});

// This is used for the prompt to add inventory
var schema = {
    properties: {
        id_Number: {
            pattern: /^[0-9]+$/i,
            message: 'Please enter only numbers',
            required: true
        },
        qtytoadd: {
            pattern: /^[0-9]+$/i,
            message: 'Please enter only numbers',
            required: true
        }
    }
};

// This is used for the prompt to add a new item
var addNew = {
    properties: {
        product_name: {
            description: colors.green('Please enter the PRODUCT NAME'),
            required: true
        },
        price: {
            pattern: /^[0-9]+(\.\d{1,2})+$/i,
            description: colors.green('Please enter the PRICE (format must be _.__)'),
            required: true
        },
        stock: {
            pattern: /^[0-9]+$/i,
            description: colors.green('Please enter the how much STOCK we have'),
            required: true
        }
    }
};

// This is used to change a product name, department name, price, or stock
var change = {
    properties: {
        id_number: {
            attern: /^[0-9]+$/i,
            description: colors.green("Please enter the id Number (enter 0 to go back to the previous menu)"),
            required: true
        },
        new_property: {
            description: colors.green("Please enter the new Name/Value"),
            required: true
        }
    }
};

var t = new Table;

// Starts the connection with the database
connection.connect();

// This runs the function that gives the manager options on what to do
startingMenu();

function startingMenu() {
    inquirer.prompt([
        {
            type: "list",
            message: colors.bgWhite.magenta("Welcome Mr. Manager.  What would you like to do?"),
            choices: ["QUIT", "View All Products", "View Low Inventory", "Change name, department, price, or stock of existing item", "ADD New Product"],
            name: "choices"
        }
    ]).then(function(answers) {
        // This runs the function depending on what the user selects
        switch(answers.choices) {
            case "QUIT":
                console.log(colors.cyan("\nWe here at Bamazon appreciate all your hard work! Have a great day!\n"));
                connection.end();
                return null;
            case "View All Products":
                showInv = "all";
                viewInventory();
                break;
            case "View Low Inventory":
                showInv = "low";
                viewInventory();
                break;
            case "Change name, department, price, or stock of existing item":
                changeSomething();
                break;
            case "ADD New Product":
                addNewProduct();
                break;
        }
    });
}

// This will show every item or low inventory depending on what the manager selects
function viewInventory() {
    var query = "SELECT * FROM products";
    
    var t = new Table;
    
    // This selects items in the database that have 5 or less in stock
    if (showInv === "low") {
        query += " WHERE stock_quantity <= 5";
        console.log(colors.bgRed.white("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"));
        console.log(colors.bgRed.white("LOW INVENTORY (Stock that is 5 or less) Need to order more. "));
        console.log(colors.bgRed.white("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n"));
    } else {
        console.log(colors.bgWhite.magenta("\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"));
        console.log(colors.bgWhite.magenta("--------------- EVEY ITEM LISTED ON BAMAZON ----------------"));
        console.log(colors.bgWhite.magenta("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n"));
    }
        // This reads data from the products table in the database and will show stock depending on what the manager chooses
        connection.query(query, function(err, res) {
        if (err) throw err;

        res.forEach(function(product) {
            t.cell('Product Id', product.id)
            t.cell('Product Name', product.product_name)
            t.cell('Department Name', product.department_name)
            t.cell('Price, USD', ("$" + (product.price).toFixed(2)))
            t.cell('Stock', product.stock_quantity)
            t.newRow()
        })
        console.log(t.toString())
        startingMenu();
        return null;
    });
}

function changeSomething() {
    console.log();
    var whatToChange = "";
    // This selects info from the products table in the database so the manager can change something
    connection.query("SELECT * FROM products", function(err, res) {
         inquirer.prompt([
        {
            type: "list",
            message: "Please select an option.",
            choices: ["Return to Main Menu", "Change the Product Name", "Change the Department Name", "Add / Remove Inventory", "Change Price on a product"],
            name: "choices"
        }
    ]).then(function(answers) {
        switch(answers.choices) {
            case "Return to Main Menu":
                startingMenu();
                return null;
            case "Change the Product Name":
                whatToChange = "product_name";
                break;
            case "Change the Department Name":
                whatToChange = "department_name";
                changeDeptname();
                return null;
            case "Add / Remove Inventory":
                whatToChange = "stock_quantity";
                console.log(colors.yellow("***** To INCREASE stock enter a number, to DECREASE stock enter a negative number *****"));
                break;
            case "Change Price on a product":
                whatToChange = "price";
                break;
            }
        makeaChange();   
    });

        function makeaChange() {
            prompt.start();
            prompt.get(change, function (err, result) {
                // This is here so the manager can type 0 to go back a menu
                if (result.id_number === "0") {
                    changeSomething();
                    return null;
                // This checks to make sure a valid number is entered for the id
                } else if (result.id_number > res.id_number || result.id_number < 1 || isNaN(result.id_number) === true || typeof res[(result.id_number - 1)] === 'undefined') {
                    console.log(colors.bgWhite.red("That item does not exist.\n"));
                    makeaChange();
                    return null;
                }
                if (whatToChange === "product_name") {
                    // This updates the products table in the database with the new product name
                    connection.query("UPDATE products SET ? WHERE ?", [{product_name: result.new_property}, {id: result.id_number}], function (err, res) {
                        if (err) throw err;
                        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                        console.log("New Product Name is " + result.new_property);
                        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
                        startingMenu();
                        return null;
                    });
                } else if (whatToChange === "stock_quantity") {
                    // This makes sure the manager entered a valid number for the stock
                    if (isNaN(result.new_property) === true) {
                        console.log(colors.bgWhite.red("That isn't a valid number, please try again.\n"));
                        makeaChange();
                        return null;
                    // This checks to see if there is a price > 0 for this item.  If the price is 0, the manager cannpt add stock
                    // If they could, then the user would be able to purchase free items, causing the manager to get fired.
                    } else if (parseFloat(res[(result.id_number - 1)].price) <= 0) {
                        console.log(colors.bgWhite.red("Sorry, you cannot add stock to an item that has a 0 cost.  Please change the price first, then you can add stock for this."));
                        makeaChange();
                        return null;
                    // This makes sure the manager doesn't take out more than what there is in stock.  You can have 0, but not negative.
                    } else if (parseInt(result.new_property) + res[(result.id_number - 1)].stock_quantity < 0) {
                        console.log(colors.bgWhite.red("Sorry, that would make this negative stock. There are only " + res[(result.id_number - 1)].stock_quantity + " in stock."));
                        makeaChange();
                        return null;
                    }

                    result.new_property = parseInt(result.new_property) + res[(result.id_number - 1)].stock_quantity;

                    // This updates the products table in the database with the new stock quantity
                    connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: result.new_property}, {id: result.id_number}], function (err, res) {
                        if (err) throw err;
                        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                        console.log("New stock is " + result.new_property);
                        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
                        startingMenu();
                        return null;
                    });
                } else if (whatToChange === "price") {
                    // This checks to make sure the new price is greater than 0 and that the price entered is a valid number
                    if (result.new_property <= 0 || isNaN(result.new_property) === true) {
                        console.log(colors.bgWhite.red("That isn't a valid number, please try again. It must be greater than 0."));
                        makeaChange();
                        return null;
                    }
                    // This updates the products table in the database with the new price
                    connection.query("UPDATE products SET ? WHERE ?", [{price: result.new_property}, {id: result.id_number}], function (err, res) {
                        if (err) throw err;
                        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                        console.log("New Price is $" + parseFloat((result.new_property)).toFixed(2));
                        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
                        startingMenu();
                        return null;
                    });
                }
            });
        }
    });
}

function addNewProduct() {
    var inserted = "";
    var departmentArray = [];
    // This selects all items from the departments table in the database (so it can verify information when the manager enters info)
    connection.query("SELECT department_name FROM departments", function(err, departments) {
        // This creates an array of department names so the manager can choose 1 from it
        for (var i = 0; i < departments.length; i++) {
                departmentArray.push(departments[i].department_name);
            }
        inquirer.prompt([
            {
                type: "list",
                message: colors.bgWhite.black("Please select which DEPARTMENT this will go into. (If not listed here, please speak to your supervisor"),
                choices: departmentArray,
                name: "choices"
            }
        ]).then(function(answers) {
            deptName = answers.choices;
            addRestofInfo();
        });

        function addRestofInfo() {
            prompt.start();
            prompt.get(addNew, function (err, result) {
                // If the manager enters a quantity > 0 to put in stock, but @ 0 cost, it won't allow them to enter it.
                // They can enter 0 for price if there is 0 stock.  This would be if they are unsure what the cost is at the time.
                // If this check wasn't here, the manager could put items for sale at 0 cost that the customer would see. That would get them fired!
                if (parseFloat(result.price) <= 0 && parseInt(result.stock) > 0) {
                    console.log(colors.bgYellow.red("We're here to make money, not give it away.  The price has to be at least 0.01.\n"));
                    addNewProduct();
                    return null;
                } else {
                    // This writes a new line to the products table in the database with the info the manager ewntered
                    connection.query("INSERT INTO products SET ?", [{product_name: result.product_name, department_name: deptName, price: result.price, stock_quantity: result.stock}], function (err, res) {
                        if (err) throw err;
                    });
                }
                    console.log(colors.yellow("*************************"));
                    console.log("You just added:\nItem Name: " + result.product_name + "\nDepartment Name: " + deptName + "\nPrice: $" + result.price + "\nStock: " + result.stock);
                    console.log(colors.yellow("*************************\n"));
                    startingMenu();
                    return null;
            });
        }
    });     
}






function changeDeptname() {
    var departmentArray = [];

    // This prompts the manager for the id of the product he wishes to change
    prompt.get({ properties: { id_value: { pattern: /^[0-9]+$/i, message: 'Please enter only numbers', required: true }}} , function (err, result) {
        
        // This selects all items from the departments table in the database (so it can verify information when the manager enters info)
        connection.query("SELECT department_name FROM departments", function(err, departments) {
            // This creates an array of department names so the manager can choose 1 from it
            for (var i = 0; i < departments.length; i++) {
                departmentArray.push(departments[i].department_name);
            }
            inquirer.prompt([
                {   type: "list",
                    message: colors.bgWhite.black("Please select which DEPARTMENT this will go into. (If not listed here, please speak to your supervisor"),
                    choices: departmentArray,
                    name: "choices"
                }
            ]).then(function(answers) {

                // This updates the products table in the database with the new department name
                connection.query("UPDATE products SET department_name = ? WHERE id = ?", [answers.choices, result.id_value], function (err, res) {
                    if (err) throw err;
                    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                    console.log("New Department Name is " + answers.choices);
                    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
                    startingMenu();
                    return null;
                });
            });
        });
    });
}