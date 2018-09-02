'use strict';

const chai = require('chai');
const { app, startServer, stopServer} = require('../server');
chai.use(require('chai-http'));

const expect = chai.expect;

describe('Meal Tracker Server', function() {
    
    beforeEach(() => startServer());
    afterEach(() => stopServer());

    it('should serve the landing page', function() {
        return chai.request(app)
            .get('/')
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.html;
            });
    });

});