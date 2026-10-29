import mongoose, { Schema, type Model } from "mongoose";

interface ISettings {
  _id: string;
  firstResponseTargetMinutes: number;
}

const settingsSchema = new Schema<ISettings>(
  {
    _id: { type: String },
    firstResponseTargetMinutes: { type: Number, default: 240, min: 5 },
  },
  { timestamps: true },
);

export const Settings =
  (mongoose.models.Settings as Model<ISettings>) ||
  mongoose.model<ISettings>("Settings", settingsSchema);
