module.exports = {
	PORT: process.env.PORT || 8080,
	DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost/testdb',
	TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'mongodb://localhost/testdb',
	JWT_SECRET: process.env.JWT_SECRET || '123abc',
	JWT_EXPIRY: process.env.JWT_EXPIRY || '1d',
	ENABLE_AUTH: process.env.ENABLE_AUTH || false
};