'use strict';

const {localAuth, jwtAuth, createAuthToken} = require('../auth');

const router = require('express').Router();

router.use(require('body-parser').json());

router.post('/login', localAuth, (req, res) => {
	res.json(createAuthToken(req.user));
});

router.get('/refresh', jwtAuth, (req, res) => {
	res.json(createAuthToken(req.user));
});

module.exports = router;