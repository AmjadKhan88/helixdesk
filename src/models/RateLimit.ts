import mongoose, { Schema, type Model } from "mongoose";

interface IRateLimit {
  _id: string;
  count: number;
  expiresAt: Date;
}

const schema = new Schema<IRateLimit>({
  _id: { type: String },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB deletes expired counters itself

export const RateLimit =
  (mongoose.models.RateLimit as Model<IRateLimit>) ||
  mongoose.model<IRateLimit>("RateLimit", schema);
