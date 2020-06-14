// These are third party packages 
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');

// These are route files
const index = require('./routes/index');
const connection = require('./routes/connection').connection;
const connections = require('./routes/connection').connections;
const page_404 = require('./routes/page_404');
const about = require('./routes/about');
const contact = require('./routes/contact');
const user = require('./routes/user');

//connecting mongodb
var mongoose = require('mongoose');
mongoose.connect(
	'mongodb://localhost/fitnection_2_db',
	{
		useNewUrlParser: true,
		useUnifiedTopology: true
    },
    err => {
        if(err) {
            return console.error('Failed to connect to the mongodb');
        }
    }
);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


const port = 8085;

// Initializing the express
const app = express();

// Setting up the view engine
app.set('view engine', 'ejs');

// Adding session middleware
app.use(session({secret: 'rsajjan97',
    resave: true,
    saveUninitialized: true
}));

// Adding the body-parser middlware
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets', express.static('assets'));

// Adding the method-override middleware to serve PUT and DELETE requests
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
}));

// Adding the middleware to display the routes being displayed
app.use((req, res, next) => {
    console.log('Request Method: ', req.method, 'Route requested: ', req.url);
    next();
});

// routes with respective route/controller files
app.use('/', index);
app.use('/connection/', connection);
app.use('/connections/', connections);
app.use('/about', about);
app.use('/contact', contact);
app.use('/user', user);
app.use('*', page_404); // handling the rest of the unhandled routes by displaying 404 error.

// Starting the app on the given port number
app.listen(port);
console.log("Listening on port: ", port);