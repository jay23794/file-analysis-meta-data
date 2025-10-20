import { model, Schema } from "mongoose";
import type { IAddress, ISaveUser, IUser } from "../types/user.type.js";



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
  },
  { timestamps: true }
);



export const User = model<IUser>("User", userSchema);
export const SaveUser = model<ISaveUser>("UserDetails", saveUserSchema);
