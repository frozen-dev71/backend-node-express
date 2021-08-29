module.exports = {
	apps: [
		{
			name: 'De4thZone',
			script: 'dist/index.js',
			watch: true,
			env: {
				NODE_ENV: 'development'
			},
			env_production: {
				NODE_ENV: 'production'
			}
		}
	]
};
