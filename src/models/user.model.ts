import { model, Schema } from "mongoose";
import type { IAddress, ISaveUser, IUser } from "../types/user.type.js";
import bcrypt from 'bcryptjs';

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
  },
  { timestamps: true }
);

const addressSchema = new Schema<IAddress>(
  {
    city: { type: String, required: true },
    fullAddress: { type: String, required: true },
    houseNumber: { type: String, required: true },
    pincode: { type: Number, required: true, minLength: 6 },
    state: { type: String, required: true },
  },
  { timestamps: true }
);

const saveUserSchema = new Schema<ISaveUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, validators: [/\S+@\S+\.\S+/, "Please enter a valid email address"] },
    age: { type: Number, required: true },
    password: { type: String, required: true, minLength: 6 },
    address: [addressSchema],
    refreshToken: { type: String, default: null },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken:{ type: String, default: null },
  },
  { timestamps: true }
);

saveUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (err) {
    next(err as Error);
  }
});

saveUserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};



export const User = model<IUser>("User", userSchema);
export const SaveUser = model<ISaveUser>("UserDetails", saveUserSchema);
