'use strict';

const config = require('../config');
const util = require('./api-util');
const {jwtAuth} = require('../auth/auth');
const jsonParser = require('body-parser').json();
const Journals = require('../persistence/model-journals');
const Users = require('../persistence/model-users');

const router = require('express').Router();

if(config.ENABLE_AUTH)
	router.use(jwtAuth);

router.get('/', (req, res) => {
	const id = req.query.id;
	const userid = req.query.userid;
	const page = req.query.page || 0;
	const perpage = req.query.perpage || 5;
	if(id) {
		if(!util.validateId(id, res)) return;
		Journals.findById(id)
			.then(journal => {
				if(journal)
					res.status(200).json({journal: journal.serialize()});
				else
					res.status(404).json({
						reason: 'not-found',
						message: 'Journal not found.'
					});
			})
			.catch(err => util.handleApiError(err, res));
	} else if(userid) {
		if(!util.validateId(userid, res)) return;
		Journals.find({user: userid})
			.skip(page * perpage)
			.limit(perpage)
			.then(journals => {
				if(journals) {
					res.status(200).json({journals: journals.map(j => j.serialize())});
				} else {
					res.status(404).json({
						reason: 'not-found',
						message: 'User not found'
					});
				}
			})
			.catch(err => util.handleApiError(err, res));
	} else {
		res.status(400).json({
			reason: 'data-invalid',
			message: 'Not enough data to find journals.'
		});
	}
});

router.post('/', jsonParser, (req, res) => {
	if(!util.objHasFields(req.body, ['user', 'title'])) {
		res.status(400).json({
			reason: 'data-invalid',
			message: 'Invalid journal data.'
		});
		return;
	}
	if(!(util.validateId(req.body.user, res))) return;
	let journal;
	Journals.create(req.body)
		.then(_journal => {
			journal = _journal;
			return Users.findById(req.body.user);
		})
		.then(user => {
			if(user)
				res.status(201).json({journal: journal.serialize()});
			else
				res.status(404).json({
					reason: 'not-found',
					message: 'Target user not found'
				});
		})
		.catch(err => util.handleApiError(err, res));;
});

router.get('/entries', (req, res) => {
	const id = req.query.id;
	const page = req.query.page || 0;
	const perpage = req.query.perpage || 5;
	if(!util.validateId(id, res)) return;
	Journals.findById(id)
		.then(journal => {
			if(journal)
				res.status(200).json(journal.paginate(page, perpage));
			else
				res.status(404).json({
					reason: 'not-found',
					message: 'Journal not found'
				});
		})
		.catch(err => util.handleApiError(err, res));;
});

router.post('/entries', jsonParser, (req, res) => {
	const id = req.query.id;
	if(!util.validateId(id, res)) return;
	Journals.findById(id)
		.then(journal => {
			if(!util.objHasFields(req.body, ['title'])) {
				res.status(400).json({
					reason: 'data-invalid',
					message: 'Invalid entry data.'
				});
				return;
			}
			req.body.date = req.body.date ? new Date(req.body.date) : new Date();
			journal.entries.push(req.body);
			journal.save();
			res.status(201).json({entry: journal.entries[journal.entries.length - 1].serialize()});
		})
		.catch(err => util.handleApiError(err, res));;
});

module.exports = router;