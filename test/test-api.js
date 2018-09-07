'use strict';

const chai = require('chai');
chai.use(require('chai-http'));
const mongoose = require('mongoose');
const faker = require('faker');
const expect = chai.expect;

const Users = require('../persistence/model-users');
const {TEST_DATABASE_URL} = require('../config');
const { app, startServer, stopServer} = require('../server');

const modelUser = fakeUser();

function fakeUser() {
	return {
		email: faker.internet.email(),
		password: '123abc!@#'
	};
}

function populateDb() {
	return new Promise((resolve, reject) => {
		for(let i = 0; i < 5; i++)
			Users.create(fakeUser());
		resolve();
	});
}

function dropDb() {
	return mongoose.connection.dropDatabase();
}

describe('Meal Tracker API', function() {
	
	before(() => startServer(TEST_DATABASE_URL));
	beforeEach(populateDb);
	afterEach(dropDb);
	after(stopServer);

	describe('Users API', function() {

		it('should return a single user on GET /users/:id', function() {
			let user;
			return Users.findOne()
				.then(function(_user) {
					user = _user;
					return chai.request(app)
						.get('/users/' + user._id);
				})
				.then(function(res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body.user).to.include.keys('id', 'email', 'journals');
					expect(res.body.user.id).to.equal(user._id.toString());
					expect(res.body.user.email).to.equal(user.email);
				});
		});

		it('should create a new user on POST /users', function() {
			return chai.request(app)
				.post('/users/')
				.send(modelUser)
				.then(res => {
					expect(res).to.have.status(201)
					expect(res).to.be.json;
					expect(res.body.user).to.include.keys('id', 'email', 'journals', 'verified');
					expect(res.body.user.email).to.equal(modelUser.email);
					expect(res.body.user.journals).to.be.an('array');
					return Users.findById(res.body.user.id);
				})
				.then(user => {
					expect(user).to.not.be.null;
					user = user.toObject();
					expect(user).to.include.keys('_id', 'email', 'verified', 'password', 'journals');
					expect(user.email).to.equal(modelUser.email);
					expect(user.journals).to.be.an('array');
				});
		});

	});

});