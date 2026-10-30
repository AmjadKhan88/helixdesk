import mongoose, { Schema, Types, type Model } from "mongoose";

export interface IUpload {
  key: string;
  name: string;
  size: number;
  mimeType: string;
  uploader: Types.ObjectId;
  status: "pending" | "ready";
  message: Types.ObjectId | null; // set once a message uses it
  createdAt: Date;
}

const uploadSchema = new Schema<IUpload>(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    uploader: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: { type: String, enum: ["pending", "ready"], default: "pending" },
    message: { type: Schema.Types.ObjectId, ref: "Message", default: null },
  },
  { timestamps: true },
);

uploadSchema.index({ message: 1, createdAt: 1 }); // for the cleanup script

export const Upload =
  (mongoose.models.Upload as Model<IUpload>) ||
  mongoose.model<IUpload>("Upload", uploadSchema);
