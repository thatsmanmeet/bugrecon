import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
  linkName: {
    type: String,
    required: false,
  },
  linkUrl: {
    type: String,
    required: [true, 'URL is required.'],
    match: [/^https?:\/\/\S+$/, 'Please enter a valid URL.'],
  },
});

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    links: [linkSchema],
    icon: {
      type: String,
      default: 'projects/default.png',
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

export const Project = mongoose.model('Project', projectSchema);
