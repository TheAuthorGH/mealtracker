'use strict';

const util = require('./api-util');
const jsonParser = require('body-parser').json();
const ObjectId = require('mongoose').Types.ObjectId;
const bcrypt = require('bcryptjs');
const Users = require('../persistence/model-users');

const router = require('express').Router();

router.get('/:id', (req, res) => {
	const id = req.params.id;
	if(!util.validateId(id)) return;
	Users.findById(id)
		.then(user => {
			if(user)
				res.status(200).json({user: user.serialize()});
			else
				res.status(404).json({
					reason: 'not-found',
					message: 'User not found.'
				});
		})
		.catch(err => util.handleApiError(err, res));
});

router.post('/', jsonParser, (req, res) => {
	if(!util.objHasFields(req.body, ['email', 'password'])) {
		res.status(400).json({
			reason: 'data-invalid',
			message: 'Invalid user data.'
		});
		return;
	}
	Users.findOne({email: req.body.email})
		.then(user => {
			if(user) {
				res.status(400).json({
					reason: 'email-taken',
					message: 'Email address is already in use!'
				});
				return;
			}
			return bcrypt.hash(req.body.password, 10);
		})
		.then(hash => {
			if(!hash)
				return
			req.body.password = hash;
			Users.create(req.body)
				.then(user => res.status(201).json({user: user.serialize()}))
				.catch(err => util.handleApiError(err, res));
		})
		.catch(err => util.handleApiError(err, res));
});

module.exports = router;