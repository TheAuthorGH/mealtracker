'use strict';

const router = require('express').Router();

function gotoPage(res, page) {
	res.sendFile(`${__dirname}/${page}.html`);
}

router.get('/', (req, res) => {
	gotoPage(res, 'index');
});

router.get('/:action', (req, res) => {
	switch(req.params.action) {
		case 'register':
			gotoPage(res, 'register');
			break;
		default:
			gotoPage(res, 'error');
			break;
	}
})

module.exports = router;