const mongoose = require('mongoose');

const entrySchema = mongoose.Schema({
	title: {type: String, required: true},
	date: {type: Date, required: true}
});

const journalSchema = mongoose.Schema({
	user: {type: mongoose.Schema.Types.ObjectId, required: true},
	title: {type: String, required: true},
	entries: [entrySchema]
});

journalSchema.methods.serialize = function() {
	return {
		title: this.title,
		entryAmount: this.entries.length,
		created: this.created
	};
};

journalSchema.methods.entryPage = function(perPage = 5, page = 0) {
	return this.entries.slice(page * perPage, perPage * (page + 1));
};

const Journals = mongoose.model('Journal', journalSchema);

module.exports = Journals;