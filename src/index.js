import mongoose from 'mongoose';
import config from '~/config/config';
import app from '~/config/express';
import logger from './config/logger';
import Permission from './models/permissionModel';
import Role from './models/roleModel';
import User from './models/userModel';

let server;

mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on('connecting', () => {
	logger.info('🚀 Connecting to MongoDB...');
});

db.on('error', (err) => {
	logger.error(`MongoDB connection error: ${err}`);
	mongoose.disconnect();
});

db.on('connected', () => {
	logger.info('🚀 Connected to MongoDB!');
});

db.once('open', () => {
	logger.info('🚀 MongoDB connection opened!');
});

db.on('reconnected', () => {
	logger.info('🚀 MongoDB reconnected!');
});

async function initial() {
	try {
		const countPermissions = await Permission.estimatedDocumentCount();
		if (countPermissions === 0) {
			await Permission.create(
				{
					controller: 'user',
					action: 'create'
				},
				{
					controller: 'user',
					action: 'read'
				},
				{
					controller: 'user',
					action: 'update'
				},
				{
					controller: 'user',
					action: 'delete'
				},
				{
					controller: 'role',
					action: 'create'
				},
				{
					controller: 'role',
					action: 'read'
				},
				{
					controller: 'role',
					action: 'update'
				},
				{
					controller: 'role',
					action: 'delete'
				}
			);
		}
		const countRoles = await Role.estimatedDocumentCount();
		if (countRoles === 0) {
			const permissionsSuperAdministrator = await Permission.find();
			const permissionsAdministrator = await Permission.find({ controller: 'user' });
			const permissionsModerator = await Permission.find({ controller: 'user', action: { $ne: 'delete' } });
			await Role.create(
				{
					name: 'Super Administrator',
					permissions: permissionsSuperAdministrator
				},
				{
					name: 'Administrator',
					permissions: permissionsAdministrator
				},
				{
					name: 'Moderator',
					permissions: permissionsModerator
				},
				{
					name: 'User',
					permissions: []
				}
			);
		}
		const countUsers = await User.estimatedDocumentCount();
		if (countUsers === 0) {
			const roleSuperAdministrator = await Role.findOne({ name: 'Super Administrator' });
			const roleAdministrator = await Role.findOne({ name: 'Administrator' });
			const roleModerator = await Role.findOne({ name: 'Moderator' });
			const roleUser = await Role.findOne({ name: 'User' });
			await User.create(
				{
					firstName: 'Thuc',
					lastName: 'Nguyen',
					userName: 'superadmin',
					email: 'admjnwapviip@gmail.com',
					password: 'superadmin',
					roles: [roleSuperAdministrator, roleAdministrator, roleModerator, roleUser]
				},
				{
					firstName: 'Vy',
					lastName: 'Nguyen',
					userName: 'admin',
					email: 'admin@example.com',
					password: 'admin',
					roles: [roleAdministrator]
				},
				{
					firstName: 'Thuyen',
					lastName: 'Nguyen',
					userName: 'moderator',
					email: 'moderator@example.com',
					password: 'moderator',
					roles: [roleModerator]
				},
				{
					firstName: 'Uyen',
					lastName: 'Nguyen',
					userName: 'user',
					email: 'user@example.com',
					password: 'user',
					roles: [roleUser]
				}
			);
		}
	} catch (err) {
		logger.error(err);
	}
}

mongoose
	.connect(config.DATABASE_URI, config.DATABASE_OPTIONS)
	.then(() => {
		initial();
		logger.info('🚀 Connected to MongoDB end!');
		server = app.listen(config.PORT, config.HOST, () => {
			logger.info(`🚀 Host: http://${config.HOST}:${config.PORT}`);
			logger.info('██████╗░░░██╗██╗███████╗');
			logger.info('██╔══██╗░██╔╝██║╚════██║');
			logger.info('██║░░██║██╔╝░██║░░███╔═╝');
			logger.info('██║░░██║███████║██╔══╝░░');
			logger.info('██████╔╝╚════██║███████╗');
			logger.info('╚═════╝░░░░░░╚═╝╚══════╝');
		});
	})
	.catch((err) => {
		logger.error(`MongoDB connection error: ${err}`);
	});

const exitHandler = () => {
	if (server) {
		server.close(() => {
			logger.warn('Server closed');
			process.exit(1);
		});
	} else {
		process.exit(1);
	}
};

const unexpectedErrorHandler = (err) => {
	logger.error(err);
	exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
	logger.info('SIGTERM received');
	if (server) {
		server.close();
	}
});
