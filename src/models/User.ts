import mongoose, { Schema, type Model } from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, type Role } from "@/lib/constants";

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: ROLES, default: "customer" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password ?? "");
};

export const User =
  (mongoose.models.User as UserModel) ||
  mongoose.model<IUser, UserModel>("User", userSchema);