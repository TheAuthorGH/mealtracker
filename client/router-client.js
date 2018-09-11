const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
	res.sendFile(`${__dirname}/index.html`);
});

router.use('/journal', express.static('./client/journal.html'));

router.get('/:action', (req, res, next) => {
	switch(req.params.action) {
		case 'dashboard':
		case 'signin':
		case 'signout':
		case 'signup':
		case 'error':
			res.sendFile(`${__dirname}/${req.params.action}.html`);
			break;
		default:
			next();
	}
});

module.exports = router;