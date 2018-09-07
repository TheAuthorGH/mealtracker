'use strict';

const router = require('express').Router();

function gotoPage(res, page) {
	res.sendFile(`${__dirname}/${page}.html`);
}

router.get('/', (req, res) => {
	gotoPage(res, 'index');
});

router.get('/signup', (req, res) => {
	gotoPage(res, 'signup');
});

router.get('/signin', (req, res) => {
	gotoPage(res, 'signin');
});

router.get('/signout', (req, res) => {
	gotoPage(res, 'signout');
});

router.get('/dashboard', (req, res) => {
	gotoPage(res, 'dashboard');
});

router.get('/error', (req, res) => {
	gotoPage(res, 'error');
})

module.exports = router;