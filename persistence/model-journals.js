const mongoose = require('mongoose');

const entrySchema = mongoose.Schema({
	title: {type: String, required: true},
	date: {type: Date, required: true},
	description: {type: String, default: 'No description.'}
});

entrySchema.methods.serialize = function() {
	return {
		id: this._id,
		title: this.title,
		date: this.date.toISOString(),
		description: this.description
	};
}

const journalSchema = mongoose.Schema({
	user: {type: mongoose.Schema.Types.ObjectId, required: true},
	title: {type: String, required: true},
	entries: [entrySchema]
});

journalSchema.methods.serialize = function() {
	return {
		id: this._id,
		user: this.user,
		title: this.title,
		entryAmount: this.entries.length
	};
};

journalSchema.methods.paginate = function(page = 0, perpage = 5) {
	const entries = this.entries.map(e => e.serialize());
	entries.sort((e, f) => new Date(f.date) - new Date(e.date));
	return {
		entries: entries.slice(page * perpage, perpage * (page + 1)),
		pages: Math.ceil(this.entries.length / perpage)
	};
};

journalSchema.methods.insights = function() {
	const entries = this.entries;
	const insights = [];

	insights.push(`<span class="mt-journal-insights-highlight">${entries.length}</span> entries in all time`);
	insights.push(`<span class="mt-journal-insights-highlight">${entries.filter(e => new Date() - new Date(e.date) < 86400000).length}</span> entries today`);

	return insights;
};

const Journals = mongoose.model('Journal', journalSchema);

module.exports = Journals;