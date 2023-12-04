import type { IDataObject } from 'n8n-workflow';

import pgPromise from 'pg-promise';

export async function configurePostgres(credentials: IDataObject, options: IDataObject = {}) {
	const pgp = pgPromise({
		// prevent spam in console "WARNING: Creating a duplicate database object for the same connection."
		// duplicate connections created when auto loading parameters, they are closed imidiatly after, but several could be open at the same time
		noWarnings: true,
	});

	if (typeof options.nodeVersion === 'number' && options.nodeVersion >= 2.1) {
		// Always return dates as ISO strings
		[pgp.pg.types.builtins.TIMESTAMP, pgp.pg.types.builtins.TIMESTAMPTZ].forEach((type) => {
			pgp.pg.types.setTypeParser(type, (value: string) => {
				return new Date(value).toISOString();
			});
		});
	}

	if (options.largeNumbersOutput === 'numbers') {
		pgp.pg.types.setTypeParser(20, (value: string) => {
			return parseInt(value, 10);
		});
		pgp.pg.types.setTypeParser(1700, (value: string) => {
			return parseFloat(value);
		});
	}

	const dbConfig: IDataObject = {
		host: credentials.host as string,
		port: credentials.port as number,
		database: credentials.database as string,
		user: credentials.user as string,
		password: credentials.password as string,
	};

	const db = pgp(dbConfig);
	return { db, pgp };
}
