import { z } from "zod";
const AddressSchema = z.object({
    fullAddress: z.string().max(50),
    houseNumber: z.string().optional(),
    pincode: z.number().min(6).max(6),
    state: z.string(),
});

export const UserSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    age: z.number().min(0, { message: "Age must be positive" }).max(120, { message: "Age must be less than 120" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 8-15 characters" }).max(15),
    address: z.array(AddressSchema).optional(),
});

