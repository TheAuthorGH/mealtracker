const Users = require('../persistence/model-users');
const config = require('../config');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: LocalStrategy} = require('passport-local');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function validatePassword(user, password) {
	if(user)
		return bcrypt.compare(password, user.password);
	else
		return new Promise(resolve => resolve(false));
}

function createAuthToken(user) {
	return jwt.sign({user: user}, config.JWT_SECRET, {
		subject: user.email,
		expiresIn: config.JWT_EXPIRY,
		algorithm: 'HS256'
	});
}

passport.use(new JwtStrategy({
	secretOrKey: config.JWT_SECRET,
	jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
	algorithms: ['HS256']
}, (payload, done) => {
	done(null, payload.user);
}));

const jwtAuth = passport.authenticate('jwt', {session: false});

passport.use(new LocalStrategy((email, password, callback) => {
	console.log('EMAIL: ' + email);
	console.log('PASSWORD: ' + password);
	let user;
	return Users.findOne({email: email})
		.then(_user => {
			user = _user;
			if(user)
				return validatePassword(user, password);
			else
				return Promise.reject({reason: 'login-notfound'});
		})
		.then(valid => {
			if(valid)
				return callback(null, user);
			else
				return Promise.reject({reason: 'login-invalid'});
		})
		.catch(err => {
			if(err.reason === 'login-invalid' || err.reason === 'login-notfound')
				return callback(null, false, err);
			return callback(err, false);
		});
}));

const localAuth = passport.authenticate('local', {session: false});

module.exports = {createAuthToken, validatePassword, jwtAuth, localAuth};