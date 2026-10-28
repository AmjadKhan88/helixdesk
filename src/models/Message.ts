import mongoose, { Schema, Types, type Model } from "mongoose";

export interface IAttachment {
  name: string;
  url: string;
  size: number;      // bytes
  mimeType: string;
}

export interface IMessage {
  ticket: Types.ObjectId;
  author: Types.ObjectId;
  body: string;
  isInternal: boolean;
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
  },
  { _id: false }
);

const messageSchema = new Schema<IMessage>(
  {
    ticket: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, maxlength: 10000 },
    isInternal: { type: Boolean, default: false },
    attachments: { type: [attachmentSchema], default: [] },
  },
  { timestamps: true }
);

messageSchema.index({ ticket: 1, createdAt: 1 });

export const Message =
  (mongoose.models.Message as Model<IMessage>) ||
  mongoose.model<IMessage>("Message", messageSchema);