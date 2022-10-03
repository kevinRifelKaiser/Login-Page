import mongoose from 'mongoose';
import { userSchema } from './db.js';
import { SECRET, CLIENT_ID, CLIENT_SECRET } from './config.js';

//environment variables
import * as dotenv from 'dotenv'
dotenv.config()

//Express
import express from 'express';
const app = express();
const port = 3000;

//Body Parser
import bodyParser from 'body-parser';
import path from 'path';
app.use(bodyParser.urlencoded({extended: true}));

//EJS
import ejs from 'ejs';
app.set('view engine', 'ejs');

//Express-Session
import session from 'express-session';

//1st. Passport
import passport from 'passport';
import passportLocalMongoose from 'passport-local-mongoose';
//import { authenticate } from 'passport';

//Google Strategy
import gStrategy from 'passport-google-oauth20';
const GoogleStrategy = gStrategy.Strategy;

//Use static CSS sheet
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname + '/public')));

//2. Setting up initial session configurations
app.use(session({
    secret: 'Aca la cadena de texto que se te ocurra',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//3. Hash and salt passwords with passport.
userSchema.plugin(passportLocalMongoose);

userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

//4. Serialize-Deserialize cookies for all authentication strategies
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

//Mongoose-findOrCreate
import findOrCreate from 'mongoose-findorcreate';

//GoogleStrategy - SetUp
passport.use(new GoogleStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    //Add another end point, because of Google Plus API deprecation --> https://github.com/jaredhanson/passport-google-oauth2/pull/51
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({username: profile.emails[0].value, googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


//---ROUTS---///
app.get('/', function(req, res) {
    res.render('home');
});

app.get('/auth/google',
    //Google strategy
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets page.
    res.redirect('/secrets');
  }
);

app.get('/register', function(req, res) {
    res.render('register');
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.get('/secrets', function(req, res) {
    //($ne --> not equal)
    User.find({'secrets':{$ne:null}}, function(err, foundUsers) {
        if(err) {
            console.log(err);
        } else {
            if (foundUsers) {
                res.render('secrets', {usersWithSecrets: foundUsers});
            }
        }
    });
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/submit', function(req, res) {
    if(req.isAuthenticated()) {
        res.render('submit');
    } else {
        res.redirect('/login');
    }
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
            //Local strategy
            passport.authenticate('local')(req, res, function() {
                res.redirect('/secrets');
            });
        }
    });

});

app.post('/submit', function(req, res) {
    
    const submittedSecret = req.body.secret;
    User.findById(req.user.id, function(err, foundUser) {
        if(err) {
            console.log(err);
        } else {
            if(foundUser) {
                foundUser.secret = submittedSecret;
                foundUser.save(function() {
                    res.redirect('/secrets');
                });
            }
        }
    });

});


app.listen(port, function(req, res) {
    console.log('Server started on port 3000.');
});