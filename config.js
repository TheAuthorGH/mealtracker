module.exports = {
	PORT: process.env.PORT || 8080,
	DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost/testdb',
	TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'mongodb://localhost/testdb',
	JWT_SECRET: '123abc', // Replace this with a strong, gibberish string!
	JWT_EXPIRY: '1d'
};