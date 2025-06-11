import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    invitedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Accepted', 'Declined'],
      },
      default: 'Pending',
    },
  },
  { timestamps: true }
);

export const Invite = mongoose.model('Invite', inviteSchema);
