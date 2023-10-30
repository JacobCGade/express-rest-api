import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "config";

export interface UserInput {
  email: string;
  name: string;
  password: string;
}

export interface UserDocument extends UserInput, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: String): Promise<Boolean>;
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: {type: String, required: true},
  password: { type: String, required: true },
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

// (err?: Error) => void is equal to HookNextFunction that is no longer exported from mongoose
userSchema.pre("save", async function (next: (err?: Error) => void) {
  let user = this as UserDocument;

  // If not modified, go to next middleware
  if (!user.isModified('password')) {
    return next();
  }

  // If modified, hash password (this should be the strongest hashing algorithm available)
  const salt = await bcrypt.genSalt(config.get<number>('saltWorkFactor'));
  const hash = await bcrypt.hashSync(user.password, salt);
  user.password = hash;

  return next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const user = this as UserDocument

  return bcrypt.compare(candidatePassword, user.password).catch((err) => false);
}

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;