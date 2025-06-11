import { Comment } from '../models/comment.model.js';
import { Issues } from '../models/issue.model.js';
import { Project } from '../models/project.model.js';
import { APIError } from '../utils/APIError.js';
import { APIResponse } from '../utils/APIResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import validator from 'validator';

const getMyIssues = asyncHandler(async (req, res) => {
  const myIssues = await Issues.find({
    $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }],
  }).populate('createdBy', 'name username');
  return res.status(200).json(new APIResponse(200, 'Issues Fetched', myIssues));
});

const getProjectIssues = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, 'Invalid Project ID');
  }

  const currentProject = await Project.findById(req.params.id);

  if (!currentProject) {
    throw new APIError(404, 'Project not found');
  }

  const isAdminOrProjectMember =
    currentProject.admins.some(
      (userId) => userId.toString() === req.user._id.toString()
    ) ||
    currentProject.members.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

  if (!isAdminOrProjectMember) {
    throw new APIError(
      403,
      'Unauthorized. Only admins & Members can view issues.'
    );
  }

  const projectIssues = await Issues.find({
    project: req.params.id,
  }).populate('createdBy', 'name username');

  return res
    .status(200)
    .json(new APIResponse(200, 'Issues Fetched', projectIssues));
});

const getIssueById = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, 'Invalid Issue ID');
  }

  const currentIssue = await Issues.findById(req.params.id)
    .populate({
      path: 'project',
      select: 'name admins members',
      populate: [
        {
          path: 'admins',
          select: 'name username',
        },
        {
          path: 'members',
          select: 'name username',
        },
      ],
    })
    .populate('createdBy', 'name username avatar');
  if (!currentIssue) {
    throw new APIError(404, 'Issue not found');
  }

  const currentProject = await Project.findById(currentIssue.project._id);

  if (!currentProject) {
    throw new APIError(404, 'Project not found');
  }

  const isAdminOrProjectMember =
    currentProject.admins.some(
      (userId) => userId.toString() === req.user._id.toString()
    ) ||
    currentProject.members.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

  if (!isAdminOrProjectMember) {
    throw new APIError(
      403,
      'Unauthorized. Only admins & Members can view issues.'
    );
  }

  return res
    .status(200)
    .json(new APIResponse(200, 'Issue Fetched', currentIssue));
});

const createIssue = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, 'Invalid Project ID');
  }

  const {
    title,
    content,
    status = 'Open',
    severity = 'Low',
    tags = [],
  } = req.body;

  if (!title || !content) {
    throw new APIError(400, 'title and content is required');
  }

  const currentProject = await Project.findById(req.params.id);

  if (!currentProject) {
    throw new APIError(404, 'Project not found');
  }

  const isMemberOfProject = currentProject.members.some(
    (userId) => userId.toString() === req.user._id.toString()
  );
  const isAdminOfProject = currentProject.admins.some(
    (userId) => userId.toString() === req.user._id.toString()
  );

  if (!isMemberOfProject && !isAdminOfProject) {
    throw new APIError(
      403,
      'Unauthorized. Only members and admins can create issue on this project'
    );
  }

  const validStatuses = ['Open', 'Closed', 'Resolved', 'In-Progress'];
  const validSeverities = ['Critical', 'High', 'Low', 'Medium'];
  const validTags = ['Backlog', 'Bug', 'Feature', 'Blocked'];

  if (!validStatuses.includes(status)) {
    throw new APIError(
      400,
      `"status" must be one of ${validStatuses.join(', ')}`
    );
  }
  if (!validSeverities.includes(severity)) {
    throw new APIError(
      400,
      `"severity" must be one of ${validSeverities.join(', ')}`
    );
  }
  if (!Array.isArray(tags) || !tags.every((t) => validTags.includes(t))) {
    throw new APIError(
      400,
      `"tags" must be an array containing only ${validTags.join(', ')}`
    );
  }

  // now create this issue
  const newIssue = await Issues.create({
    title,
    content,
    status,
    tags,
    severity,
    project: currentProject._id,
    createdBy: req.user._id,
  });

  if (!newIssue) {
    throw new APIError(500, 'Something went wrong creating an issue');
  }

  return res.status(201).json(new APIResponse(201, 'Issue created', newIssue));
});

const updateIssue = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, 'Invalid Issue ID');
  }

  const { title, content, status, severity, tags, assignedTo } = req.body;

  if (
    title === undefined &&
    content === undefined &&
    status === undefined &&
    severity === undefined &&
    tags === undefined
  ) {
    return res.status(200).json(new APIResponse(200, 'Nothing to update'));
  }

  const myIssue = await Issues.findById(req.params.id);

  if (!myIssue) {
    throw new APIError(404, 'Issue not found');
  }

  // fetch the project to perform validations
  const currentProject = await Project.findById(myIssue.project);

  if (!currentProject) {
    throw new APIError(404, 'Project not found');
  }

  const isMemberOfProject = currentProject.members.some(
    (userId) => userId.toString() === req.user._id.toString()
  );
  const isAdminOfProject = currentProject.admins.some(
    (userId) => userId.toString() === req.user._id.toString()
  );

  if (!isMemberOfProject && !isAdminOfProject) {
    throw new APIError(
      403,
      'Unauthorized. Only members and admins can edit issue on this project'
    );
  }

  // Now we can validate inputs and update our issue

  myIssue.title = title || myIssue.title;
  myIssue.content = content || myIssue.content;

  if (status !== undefined) {
    const validStatuses = ['Open', 'Closed', 'Resolved', 'In-Progress'];
    if (!validStatuses.includes(status)) {
      throw new APIError(
        400,
        `"status" must be one of ${validStatuses.join(', ')}`
      );
    }
    myIssue.status = status;
  }

  if (severity !== undefined) {
    const validSeverities = ['Critical', 'High', 'Low', 'Medium'];
    if (!validSeverities.includes(severity)) {
      throw new APIError(
        400,
        `"severity" must be one of ${validSeverities.join(', ')}`
      );
    }
    myIssue.severity = severity;
  }

  if (tags !== undefined) {
    const validTags = ['Backlog', 'Bug', 'Feature', 'Blocked'];
    if (!Array.isArray(tags) || !tags.every((t) => validTags.includes(t))) {
      throw new APIError(
        400,
        `"tags" must be an array containing only ${validTags.join(', ')}`
      );
    }
    myIssue.tags = tags;
  }

  // Save the changes
  const updatedIssue = await myIssue.save();
  return res
    .status(200)
    .json(new APIResponse(200, 'Issue updated', updatedIssue));
});

const deleteIssue = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, 'Invalid Issue ID');
  }

  // Fetch the existing issue
  const currentIssue = await Issues.findById(req.params.id);
  if (!currentIssue) {
    throw new APIError(404, 'Issue not found');
  }

  // Fetch the project to check authorization
  const currentProject = await Project.findById(currentIssue.project);
  if (!currentProject) {
    throw new APIError(404, 'Associated project not found');
  }

  const isCreator =
    currentIssue.createdBy._id.toString() === req.user._id.toString();
  const isAdminOfProject = currentProject.admins.some(
    (userId) => userId.toString() === req.user._id.toString()
  );

  if (!isCreator && !isAdminOfProject) {
    throw new APIError(
      403,
      'Unauthorized. Only admins or Creator of this issue can delete an issue.'
    );
  }

  // remove all comments associated with this isse

  const deletedComments = await Comment.deleteMany({ issue: currentIssue._id });

  if (!deletedComments.acknowledged) {
    throw new APIError(500, 'Something went wrong deleting Issue');
  }

  // Remove the issue
  const deletdCurrentIssue = await currentIssue.deleteOne();

  if (!deletdCurrentIssue.acknowledged) {
    throw new APIError(500, 'Something went wrong deleting Issue');
  }

  return res.status(200).json(new APIResponse(200, 'Issue deleted'));
});

export {
  getIssueById,
  getMyIssues,
  createIssue,
  updateIssue,
  deleteIssue,
  getProjectIssues,
};
