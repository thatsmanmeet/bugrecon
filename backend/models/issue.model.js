import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'Closed', 'Resolved', 'In-Progress'],
      },
      default: 'Open',
    },
    severity: {
      type: String,
      enum: {
        values: ['Critical', 'High', 'Low', 'Medium'],
      },
      default: 'Low',
    },
    tags: {
      type: [String],
      enum: {
        values: ['Backlog', 'Bug', 'Feature', 'Blocked'],
      },
      required: false,
      default: [],
    },
    numComments: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Issues = mongoose.model('Issue', issueSchema);
