const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const path = require('path')
const bcryptjs = require("bcryptjs")
const mysql = require("mysql2")
const session = require('express-session');
const dotenv = require('dotenv').config();
const { check, validationResult, Result } = require('express-validator');
const { createConnection } = require('net');
const { connect } = require("http2")
const { callbackify } = require("util")
const { ifError } = require("assert")

//inititalize app
const app = express();


//cofigure middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(session({
   secret: 'secret',
   resave: true,
   saveUninitialized: false
}));

//database connecting

const pool = mysql.createConnection({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_DATABASE,
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0
});


pool.connect((err) => {
   if (err) return console.log('error connecting to the database');
   console.log('successully connected');
});

pool.query(`CREATE DATABASE IF NOT EXISTS db_week_5`, (err, result) => {
   if (err) return err;
   console.log('database created successfull')
});

pool.query(`USE db_week_5`, (err, result) => {
   if (err) return (error);
   console.log('database initiated')
});

const UsersTablequery = `CREATE TABLE IF NOT EXISTS USERS(
                      USER_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
                      Email VARCHAR(50) NOT NULL,
                      Username VARCHAR(50) NOT NULL UNIQUE,
                      Password varchar(255) NOT NULL                       
                      )`

pool.query(UsersTablequery, (err, res) => {
   if (err) return console.log(`users table exists`);
   console.log('Users Table created');
});

const ExpensesTablequery = `CREATE TABLE IF NOT EXISTS Expense(
                            Expense_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
                            Category VARCHAR(50) NOT NULL UNIQUE,
                            Amount VARCHAR(50) NOT NULL UNIQUE,
                            USER_ID INT,
                            FOREIGN KEY (USER_ID) REFERENCES USERS(USER_ID),
                            Date Date NOT NULL
                            )`

pool.query(ExpensesTablequery, (err, res) => {
   if (err) return console.log(err);
   console.log('Expenses Table created');
});
//show user form
app.get('/register', (req, res) => {
   res.SendFile(path.join(__dirname, 'register.html'));
});

//login form
app.get('/login', (req, res) => {
   res.SendFile(path.join(__dirname, '/login.html'));
});

//Expense form
app.get('/Expense', (err, res) => {
   res.SendFile(path.join(__dirname, '/Expense.html'))
});

//user representation

const User = {
   tableName: 'USERS',
   createUSER: function (newUser, callback) {
      pool.query('INSERT INTO' + this.tableName + 'SET ?'[newUser], [callback]);
   },
   getuserbyEmail: function (Email, callback) {
      pool.query(`SELECT * FROM ` + this.tableName + ` WHERE Email=?`, [Email], [callback]);
   },
   getuserbyUsername: function (Username, callback) {
      pool.query(`SELECT * FROM ` + this.tableName + ` WHERE Username=?`, [Email], [callback]);
   },
}


//route for registration
app.post('/register', [
   check(`Email`).isEmail().withMessage(`Enter Valid Email Address`),
   check(`Username`).isAlphanumeric().withMessage(`please enter a valid username with alphanumeric characters`),
   check(`Password`).isLength({ min: 6 }).withMessage(`Password must be atleast six characters`),


   //check if Email exists
   check(`Email`).custom(async () => {
      const user = await user.getuserbyEmail(value);
      if (user) {
         throw new error(`User Email exists`);
      }
   }),
   //check if username exists
   check(`Username`).custom(async () => {
      const user = await user.getuserbyUsername(value);
      if (user) {
         throw new error(`Username exists`);
      }
   })
]


   , async (req, res) => {
      //check for validation errors
      const err = validationResult(req);
      if (!err.isEmpty) {
         return res.status(400).json({ errors: err.array() });//iferrors are found
      }
      //hash Pasword

      console.log(req.body.Password)
      const saltRounds = 10;
      const hashedpass = await bcryptjs.hash(req.body.Password, saltRounds);

      //new user object
      const newUser = {
         Email: req.body,
         Username: req.body,
         password: hashedpass
      };

      //Saving newUser into the database
      User.createUSER(newUser, (error, result, fields) => {
         if (error) {
            console.error('Error inserting new user ' + error.message);
            return res.status(500).json({ error: error.message });
         }
         console.log('Inserted new user successfully ' + result.insertId);
         return res.SendFile("/login");
      });
   })

//login route
app.post('/login', async (req, res) => {
   const {Username, password} = req.body;
 








//retrieve data from database
User.getuserbyUsername(Username, (error, result) => {
 if(error) throw error;
         if(result.length === 0) {
      res.status(401).send('Invalid username or password');
  } else {


//compare password
bcryptjs.compare(password,user.password,(err,isMatch)=>{
if(err) throw err;
if(isMatch){
  req.session.User=User;
     res.redirect('/Index')}
        else{req.status(401)(`invalid Username or Password`);
            }
         });
        }
    });
});





//expense
const Expense = {
  tableName: 'Expense',
  createExpense: (newExpense, callback) => {
         pool.query(`INSERT INTO ${Expense.tableName} SET ?`, newExpense, callback)
          },
  deleteExpense: (expenseID, callback) => {
         pool.query(`DELETE FROM ${Expense.tableName} WHERE expenseID = ?`, [expenseID], callback);
          },
    getExpenseByUserID: (userID, callback) => {
          pool.query(`SELECT * FROM ${Expense.tableName} WHERE userID = ?`, [userID], callback);
          },
    updateExpense: (expenseID, updatedExpense, callback) => {
           pool.query(`UPDATE ${Expense.tableName} SET ? WHERE expenseID = ?`, [updatedExpense, expenseID], callback);
           },
          };
// Add a new expense
app.post('/Expense', (req, res) => {
const { amount, Category, date, userID } = req.body;

 if (!amount || !category || !date || !userID) {
    return res.status(400).json({ error: 'All fields are required' });
     }

const newExpense = {
   Amount: amount,
    Category: category,
  Date: date,
   userID: userID
};


Expense.updateExpense(expenseID, updatedExpense, (error, result) => {
if (error) {
    console.error('Error updating expense: ' + error.message);
       return res.status(500).json({ error: error.message });
     }
if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Expense not found' });
   }
      console.log('Updated expense with id ' + expenseID);
         res.status(200).json({ message: 'Expense updated successfully' });
     });
   });
// Retrieve all expenses for a user
app.get('/expenses/:userID', (req, res) => {
const userID = req.params.userID;

if (!userID) {
return res.status(400).json({ error: 'User ID is required' });
}
Expense.getExpensesByUserID(userID, (error, results) => {
if (error) {
    console.error('Error retrieving expenses: ' + error.message);
       return res.status(500).json({ error: error.message });
       }
       res.status(200).json(results);

    });
 });  
//updating an existing expense.

app.put('/expenses/:id', (req, res) => {
const expenseID = req.params.id;
   const { amount, category, date } = req.body;

if (!amount || !category || !date) {
return res.status(400).json({ error: 'All fields are required' });
 }
//creating updatedExpense object
const updatedExpense = {
Amount: amount,
Category: category,
Date: date
};

Expense.updateExpense(expenseID, updatedExpense, (error, result) => {
   if (error) {
        console.error('Error updating expense: ' + error.message);
        return res.status(500).json({ error: error.message });
       }
         if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Expense not found' });
          }
              console.log('Updated expense with id ' + expenseID);
            res.status(200).json({ message: 'Expense updated successfully' });
      });
});



app.listen(8000, () => {
   console.log('port 8000 is active ');
});
