'use strict';

const chai = require('chai');
chai.use(require('chai-http'));
const mongoose = require('mongoose');
const faker = require('faker');
const expect = chai.expect;

const config = require('../config');
config.ENABLE_AUTH = false;

const Users = require('../persistence/model-users');
const Journals = require('../persistence/model-journals');
const {TEST_DATABASE_URL} = require('../config');
const { app, startServer, stopServer } = require('../server');

const modelUser = fakeUser();
const modelJournal = fakeJournal(modelUser);

function fakeUser() {
	return {
		email: faker.internet.email(),
		password: '123abc!@#'
	};
}

function fakeJournal(userid) {
	return {
		user: userid,
		title: faker.lorem.words()
	};
}

function populateDb() {
	const users = [];
	for(let i = 0; i < 10; i++)
		users.push(fakeUser());
	return Users.insertMany(users)
		.then(users => Journals.insertMany(users.map(u => fakeJournal(u._id))));
}

function dropDb() {
	return mongoose.connection.dropDatabase();
}

describe('MealTracker API', function() {

	before(() => startServer(TEST_DATABASE_URL));
	beforeEach(() => populateDb());
	afterEach(dropDb);
	after(stopServer);

	describe('Users API', function() {

		it('should return a single user on GET /users?id=...', function() {
			let user;
			return Users.findOne()
				.then(function(_user) {
					user = _user;
					return chai.request(app)
						.get('/users?id=' + user._id);
				})
				.then(function(res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body.user).to.include.keys('id', 'email', 'verified');
					expect(res.body.user.id).to.equal(user._id.toString());
					expect(res.body.user.email).to.equal(user.email);
				});
		});

		it('should create a new user on POST /users', function() {
			return chai.request(app)
				.post('/users')
				.send(modelUser)
				.then(function(res) {
					expect(res).to.have.status(201)
					expect(res).to.be.json;
					expect(res.body.user).to.include.keys('id', 'email', 'verified');
					expect(res.body.user.email).to.equal(modelUser.email);
					return Users.findById(res.body.user.id);
				})
				.then(function(user) {
					expect(user).to.not.be.null;
					user = user.toObject();
					expect(user).to.include.keys('_id', 'email', 'verified', 'password');
					expect(user.email).to.equal(modelUser.email);
				});
		});

	});

	describe('Journals API', function() {

		it('should return a single journal on GET /journals?id=...', function() {
			let journal;
			return Journals.findOne()
				.then(function(_journal) {
					journal = _journal;
					return chai.request(app)
						.get('/journals?id=' + journal._id);
				})
				.then(function(res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body.journal).to.include.keys('id', 'user', 'title', 'entryAmount');
				});
		});

	});

});