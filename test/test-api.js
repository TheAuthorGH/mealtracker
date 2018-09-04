'use strict';

const chai = require('chai');
chai.use(require('chai-http'));
const mongoose = require('mongoose');
const faker = require('faker');
const expect = chai.expect;

const Users = require('../api/model-users');
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
			return Users.findOne()
				.then(function(user) {
					return chai.request(app)
						.get('/users/' + user._id);
				})
				.then(function(res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.include.keys('id', 'email', 'journals');
				});
		});

		it('shoduld create a new user on POST /users', function() {
			return chai.request(app)
				.post('/users/')
				.send(modelUser)
				.then(res => {
					expect(res).to.have.status(201)
					expect(res).to.be.json;
					expect(res.body).to.include.keys('id', 'email', 'journals');
					expect(res.body.email).to.equal(modelUser.email);
					expect(res.body.journals).to.be.an('array');
					Users.findById(res.body.id)
						.then(user => {
							expect(user).to.not.be.null;
							expect(user).to.include.keys('email', 'journals', 'password');
							expect(user.email).to.equal(modelUser.email);
							expect(user.journals).to.be.an('array');
						});
				})
		});

	});

});