module.exports = {

	handleApiError: function(err, res) {
		console.error(err);
		res.status(500).send('Internal server error!');
	},

	objHasFields: function(obj, fields) {
		if(!obj || !fields)
			return false;
		for(let f of fields) {
			if(obj[f] === undefined)
				return false;
		}
		return true;
	}

};