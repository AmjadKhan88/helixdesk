import mongoose, { Schema, type Model } from "mongoose";

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

categorySchema.pre("validate", function () {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
});

export const Category =
  (mongoose.models.Category as Model<ICategory>) ||
  mongoose.model<ICategory>("Category", categorySchema);