import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class TestApi implements ICredentialType {
	name = 'testApi';

	displayName = 'TestApi API';

	properties: INodeProperties[] = [
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: 'localhost',
		},
		{
			displayName: 'Database',
			name: 'database',
			type: 'string',
			default: 'postgres',
		},
		{
			displayName: 'User',
			name: 'user',
			type: 'string',
			default: 'postgres',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: 'phu',
		},
		{
			displayName: 'Port',
			name: 'port',
			type: 'number',
			default: 5432,
		},
	];
}
