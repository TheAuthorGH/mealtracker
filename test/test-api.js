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
		description: faker.lorem.words(),
		positive: true
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

		it('should return a single journal on GET /?journalid=<journalid>&userid=<userid>', function() {
			let journal;
			return Journals.findOne()
				.then(function(_journal) {
					journal = _journal;
					return chai.request(app)
						.get(`/journals?journalid=${journal._id}&userid=${journal.user}`);
				})
				.then(function(res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.include.keys('journal');

					const journal = res.body.journal;
					expect(journal).to.include.keys('id', 'user', 'title', 'entryAmount');
					expect(journal.user).to.equal(journal.user.toString());
					expect(journal.title).to.equal(journal.title.toString());
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

					const journal = res.body.journal;
					expect(journal).to.include.keys('id', 'user', 'title', 'entryAmount');
					expect(journal.user).to.equal(modelJournal.user.toString());
					expect(journal.title).to.equal(modelJournal.title);
				});
		});

		it('should return paginated entries on GET /entries?journalid=<journalid>&userid=<userid>&perpage=<perpage>&page=<page>', function() {
			return Journals.findOne()
				.then(function(journal) {
					return chai.request(app)
						.get(`/journals/entries?journalid=${journal._id}&userid=${journal.user}&perpage=4&page=2`);
				})
				.then(function(res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.include.keys('entries');
					expect(res.body.entries).to.be.an('array');
					expect(res.body.entries.length).to.equal(4);

					const entry = res.body.entries[0];
					expect(entry).to.include.keys('id', 'title', 'date', 'description', 'positive');
					expect(entry.id).to.be.a('string');
					expect(entry.title).to.be.a('string');
					expect(entry.description).to.be.a('string');
					expect(entry.positive).to.equal(true);
				});
		});

		it('should create a journal entry on POST /entries?journalid=<journalid>&userid=<userid>', function() {
			return Journals.findOne()
				.then(function(journal) {
					return chai.request(app)
						.post(`/journals/entries?journalid=${journal._id}&userid=${journal.user}`)
						.send(modelEntry);
				})
				.then(function(res) {
					expect(res).to.have.status(201);
					expect(res).to.be.json;
					expect(res.body).to.include.keys('entry');

					const entry = res.body.entry;
					expect(entry).to.include.keys('id', 'title', 'date', 'description');
					expect(entry.title).to.equal(modelEntry.title);
					expect(entry.description).to.equal(modelEntry.description);
				});
		});

		it('should delete a journal entry on DELETE /entries?journalid=<journalid>&userid=<userid>&entryid=<entryid>', function() {
			let journalId;
			let userId;
			let entryId;
			return Journals.findOne()
				.then(function(journal) {
					journalId = journal._id;
					userId = journal.user;
					return journal.entries[0];
				})
				.then(function(entry) {
					entryId = entry._id;
					return chai.request(app)
						.delete(`/journals/entries?journalid=${journalId}&userid=${userId}&entryid=${entryId}`);
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

		it('should replace a journal entry on PUT /entries?journalid=<journalid>&userid=<userid>&entryid=<entryid>', function() {
			let journalId;
			let userId;
			let entryId;
			const newEntry = {
				title: faker.lorem.word(),
				description: faker.lorem.words()
			};
			return Journals.findOne()
				.then(function(journal) {
					journalId = journal._id;
					userId = journal.user;
					return journal.entries[0];
				})
				.then(function(entry) {
					entryId = entry._id;
					newEntry.id = entryId;
					return chai.request(app)
						.put(`/journals/entries?journalid=${journalId}&userid=${userId}&entryid=${entryId}`)
						.send(newEntry);
				})
				.then(function(res) {
					expect(res).to.have.status(204);
					expect(res.body).to.be.empty;
					return Journals.findById(journalId);
				})
				.then(function(journal) {
					const entry = journal.entries.id(entryId);
					expect(entry).to.not.be.null;
					expect(entry.title).to.equal(newEntry.title);
					expect(entry.description).to.equal(newEntry.description);
				});
		});

		it('should return journal insights on GET /insights?journalid=<journalid>&userid=<userid>', function() {
			return Journals.findOne()
				.then(function(journal) {
					return chai.request(app)
						.get(`/journals/insights?journalid=${journal._id}&userid=${journal.user}`);
				})
				.then(function(res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.include.keys('insights');
					
					const insights = res.body.insights;
					expect(insights).to.be.an('array');
					expect(insights.length).to.be.at.least(0);
					expect(insights[0]).to.be.a('string');
				});
		});

	});

});