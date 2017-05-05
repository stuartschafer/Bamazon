var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'greatbay_db'
});



startingMenu();

function startingMenu() {
    inquirer.prompt([
		  	{
				type: "list",
		    	message: "Please select an option.",
		    	choices: ["QUIT", "View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
		    	name: "choices"
		  	}
		]).then(function(answers) {
		  	if (answers.choices === "View Products for Sale") {
		  		newAuction();
                return null;
		  	} else if (answers.choices === "QUIT") {
				  connection.end();
				  return null;
			}
              bid();
			  return null;	
		});
}
