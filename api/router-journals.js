'use strict';

const config = require('../config');
const util = require('./api-util');
const {jwtAuth} = require('../auth/auth');
const jsonParser = require('body-parser').json();
const Journals = require('../persistence/model-journals');
const Users = require('../persistence/model-users');

const router = require('express').Router();

function validateJournalRequest(journal, userId) {
	if(!journal) {
		res.status(404).json({
			reason: 'not-found',
			message: 'Journal not found.'
		});
		return false;
	}
	if(journal.user.toString() !== userId) {
		res.status(401).json({
			reason: 'unauthorized',
			message: 'Journal does not belong to user.'
		});
		return false;
	}
	return true;
}

if(config.ENABLE_AUTH)
	router.use(jwtAuth);

router.get('/', (req, res) => {
	const journalId = req.query.journalid;
	const userId = req.query.userid;
	const page = req.query.page || 0;
	const perpage = req.query.perpage || 5;

	if(!util.validateId(userId, res)) return;

	if(journalId) {
		if(!util.validateId(journalId, res)) return;
		Journals.findById(journalId)
			.then(journal => {
				if(!validateJournalRequest(journal, userId)) return;
				res.status(200).json({journal: journal.serialize()});
			})
			.catch(err => util.handleApiError(err, res));
	} else {
		Journals.find({user: userId})
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
	const journalId = req.query.journalid;
	const userId = req.query.userid;
	const page = req.query.page || 0;
	const perpage = req.query.perpage || 5;

	if(!util.validateId(journalId, res) || !util.validateId(userId, res)) return;

	let filter;
	if(req.query.search) {
		let search = req.query.search.toLowerCase();
		filter = e => e.title.toLowerCase().includes(search) || e.description.toLowerCase().includes(search);
	}

	Journals.findById(journalId)
		.then(journal => {
			if(!validateJournalRequest(journal, userId)) return;
			
			const json = filter ? journal.paginate(page, perpage, filter) : journal.paginate(page, perpage);
			res.status(200).json(json);
		})
		.catch(err => util.handleApiError(err, res));
});

router.post('/entries', jsonParser, (req, res) => {
	const journalId = req.query.journalid;
	const userId = req.query.userid;

	if(!util.validateId(journalId, res) || !util.validateId(userId, res)) return;

	Journals.findById(journalId)
		.then(journal => {
			if(!validateJournalRequest(journal, userId)) return;

			if(!util.objHasFields(req.body, ['title'])) {
				res.status(400).json({
					reason: 'data-invalid',
					message: 'Invalid entry data.'
				});
				return;
			}
			if(req.body.title.length > 20 || req.body.description.length > 300) {
				res.status(400).json({
					reason: 'data-invalid',
					message: 'Invalid entry data: entry title or description too long.'
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
	const userId = req.query.userid;
	const entryId = req.query.entryid;

	if(!util.validateId(journalId, res) || !util.validateId(userId, res) || !util.validateId(entryId, res)) return;

	Journals.findById(journalId)
		.then(journal => {
			if(!validateJournalRequest(journal, userId)) return;

			const entry = journal.entries.id(entryId);
			if(entry) 
				entry.remove();
			journal.save();
			res.status(204).end();
		})
		.catch(err => util.handleApiError(err, res));
});

router.put('/entries', jsonParser, (req, res) => {
	const journalId = req.query.journalid;
	const userId = req.query.userid;
	const entryId = req.query.entryid;

	if(!util.validateId(journalId, res) || !util.validateId(userId, res) || !util.validateId(entryId, res)) return;

	Journals.findById(journalId)
		.then(journal => {
			if(!validateJournalRequest(journal, userId)) return;

			if(entryId !== req.body.id) {
				res.status(400).json({
					reason: "data-invalid",
					message: "Request query ID and request body ID don't match!"
				});
				return;
			};

			const newEntry = { _id: req.body.id };
			const updateableFields = ["title", "description"];
			
			for(let field of Object.keys(req.body).filter(k => updateableFields.includes(k)))
				newEntry[field] = req.body[field];

			if(newEntry.title.length > 20 || newEntry.description.length > 300) {
				res.status(400).json({
					reason: 'data-invalid',
					message: 'Invalid entry data: entry title or description too long.'
				});
				return;
			}

			const oldEntry = journal.entries.id(entryId);
			newEntry.date = oldEntry.date;

			oldEntry.remove();
			journal.entries.push(newEntry);
			journal.save();

			res.status(204).end();
		})
		.catch(err => util.handleApiError(err, res));
});

router.get('/insights', (req, res) => {
	const journalId = req.query.journalid;
	const userId = req.query.userid;

	if(!util.validateId(journalId, res) || !util.validateId(userId, res)) return;

	Journals.findById(journalId)
		.then(journal => {
			if(!validateJournalRequest(journal, userId)) return;

			res.status(200).json({insights: journal.insights()});
		})
		.catch(err => util.handleApiError(err, res));
});

module.exports = router;