const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
	res.sendFile(`${__dirname}/index.html`);
});

router.get('/:action', (req, res, next) => {
	switch(req.params.action) {
		case 'dashboard':
		case 'signin':
		case 'signout':
		case 'signup':
		case 'error':
		case 'journal':
			res.sendFile(`${__dirname}/${req.params.action}.html`);
			break;
		default:
			next();
	}
});

module.exports = router;