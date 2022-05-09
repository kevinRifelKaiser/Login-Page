//Express
const express = require('express');
const app = express();
const port = 3000;
//Body Parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
//EJS
const ejs = require('ejs');
app.set('view engine', 'ejs');
//Mongoose
const mogoose = require('mongoose');
const { default: mongoose } = require('mongoose');
mongoose.connect('mongodb://localhost:27017/userDB');

app.use(express.static(__dirname + '/public'));

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = new mongoose.model('User', userSchema);



app.get('/', function(req, res) {
    res.render('home');
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.post('/login', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({email: username}, function(err, foundname) {
        if(err) {
            console.log(err);
        } else {
            if(foundname) {
                if(foundname.password === password) {
                    res.render('secrets');
                }
            }
        }
    });
});


app.get('/register', function(req, res) {
    res.render('register');
});

app.post('/register', function(req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save(function(err) {
        if(!err) {
            res.render('secrets');
        } else {
            console.log(err);
        }
    });
});





app.listen(port, function(req, res) {
    console.log('Server started on port 3000.');
});