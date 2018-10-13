'use strict';

const chai = require('chai');
chai.use(require('chai-http'));
const mongoose = require('mongoose');
const faker = require('faker');
const expect = chai.expect;
const bcrypt = require('bcryptjs');

const Users = require('../persistence/model-users');
const {TEST_DATABASE_URL} = require('../config');
const { app, startServer, stopServer} = require('../server');

const userData = {email: faker.internet.email(), password: '123abc!@#'};
const wrongUserData = {email: userData.email, password: '456def$%^'};

function populateDb() {
	return bcrypt.hash(userData.password, 10)
		.then(hash => Users.create({email: userData.email, password: hash}));
}

function dropDb() {
	return mongoose.connection.dropDatabase();
}

describe('MealTracker Auth API', function() {

	let jwt;

	before(() => startServer(TEST_DATABASE_URL).then(() => populateDb()));
	after(() => dropDb().then(() => stopServer()));

	it('should return a JWT on POST /login if provided with correct login data', function() {
		return chai.request(app)
			.post('/auth/login')
			.send(userData)
			.then(res => {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				jwt = res.body;
			});
	});

	it('should deny the JWT on POST /login if provided with incorrect login data', function() {
		return chai.request(app)
			.post('/auth/login')
			.send(wrongUserData)
			.then(res => {
				expect(res).to.have.status(401);
			});
	});

	it('should return a new JWT on GET /refresh if provided with an old JWT', function() {
		return chai.request(app)
			.get('/auth/refresh')
			.set('Authorization', 'Bearer ' + jwt)
			.then(res => {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
			});
	});

});