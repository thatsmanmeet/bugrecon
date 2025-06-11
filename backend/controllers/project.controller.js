import { Invite } from '../models/invite.model.js';
import { Issues } from '../models/issue.model.js';
import { Project } from '../models/project.model.js';
import { User } from '../models/user.model.js';
import { APIError } from '../utils/APIError.js';
import { APIResponse } from '../utils/APIResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import validator from 'validator';

const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [{ admins: req.user._id }, { members: req.user._id }],
  })
    .populate('admins', 'name username')
    .populate('members', 'name username');

  return res
    .status(200)
    .json(new APIResponse(200, 'Projects Fetched', projects));
});
const getProjectById = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, 'Invalid Project ID');
  }

  const project = await Project.findById(req.params.id)
    .populate('admins', 'name username')
    .populate('members', 'name username');

  const isUserAdmin = project.admins.some(
    (users) => users._id.toString() === req.user._id.toString()
  );
  const isUserMember = project.members.some(
    (users) => users._id.toString() === req.user._id.toString()
  );

  if (!isUserAdmin && !isUserMember) {
    throw new APIError(403, 'You are not a member of this project');
  }

  return res.status(200).json(new APIResponse(200, 'Project Fetched', project));
});
const createProject = asyncHandler(async (req, res) => {
  const { name, description, icon, links } = req.body;

  if (!name || !description) {
    throw new APIError(400, 'Name and Description are required');
  }

  const project = await Project.create({
    name,
    description,
    icon: icon || 'uploads/projects/default.png',
    links: links || [],
    admins: [req.user._id],
    members: [],
  });

  if (!project) {
    throw new APIError(500, 'Something went wrong creating project');
  }

  return res
    .status(201)
    .json(new APIResponse(201, 'Project created successfully', project));
});
const updateProjectDetails = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, 'Invalid project ID');
  }
  const { name, description, icon, links } = req.body;

  if (!name || !description) {
    throw new APIError(400, 'Name and Description are required');
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new APIError(404, 'Project not found');
  }

  const isAdmin = project.admins.some(
    (userId) => userId.toString() === req.user._id.toString()
  );

  if (!isAdmin) {
    throw new APIError(403, 'Only admins can update project');
  }

  project.name = name || project.name;
  project.description = description || project.description;
  project.links = links || project.links;
  project.icon = icon || project.icon;

  await project.save();

  return res
    .status(200)
    .json(new APIResponse(200, 'Project updated successfully', project));
});

const deleteProject = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, 'Invalid Project ID');
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new APIError(404, 'Project not found');
  }

  const isUserAdmin = project.admins.some(
    (userId) => userId.toString() === req.user._id.toString()
  );

  if (!isUserAdmin) {
    throw new APIError(403, 'Only admins can delete a project');
  }

  const deletedIssues = await Issues.deleteMany({ project: project._id });

  if (!deletedIssues.acknowledged) {
    throw new APIError(500, 'Something went wrong deleting projects');
  }

  await project.deleteOne();
  return res.status(200).json(new APIResponse(200, 'Project Deleted'));
});

// Let's move with invites now

const getReceivedInvites = asyncHandler(async (req, res) => {
  const receivedInvites = await Invite.find({
    invitedUser: req.user._id,
  })
    .populate('project', 'name')
    .populate('invitedBy', 'name username');
  return res
    .status(200)
    .json(
      new APIResponse(200, 'Fetched Received Invitations', receivedInvites)
    );
});

const getSentInvites = asyncHandler(async (req, res) => {
  const sentInvites = await Invite.find({
    invitedBy: req.user._id,
  })
    .populate('project', 'name')
    .populate('invitedUser', 'name username');
  return res
    .status(200)
    .json(new APIResponse(200, 'Fetched Sent Invitations', sentInvites));
});

const sendInvitation = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, 'Invalid Project ID');
  }

  const { username } = req.body;

  if (!username) {
    throw new APIError(401, 'username is required');
  }

  const user = await User.findOne({ username });

  if (!user) {
    throw new APIError(404, 'User not found');
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new APIError(404, 'Project not found');
  }

  const isAdmin = project.admins.some(
    (userId) => userId.toString() === req.user._id.toString()
  );

  if (!isAdmin) {
    throw new APIError(403, 'Only admins can send invitations');
  }

  // prevent sending invites to existing members

  if (project.members.includes(user._id) || project.admins.includes(user._id)) {
    throw new APIError(408, 'User os already a project member or admin');
  }

  // check for already sent invites.
  const existingInvite = await Invite.findOne({
    invitedBy: req.user._id,
    invitedUser: user._id,
    project: req.params.id,
    status: 'Pending',
  });

  if (existingInvite) {
    throw new APIError(409, 'Invitation already sent to user');
  }

  const newInvite = await Invite.create({
    invitedBy: req.user._id,
    invitedUser: user._id,
    project: req.params.id,
  });

  if (!newInvite) {
    throw new APIError(500, 'Something went wrong sending invite');
  }

  return res
    .status(201)
    .json(new APIResponse(201, 'Invitation sent to the user'));
});

const InvitationAction = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, 'Invalid Invitation ID');
  }

  const { action } = req.body;

  if (!action || !['Accepted', 'Declined'].includes(action)) {
    throw new APIError(400, 'Action Required. Accept or Decline');
  }

  const invitation = await Invite.findById(req.params.id);

  if (!invitation) {
    throw new APIError(404, 'Invitation not found');
  }

  if (invitation.invitedUser.toString() !== req.user._id.toString()) {
    throw new APIError(403, 'You are not authorized to perform this action');
  }

  if (invitation.status !== 'Pending') {
    throw new APIError(409, `Invitation already ${invitation.status}`);
  }

  if (action === 'Accepted') {
    const project = await Project.findById(invitation.project);
    if (!project.members.includes(invitation.invitedUser)) {
      project.members.push(invitation.invitedUser);
      await project.save();
    }
  }

  invitation.status = action;
  await invitation.save();

  return res
    .status(200)
    .json(
      new APIResponse(200, `Invitation ${action.toLowerCase()} successfully`)
    );
});

// admin routes

const removeMemberFromProject = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, 'Invalid Project ID');
  }

  const { memberId } = req.body;

  if (!memberId) {
    throw new APIError(400, 'Member ID required');
  }

  if (!validator.isMongoId(memberId)) {
    throw new APIError(400, 'Invalid Member ID');
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new APIError(404, 'Project not found or Invalid Project ID');
  }

  const isLoggedInUserAdmin = project.admins.some(
    (adminId) => adminId.toString() === req.user._id.toString()
  );

  if (!isLoggedInUserAdmin) {
    throw new APIError(
      403,
      'Unauthorized. Only admins can remove other members'
    );
  }

  const wasUserAdmin = project.admins.some(
    (id) => id.toString() === memberId.toString()
  );
  const wasUserMember = project.members.some(
    (id) => id.toString() === memberId.toString()
  );

  if (!wasUserAdmin && !wasUserMember) {
    throw new APIError(400, 'User is not in this project');
  }

  if (wasUserAdmin && project.admins.length === 1) {
    throw new APIError(400, 'Cannot remove the only admin from the project');
  }

  project.admins = project.admins.filter(
    (id) => id.toString() !== memberId.toString()
  );
  project.members = project.members.filter(
    (id) => id.toString() !== memberId.toString()
  );
  await project.save();

  // ? Since I remove a person from project, all their issues must be closed

  await Issues.updateMany(
    {
      project: project._id,
      $or: [{ createdBy: memberId, assignedTo: memberId }],
      status: { $in: ['Open', 'In-Progress'] },
    },
    { $set: { status: 'Closed' } }
  );

  return res
    .status(200)
    .json(new APIResponse(200, 'User removed from project'));
});

const promoteMemberToAdmin = asyncHandler(async (req, res) => {
  const { memberId } = req.body;

  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, 'Invalid Project ID');
  }

  if (!validator.isMongoId(memberId)) {
    throw new APIError(400, 'Invalid Member ID');
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new APIError(404, 'Project not found');
  }

  const isRequestingUserAdmin = project.admins.some(
    (adminId) => adminId.toString() === req.user._id.toString()
  );

  if (!isRequestingUserAdmin) {
    throw new APIError(403, 'Only admins can promote members');
  }

  const isAlreadyAdmin = project.admins.includes(memberId);
  const isMember = project.members.includes(memberId);

  if (isAlreadyAdmin) {
    throw new APIError(400, 'User is already an admin');
  }

  if (!isMember) {
    throw new APIError(400, 'User is not a project member');
  }

  // Promote: Remove from members, add to admins
  project.members = project.members.filter(
    (id) => id.toString() !== memberId.toString()
  );
  project.admins.push(memberId);

  await project.save();

  return res.status(200).json(new APIResponse(200, 'Member promoted to admin'));
});

const demoteAdminToMember = asyncHandler(async (req, res) => {
  const { adminId } = req.body;

  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, 'Invalid Project ID');
  }

  if (!validator.isMongoId(adminId)) {
    throw new APIError(400, 'Invalid Admin ID');
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new APIError(404, 'Project not found');
  }

  const isRequestingUserAdmin = project.admins.some(
    (admin) => admin.toString() === req.user._id.toString()
  );

  if (!isRequestingUserAdmin) {
    throw new APIError(403, 'Only admins can demote another admin');
  }

  const isTargetAdmin = project.admins.includes(adminId);

  if (!isTargetAdmin) {
    throw new APIError(400, 'User is not an admin in this project');
  }

  if (project.admins.length === 1) {
    throw new APIError(400, 'Cannot demote the only admin of the project');
  }

  // Demote: Remove from admins, add to members
  project.admins = project.admins.filter(
    (id) => id.toString() !== adminId.toString()
  );

  if (!project.members.includes(adminId)) {
    project.members.push(adminId);
  }

  await project.save();

  return res.status(200).json(new APIResponse(200, 'Admin demoted to member'));
});

export {
  getProjectById,
  getProjects,
  createProject,
  updateProjectDetails,
  deleteProject,
  getReceivedInvites,
  getSentInvites,
  sendInvitation,
  InvitationAction,
  promoteMemberToAdmin,
  removeMemberFromProject,
  demoteAdminToMember,
};
