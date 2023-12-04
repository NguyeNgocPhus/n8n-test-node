import {
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	ICredentialsDecrypted,
	IDataObject,
	ICredentialTestFunctions,
	INodeCredentialTestResult,
	INodeListSearchResult,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { configurePostgres } from './transport';
import type { PgpClient } from './helpers/interfaces';
import pgPromise from 'pg-promise';

export class Test implements INodeType {
	description: INodeTypeDescription = {
		// Basic node details will go here
		displayName: 'Test Node',
		name: 'Test',
		icon: 'file:test.svg',
		group: ['transform'],
		version: 1,
		subtitle: '',
		description: 'Test node thooi',
		defaults: {
			name: 'Xin chao',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'testApi',
				required: true,
				testedBy: 'testApiConnectionTest',
			},
		],
		properties: [
			// Resources and operations will go here
			{
				//eslint-disable-next-line
				displayName: 'Nhà cung cấp',
				name: 'resource',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getApp',
				},
				//eslint-disable-next-line
				description: 'Gán nhà cung cấp',
				noDataExpression: true,
				default: '',
			},
			// {
			// 	displayName: 'Table',
			// 	name: 'table',
			// 	type: 'resourceLocator',
			// 	default: { mode: 'list', value: '' },
			// 	required: true,
			// 	description: 'The table you want to work on',
			// 	modes: [
			// 		{
			// 			displayName: 'From List',
			// 			name: 'list',
			// 			type: 'list',
			// 			typeOptions: {
			// 				searchListMethod: 'agentsSearch',
			// 			},
			// 		},
			// 		{
			// 			displayName: 'By Name',
			// 			name: 'name',
			// 			type: 'string',
			// 		},
			// 	],
			// },
		],
	};
	methods = {
		credentialTest: {
			async testApiConnectionTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				const credentials = credential.data as IDataObject;
				let pgpClientCreated: PgpClient | undefined;

				const { db, pgp } = await configurePostgres(credentials, {});
				pgpClientCreated = pgp;
				try {
					await db.connect();
				} catch (error) {
					let message = error.message as string;

					if (error.message.includes('ECONNREFUSED')) {
						message = 'Connection refused';
					}

					if (error.message.includes('ENOTFOUND')) {
						message = 'Host not found, please check your host name';
					}

					if (error.message.includes('ETIMEDOUT')) {
						message = 'Connection timed out';
					}

					return {
						status: 'Error',
						message,
					};
				} finally {
					if (pgpClientCreated) {
						pgpClientCreated.end();
					}
				}
				return {
					status: 'OK',
					message: 'Connection successful!',
				};
			},
		},
		loadOptions: {
			async getApp(this: ILoadOptionsFunctions) {
				const credentials = await this.getCredentials('testApi');
				const { db } = await configurePostgres(credentials, {});

				try {
					const users = await db.any('SELECT id , name FROM public.users WHERE type = $1', [
						'SuperAdmin',
					]);

					return users.map((u) => ({
						name: u.name as string,
						value: String(u.id) as string,
					}));
				} catch (error) {
					throw error;
				} finally {
					await db.$pool.end();
				}
			},
		},
		listSearch: {
			async agentsSearch(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
				const credentials = await this.getCredentials('testApi');
				const { db } = await configurePostgres(credentials, {});

				try {
					const users: any[] = await db.any('SELECT * FROM public.users WHERE type = $1', [
						'SuperAdmin',
					]);

					return {
						results: users.map((u) => ({
							name: u.name as string,
							value: u.id as number,
						})),
					};
				} catch (error) {
					throw error;
				} finally {
					await db.$pool.end();
				}
			},
		},
	};
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const credentials = await this.getCredentials('testApi');

		const pgp = pgPromise();

		const items = this.getInputData();
		let assigne_id = this.getNodeParameter('resource');

		if (items.length === 0) {
			throw new NodeOperationError(this.getNode(), 'something wrong');
		}
		let query = items[0].json.query as any;

		if (query.conversation_id === null) {
		}
		//const resource = this.getNodeParameter('resource');
		const config: IDataObject = {
			host: credentials.host as string,
			port: credentials.port as number,
			database: credentials.database as string,
			user: credentials.user as string,
			password: credentials.password as string,
		};
		const db = await pgp(config);
		try {
			let conversation: any[] = await db.any('SELECT * FROM public.conversations WHERE id = $1', [
				query.conversation_id,
			]);
			console.log('conversation', conversation);
			if (conversation.length === 0) {
				throw new NodeOperationError(
					this.getNode(),
					'không tìm thấy conversation với query = conversation_id',
				);
			}
			await db.any('UPDATE public.conversations SET assignee_id = $1 WHERE id = $2', [
				assigne_id,
				query.conversation_id,
			]);

			return [this.helpers.returnJsonArray(conversation)];
		} catch (error) {
			throw new NodeOperationError(this.getNode(), error.message);
		} finally {
			await db.$pool.end();
		}
	}
}
