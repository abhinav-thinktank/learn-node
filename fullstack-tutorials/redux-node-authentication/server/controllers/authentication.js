const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config')

//function to create JWT token for user.
//As a convention has a sub property -> Who is the token about?
//As a convention has a iat property -> issued at time.
//We use id because its unique and autogenerated.
function tokenForUser(user) {
  const timeStamp = new Date().getTime();
  return jwt.encode({ sub:user.id, iat:timeStamp },config.secret)
}

exports.signin = function(req,res,next){
  //User has already had user and password auth'd.
  //We need to give them a token.
  res.send({token: tokenForUser(req.user)});
}

exports.signup = function(req,res,next) {
  //Check if user with email exists.
const email = req.body.email;
const password = req.body.password;

if(!email || !password) {
  return res.status(422).send({error:'You must provide email and password '});
}

User.findOne({email: email}, function(err,existingUser){
if(err){ return next(err); }

//if a user with email exists, return an error
if(existingUser) {
  return res.status(422).send({error:'Email is in use'}); //Unprocessable entity
}

//If a user with emmail doesn't exist, create and save user record.
//Create
const user = new User({
  email:email,
  password:password
})
//Add to database.
user.save(function(err){
  if(err) {return next(err);}
  //Respond to request showing user was created,and create token to identify user for further interaction.
  //JSON web token.
  //When user signs in or signs up -> give token in exchange of an id.
  //UserID + secret string = JSON Web token.
  //When user makes authenticated request they need to include JWT.
  //JSON Web token +secret string  = user id.
  //The string should not be revealed.
  res.json({token:tokenForUser(user)});
});

})






}
