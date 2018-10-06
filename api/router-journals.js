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
						message: 'User not found.'
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
					message: 'Target user not found.'
				});
		})
		.catch(err => util.handleApiError(err, res));
});

router.get('/entries', (req, res) => {
	const id = req.query.id;
	const page = req.query.page || 0;
	const perpage = req.query.perpage || 5;

	let filter;
	if(req.query.search) {
		let search = req.query.search.toLowerCase();
		filter = e => e.title.toLowerCase().includes(search) || e.description.toLowerCase().includes(search);
	}

	if(!util.validateId(id, res)) return;
	Journals.findById(id)
		.then(journal => {
			if(journal) {
				const json = filter ? journal.paginate(page, perpage, filter) : journal.paginate(page, perpage);
				res.status(200).json(json);
			} else {
				res.status(404).json({
					reason: 'not-found',
					message: 'Journal not found.'
				});
			}
		})
		.catch(err => util.handleApiError(err, res));
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
		.catch(err => util.handleApiError(err, res));
});

router.delete('/entries', (req, res) => {
	const journalId = req.query.journalid;
	const entryId = req.query.entryid;
	if(!util.validateId(journalId, res) || !util.validateId(entryId, res)) return;
	Journals.findById(journalId)
		.then(journal => {
			const entry = journal.entries.id(entryId);
			if(entry) 
				entry.remove();
			journal.save();
			res.status(204).end();
		})
		.catch(err => util.handleApiError(err, res));
});

router.get('/insights', (req, res) => {
	const id = req.query.id;
	if(!util.validateId(id, res)) return;
	Journals.findById(id)
		.then(journal => {
			if(journal)
				res.status(200).json({insights: journal.insights()})
			else
				res.status(404).json({
					reason: 'not-found',
					message: 'Journal not found.'
				});
		})
		.catch(err => util.handleApiError(err, res));
});

module.exports = router;