const mongoose = require('mongoose');

const entrySchema = mongoose.Schema({
	title: {type: String, required: true},
	date: {type: Date, required: true},
	description: {type: String, default: null},
	positive: {type: Boolean, default: false}
});

entrySchema.methods.serialize = function() {
	return {
		id: this._id,
		title: this.title,
		date: this.date.toISOString(),
		description: this.description,
		positive: this.positive
	};
}

const journalSchema = mongoose.Schema({
	user: {type: mongoose.Schema.Types.ObjectId, required: true},
	title: {type: String, required: true},
	entries: [entrySchema],
	creationDate: {type: Date, required: true, default: new Date()}
});

journalSchema.methods.serialize = function() {
	return {
		id: this._id,
		user: this.user,
		title: this.title,
		entryAmount: this.entries.length
	};
};

journalSchema.methods.paginate = function(page = 0, perpage = 5, filter) {

	let entries = this.entries.map(e => e.serialize());
	if(filter)
		entries = entries.filter(filter);
	entries.sort((e, f) => new Date(f.date) - new Date(e.date));
	const pages = Math.ceil(this.entries.length / perpage);

	if(page === 'first' || page < 0)
		page = 0;
	else if(page === 'last' || page >= pages)
		page = pages - 1;
	else
		page = Number(page) || 0;
	
	return {
		entries: entries.slice(page * perpage, perpage * (page + 1)),
		pages: pages,
		page: page
	};
};

journalSchema.methods.insights = function() {
	const entries = this.entries;
	const insights = [];

	insights.push(`<span class="mt-journal-insights-highlight">${entries.length}</span> entries in all time.`);
	insights.push(`<span class="mt-journal-insights-highlight">
		${entries.filter(e => {now = new Date(); return now.getDay() === e.date.getDay() && now.getMonth() === e.date.getMonth() && now.getYear() === e.date.getYear()}).length}
		</span> entries today.`);
	insights.push(`<span class="mt-journal-insights-highlight">${parseFloat(entries.length/Math.ceil((new Date() - this.creationDate)/86400000)).toFixed(2)}</span> average entries per day.`);
	insights.push(`<span class="mt-journal-insights-highlight">${entries.filter(e => e.positive).length}</span> healthy entries.`);
	insights.push(`<span class="mt-journal-insights-highlight">${entries.length === 0 ? '0' : Math.round((entries.filter(e => e.positive).length * 100)/entries.length)}%</span> of entries are healthy.`);
	insights.push(`<span class="mt-journal-insights-highlight">${Math.ceil((new Date() - this.creationDate)/86400000)}</span> days since journal creation.`);

	return insights;
};

const Journals = mongoose.model('Journal', journalSchema);

module.exports = Journals;