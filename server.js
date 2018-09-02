'use strict';

const express = require('express');
const config = require('./config');
const mongoose = require('mongoose');

const app = express();

// Routers

app.use('/styles', express.static('./client/styles/'));
app.use('/scripts', express.static('./client/scripts/'));
app.use('/images', express.static('./client/images/'));
app.use(require('./client/router-client'));

// Server Controls

let server;

function startServer(dbUrl = config.DATABASE_URL, port = config.PORT) {
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
	return mongoose.disconnect()
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
	startServer().catch(handleError);

module.exports = { app, startServer, stopServer, handleError };