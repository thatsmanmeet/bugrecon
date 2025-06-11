import mongoose from 'mongoose';

const documentationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      index: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

export const Documentation = mongoose.model(
  'Documentation',
  documentationSchema
);
