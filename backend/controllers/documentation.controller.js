import { Documentation } from '../models/documentation.model.js';
import { Project } from '../models/project.model.js';
import { APIError } from '../utils/APIError.js';
import { APIResponse } from '../utils/APIResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import validator from 'validator';
import slug from 'slug';

// get documentation by project

const getDocumentationByProject = asyncHandler(async (req, res) => {
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

  const documentation = await Documentation.find({
    project: req.params.id,
  }).populate('author', 'name username');
  return res
    .status(200)
    .json(new APIResponse(200, 'Documentation Fetched', documentation));
});

const getDocumentationBySlugName = asyncHandler(async (req, res) => {
  if (!validator.isSlug(req.params.slug)) {
    throw new APIError(400, 'Invalid Slug Found!');
  }
  const currentDocument = await Documentation.findOne({
    slug: req.params.slug,
    project: req.params.id,
  }).populate('author', 'name username');

  if (!currentDocument) {
    throw new APIError(404, 'Documentation not found');
  }

  const currentProject = await Project.findById(currentDocument.project);

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
    .json(new APIResponse(200, 'Documentation Fetched', currentDocument));
});

const createDocumentation = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, 'Invalid Project ID');
  }

  const { title, content } = req.body;

  if (!title || !content) {
    throw new APIError(400, 'title and content is required');
  }

  const currentSlug = slug(title);

  // find if a documentation already exists with same slug within same project or not

  const documentationWithSlug = await Documentation.findOne({
    slug: currentSlug,
    project: req.params.id,
  });

  if (documentationWithSlug) {
    throw new APIError(409, 'Slug already exists. Use different title');
  }

  // get current project for validation
  const currentProject = await Project.findById(req.params.id);

  if (!currentProject) {
    throw new APIError(404, 'Project not found');
  }

  const isAdminOfProject = currentProject.admins.some(
    (userId) => userId.toString() === req.user._id.toString()
  );

  const isMemberOfProject = currentProject.admins.some(
    (userId) => userId.toString() === req.user._id.toString()
  );

  if (!isMemberOfProject && !isAdminOfProject) {
    throw new APIError(
      403,
      'Unauthorized. Only admins and members can create documentation'
    );
  }

  // create new documentation
  const newDocumentation = await Documentation.create({
    title: title,
    content: content,
    slug: currentSlug,
    author: req.user._id,
    project: currentProject._id,
  });

  if (!newDocumentation) {
    throw new APIError(500, "Something wen't wrong creating new documentation");
  }

  return res
    .status(201)
    .json(new APIResponse(201, 'Documentation created', newDocumentation));
});

const updateDocumentation = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, 'Invalid Project ID');
  }

  if (!validator.isSlug(req.params.slug)) {
    throw new APIError(400, 'Invalid Slug Found');
  }

  const { title, content } = req.body;

  if (!title && !content) {
    return res.status(200).json(new APIResponse(200, 'Nothing to update'));
  }

  // find if a documentation already exists with same slug within same project or not
  const documentationWithSlug = await Documentation.findOne({
    slug: req.params.slug,
    project: req.params.id,
  });

  if (!documentationWithSlug) {
    throw new APIError(404, 'Documentation not found.');
  }

  // get current project for validation
  const currentProject = await Project.findById(req.params.id);

  if (!currentProject) {
    throw new APIError(404, 'Project not found');
  }

  const isAdminOfProject = currentProject.admins.some(
    (userId) => userId.toString() === req.user._id.toString()
  );

  const isCreatorOfDocumentation =
    documentationWithSlug.author._id.toString() === req.user._id.toString();

  if (!isCreatorOfDocumentation && !isAdminOfProject) {
    throw new APIError(
      403,
      'Unauthorized. Only admins and members can create documentation'
    );
  }

  documentationWithSlug.title = title || documentationWithSlug.title;
  documentationWithSlug.content = content || documentationWithSlug.content;
  if (title) {
    documentationWithSlug.slug = slug(title);
  }

  const updatedDocumentation = await documentationWithSlug.save();

  res
    .status(200)
    .json(new APIResponse(200, 'Documentation updated', updatedDocumentation));
});

const deleteDocumentation = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, 'Invalid Project ID');
  }

  if (!validator.isSlug(req.params.slug)) {
    throw new APIError(400, 'Invalid slug id');
  }

  const documentationWithSlug = await Documentation.findOne({
    slug: req.params.slug,
    project: req.params.id,
  });

  if (!documentationWithSlug) {
    throw new APIError(404, 'Documentation not found.');
  }

  // get current project for validation
  const currentProject = await Project.findById(req.params.id);

  if (!currentProject) {
    throw new APIError(404, 'Project not found');
  }

  const isAdminOfProject = currentProject.admins.some(
    (userId) => userId.toString() === req.user._id.toString()
  );

  const isCreatorOfDocumentation =
    documentationWithSlug.author._id.toString() === req.user._id.toString();

  if (!isCreatorOfDocumentation && !isAdminOfProject) {
    throw new APIError(
      403,
      'Unauthorized. Only admins and members can create documentation'
    );
  }

  const deletedCurrentDocumentation = await documentationWithSlug.deleteOne();

  if (!deletedCurrentDocumentation.acknowledged) {
    throw new APIError(500, 'Something went wrong deleting documentation');
  }

  return res.status(200).json(new APIResponse(200, 'Documentation Deleted'));
});

export {
  getDocumentationByProject,
  getDocumentationBySlugName,
  createDocumentation,
  updateDocumentation,
  deleteDocumentation,
};
