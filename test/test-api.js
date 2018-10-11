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
const modelJournal = fakeJournal();
const modelEntry = fakeJournalEntry();

function fakeUser() {
	return {
		email: faker.internet.email(),
		password: '123abc!@#'
	};
}

function fakeJournal(userid) {
	const entries = [];
	for(let e = 0; e < 12; e++)
		entries.push(fakeJournalEntry());
	return {
		user: userid,
		title: faker.lorem.words(),
		entries: entries
	};
}

function fakeJournalEntry() {
	return {
		title: faker.lorem.word(),
		date: new Date(),
		description: faker.lorem.words()
	};
}

function populateDb() {
	const users = [];
	for(let i = 0; i < 5; i++)
		users.push(fakeUser());
	return Users.insertMany(users)
		.then(users => Journals.insertMany(users.map(u => fakeJournal(u._id))))
		.then(() => Users.findOne())
		.then(user => modelJournal.user = user._id);
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

		it('should return a single user on GET /?id=<userid>', function() {
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
					expect(res.body).to.include.keys('user');
					expect(res.body.user).to.include.keys('id', 'email', 'verified');
					expect(res.body.user.id).to.equal(user._id.toString());
					expect(res.body.user.email).to.equal(user.email);
				});
		});

		it('should create a new user on POST /', function() {
			return chai.request(app)
				.post('/users')
				.send(modelUser)
				.then(function(res) {
					expect(res).to.have.status(201);
					expect(res).to.be.json;
					expect(res.body).to.include.keys('user');
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

		it('should return a single journal on GET /?id=<journalid>', function() {
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
					expect(res.body).to.include.keys('journal');
					expect(res.body.journal).to.include.keys('id', 'user', 'title', 'entryAmount');
					expect(res.body.journal.user).to.equal(journal.user.toString());
					expect(res.body.journal.title).to.equal(journal.title.toString());
				});
		});

		it('should create a journal on POST /', function() {
			return chai.request(app)
				.post('/journals')
				.send(modelJournal)
				.then(function(res) {
					expect(res).to.have.status(201);
					expect(res).to.be.json;
					expect(res.body).to.include.keys('journal');
					expect(res.body.journal).to.include.keys('id', 'user', 'title', 'entryAmount');
					expect(res.body.journal.user).to.equal(modelJournal.user.toString());
					expect(res.body.journal.title).to.equal(modelJournal.title);
				});
		});

		it('should return paginated entries on GET /entries?id=<journalid>&perpage=<perpage>&page=<page>', function() {
			return Journals.findOne()
				.then(function(journal) {
					return chai.request(app)
						.get(`/journals/entries?id=${journal._id}&perpage=4&page=2`);
				})
				.then(function(res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.include.keys('entries');
					expect(res.body.entries).to.be.an('array');
					expect(res.body.entries.length).to.equal(4);
				});
		});

		it('should create a journal entry on POST /entries?id=<journalid>', function() {
			return Journals.findOne()
				.then(function(journal) {
					return chai.request(app)
						.post('/journals/entries?id=' + journal._id)
						.send(modelEntry);
				})
				.then(function(res) {
					expect(res).to.have.status(201);
					expect(res).to.be.json;
					expect(res.body).to.include.keys('entry');
					expect(res.body.entry).to.include.keys('id', 'title', 'date', 'description');
					expect(res.body.entry.title).to.equal(modelEntry.title);
					expect(res.body.entry.description).to.equal(modelEntry.description);
				});
		});

		it('should delete a journal entry on DELETE /entries?id=<entryid>', function() {
			let journalId;
			let entryId;
			return Journals.findOne()
				.then(function(journal) {
					journalId = journal._id;
					return journal.entries[0];
				})
				.then(function(entry) {
					entryId = entry._id;
					return chai.request(app)
						.delete(`/journals/entries?journalid=${journalId}&entryid=${entryId}`);
				})
				.then(function(res) {
					expect(res).to.have.status(204);
					expect(res.body).to.be.empty;
					return Journals.findById(journalId);
				})
				.then(function(journal) {
					expect(journal.entries.id(entryId)).to.be.null;
				});
		});

		it('should return journal insights on GET /insights?id=<journalid>', function() {
			return Journals.findOne()
				.then(function(journal) {
					return chai.request(app)
						.get('/journals/insights?id=' + journal._id);
				})
				.then(function(res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.include.keys('insights');
					expect(res.body.insights).to.be.an('array');
					expect(res.body.insights.length).to.be.at.least(0);
					expect(res.body.insights[0]).to.be.a('string');
				});
		});

	});

});