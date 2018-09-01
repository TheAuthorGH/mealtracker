const express = require('express');
const config = require('./config');
const mongoose = require('mongoose');

const app = express();

// Server Controls

let server;

function startServer(dbUrl, port = config.PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(dbUrl, err => {
			if(err)
				return reject(err);
			server = app.listen(port, () => {
				console.log(`MealTracker is listening on port ${port}.`)
				resolve();
			})
			.on('error', err => {
				mongoose.disconnect();
				reject(err);
			});
		});
	});
}

function stopServer() {
	return server.disconnect()
		.then(() => {
			return new Promise((resolve, reject) => {
				console.log('closing MealTracker server.');
				server.close(err => {
					if(err) {
						handleError(err);
						reject(err);
					}
					resolve();
				});
			});
		});
}

function handleError(err) {
	console.log(err);
}

if(require.main === module)
	startServer(config.DATABASE_URL).catch(handleError);

module.exports = { app, startServer, stopServer, handleError };