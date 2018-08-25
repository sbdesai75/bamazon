var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazonCustomer_DB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});

// function which prompts the user for what action they should take
function start() {
  
  var questions = {
    name: "product name",
    id: "item id",
    department: "department name",
    price: "product price",
    message: "Would you like to [POST] an auction or [BID] on an auction?",
    choices: ["POST", "BID", "EXIT"]
  };

  inquirer.prompt(questions).then(function(answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.postOrBid.toUpperCase() === "POST") {
        postAuction();
      }
      else if(answer.postOrBid.toUpperCase() === "BID") {
        bidAuction();
      } else {
        // Exit
        connection.end();
        return;
      }
    });
}

// function to handle posting new items up for auction
function postAuction() {
  
  // prompt for info about the item being put up for auction
  var questions = [
    {
      name: "item",
      id: "serial number",
      department: "section",
      price: "amount",
      type: "input",
      message: "What is the item you would like to submit?"
    },
    {
      name: "category",
      type: "input",
      message: "What category would you like to place your auction in?"
    },
    {
      name: "startingBid",
      type: "input",
      message: "What would you like your starting bid to be?",
      validate: function(value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
      }
    }
  ];

  inquirer.prompt(questions).then(function(answer) {
      // when finished prompting, insert a new item into the db with that info
      
      var sqlString = "INSERT INTO auctions SET ?";
      var replacements = {
        item_name: answer.item,
        category: answer.category,
        starting_bid: answer.startingBid,
        highest_bid: answer.startingBid
      };
      connection.query(sqlString, replacements, function(err) {
          if (err) throw err;
          console.log("Your auction was created successfully!");
          // re-prompt the user for if they want to bid or post
          start();
        }
      );
    });
}

function bidAuction() {
  // query the database for all items being auctioned
  connection.query("SELECT * FROM auctions", function(err, results) {
    if (err) throw err;

    // setup an array of "choices" from the db results
    var choiceArray = [];
    for (var i = 0; i < results.length; i++) {
      // push into the array a string like this: "2: Car"
      choiceArray.push(results[i].id + ": " + results[i].item_name);
    }

    // once you have the items, prompt the user for which they'd like to bid on
    inquirer.prompt([
        {
          name: "choice",
          type: "list",
          choices: choiceArray,
          message: "What is the ID of the product you would like?"
        },
        {
          name: "bid",
          type: "input",
          message: "How many units would you like?"
        }
      ])
      .then(function(answer) {

        var chosenItem;
        
        // destruct the anser.choice from string ("2: Car") into id and item_name
        var components = answer.choice.trim().split(':');
        for (var i = 0; i < results.length; i++) {
          // test if results id = the first element of the components array (ie: the id)
          if (results[i].id === parseInt(components[0])) {
            chosenItem = results[i];
          }
        }

        // determine if bid was high enough
        if (chosenItem.highest_bid < parseInt(answer.bid)) {
          // bid was high enough, so update db, let the user know, and start over
          connection.query(
            "UPDATE auctions SET ? WHERE ?",
            [
              {
                highest_bid: answer.bid
              },
              {
                id: chosenItem.id
              }
            ],
            function(error) {
              if (error) throw err;
              console.log("Bid placed successfully!");
              start();
            }
          );
        }
        else {
          // bid wasn't high enough, so apologize and start over
          console.log("Insufficent quantity!");
          start();
        }
      });
  });
}