import mongoose from 'mongoose';
import paginate from './plugins/paginatePlugin';
import bcrypt from 'bcryptjs';
import toJSON from './plugins/toJSONPlugin';

const userSchema = mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true
		},
		lastName: {
			type: String,
			required: true
		},
		userName: {
			type: String,
			unique: true,
			required: true
		},
		email: {
			type: String,
			unique: true,
			required: true
		},
		password: {
			type: String,
			required: true,
			private: true
		},
		avatar: {
			type: String,
			default: 'avatar.png'
		},
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user'
		}
	},
	{
		timestamps: true
	}
);

userSchema.plugin(toJSON);
userSchema.plugin(paginate);

userSchema.statics.isUserNameAlreadyExists = async function (userName, excludeUserId) {
	return !!(await this.findOne({ userName, _id: { $ne: excludeUserId } }));
};

userSchema.statics.isEmailAlreadyExists = async function (email, excludeUserId) {
	return !!(await this.findOne({ email, _id: { $ne: excludeUserId } }));
};

userSchema.methods.isPasswordMatch = async function (password) {
	return bcrypt.compareSync(password, this.password);
};

userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		const passwordGenSalt = bcrypt.genSaltSync(10);
		this.password = bcrypt.hashSync(this.password, passwordGenSalt);
	}
	next();
});

export default mongoose.model('users', userSchema);
