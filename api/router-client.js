'use strict';

const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
	res.sendFile(`${path.dirname(__dirname)}/client/index.html`);
});

router.get('/:action', (req, res, next) => {
	switch(req.params.action) {
		case 'dashboard':
		case 'signin':
		case 'signout':
		case 'signup':
		case 'error':
		case 'journal':
			res.sendFile(`${path.dirname(__dirname)}/client/${req.params.action}.html`);
			break;
		default:
			next();
	}
});

module.exports = router;