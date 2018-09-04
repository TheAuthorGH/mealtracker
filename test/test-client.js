'use strict';

const chai = require('chai');
chai.use(require('chai-http'));

const {TEST_DATABASE_URL} = require('../config');
const { app, startServer, stopServer} = require('../server');

const expect = chai.expect;

describe('Meal Tracker Client Gateway', function() {
	
	before(() => startServer(TEST_DATABASE_URL));
	after(stopServer);

	it('should serve the landing page on /', function() {
		return chai.request(app)
			.get('/')
			.then(function(res) {
				expect(res).to.have.status(200);
				expect(res).to.be.html;
			});
	});

	it('should serve the signup page on /signup', function() {
		return chai.request(app)
			.get('/signup')
			.then(function(res) {
				expect(res).to.have.status(200);
				expect(res).to.be.html;
			});
	});

	it('should serve the error page on any other endpoint', function() {
		return chai.request(app)
			.get('/fake-endpoint')
			.then(function(res) {
				expect(res).to.have.status(200);
				expect(res).to.be.html;
			});
	});

});