import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { JWT_ACCESS_TOKEN_SECRET } from './env';
import passport from 'passport';
import * as userService from '~/services/userService';

passport.use(
	new JwtStrategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: JWT_ACCESS_TOKEN_SECRET
		},
		async (jwtPayload, done) => {
			try {
				const user = await userService.getUserById(jwtPayload.sub);
				if (!user) {
					return done(null, false);
				}
				return done(null, user);
			} catch (err) {
				return done(err, false);
			}
		}
	)
);

export default passport;
