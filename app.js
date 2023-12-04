console.log('nhayr vo day ne');
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('contact_center', 'contact_center', 'L637HsrCFX9xBk5N', {
	host: '125.212.192.144',
	port: '54321',
	dialect:
		'postgres' /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */,
});
sequelize
	.authenticate()
	.then(() => {
		console.log('Connection has been established successfully.');
	})
	.catch((error) => {
		console.error('Unable to connect to the database: ', error);
	});
export default sequelize;
