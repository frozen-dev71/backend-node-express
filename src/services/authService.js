import * as userService from './userService';
import * as tokenService from './tokenService';
import httpStatus from 'http-status';
import APIError from '~/utils/apiError';
import RefreshToken from '~/models/refreshToken';
import User from '~/models/user';
import Role from '~/models/role';
import VerifyEmail from '~/models/verifyEmail';

export const signinWithUserNameAndPassword = async (userName, password) => {
	const user = await userService.getUserByUserName(userName);
	if (!user || !(await user.isPasswordMatch(password))) {
		throw new APIError('Incorrect user name or password', 400, true);
	}
	return user;
};

export const signup = async (body) => {
	if (await User.isUserNameAlreadyExists(body.userName)) {
		throw new APIError('User name already exists', 400, true);
	}
	if (await User.isEmailAlreadyExists(body.email)) {
		throw new APIError('Email already exists', 400, true);
	}
	const role = await Role.findOne({ name: 'User' });
	if (role) {
		body.roles = role.id;
	}
	return User.create(body);
};

export const logout = async (refreshToken) => {
	const refreshTokenDoc = await RefreshToken.findOne({ token: refreshToken, blacklisted: false });
	if (!refreshTokenDoc) {
		throw new APIError('Token not found', 400, true);
	}
	await refreshTokenDoc.remove();
};

export const refreshTokens = async (refreshToken) => {
	const refreshTokenDoc = await tokenService.verifyRefreshToken(refreshToken);
	const user = await userService.getUserById(refreshTokenDoc.user);
	if (!user) {
		throw new APIError(httpStatus[401], 401, true);
	}
	await refreshTokenDoc.remove();
	return tokenService.generateAuthTokens(user);
};

export const verifyEmail = async (verifyEmailToken) => {
	try {
		const verifyEmailTokenDoc = await tokenService.verifyEmailToken(verifyEmailToken);
		const user = await userService.getUserById(verifyEmailTokenDoc.user);
		if (!user) {
			throw new Error();
		}
		await VerifyEmail.deleteMany({ user: user.id });
		await userService.updateUserById(user.id, { confirmed: true });
	} catch (err) {
		throw new APIError('Email verification failed', 401, true);
	}
};
