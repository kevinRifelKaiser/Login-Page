//environment variables
require('dotenv').config()
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
//Express-Session
const session = require('express-session');
//1st. Passport
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const { authenticate } = require('passport/lib');
//Google Strategy
var GoogleStrategy = require('passport-google-oauth20').Strategy;
//Mongoose-findOrCreate
var findOrCreate = require('mongoose-findorcreate');

//Use static CSS sheet
app.use(express.static(__dirname + '/public'));

//2. Setting up initial session configurations
app.use(session({
    secret: 'Aca la cadena de texto que se te ocurra',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB');
//mongoose.set('useCreateIndex', true);

//Mongoose Schema and Model.
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//3. Hash and salt passwords with passport.
userSchema.plugin(passportLocalMongoose);

userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

//4. Serialize-Deserialize cookies.
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//GoogleStrategy - SetUp
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    //Add another end point, because of Google Plus API deprecation
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

//---ROUTS---///
app.get('/', function(req, res) {
    res.render('home');
});

app.get('/register', function(req, res) {
    res.render('register');
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.get('/secrets', function(req, res) {
    if(req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});


app.post('/register', function(req, res) {

   User.register({username: req.body.username}, req.body.password, function(err, user) {
       if(err) {
           console.log(err);
           res.redirect('/register');
       } else {
           passport.authenticate('local')(req, res, function() {
               res.redirect('/secrets');
           });
       }
   });
    
});

app.post('/login', function(req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err) {
        if(err) {
            console.log(err);
        } else {
            passport.authenticate('local')(req, res, function() {
                res.redirect('/secrets');
            });
        }
    });

});










app.listen(port, function(req, res) {
    console.log('Server started on port 3000.');
});