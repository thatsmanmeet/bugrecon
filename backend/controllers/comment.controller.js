import { Comment } from "../models/comment.model.js";
import { Issues } from "../models/issue.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import validator from "validator";

const getCommentsForIssue = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, "Invalid Issue ID");
  }

  const query = { issue: req.params.id.toString() };

  const comments = await Comment.find(query).populate(
    "author",
    "name username",
  );

  return res
    .status(200)
    .json(new APIResponse(200, "Comments Fetched", comments));
});

const createComment = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, "Invalid Issue ID");
  }

  const { text } = req.body;

  if (!text) {
    throw new APIError(401, "Comment text is required");
  }

  const currentIssue = await Issues.findById(req.params.id);

  if (!currentIssue) {
    throw new APIError(404, "Issue not found");
  }

  if (currentIssue.status === "Closed") {
    throw new APIError(409, "Issue closed. Cannot add new comment");
  }
  if (currentIssue.status === "Resolved") {
    throw new APIError(409, "Issue Resolved. Cannot add new comment");
  }

  const newComment = await Comment.create({
    text: text.trim(),
    author: req.user._id,
    issue: currentIssue._id,
  });

  if (!newComment) {
    throw new APIError(500, "Something went wrong adding new comment");
  }

  await Issues.findByIdAndUpdate(currentIssue._id, {
    $inc: { numComments: 1 },
  });

  return res
    .status(201)
    .json(new APIResponse(201, "Comment added", newComment));
});

const updateComment = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, "Invalid Comment ID");
  }

  const { text } = req.body;

  if (!text) {
    throw new APIError(401, "Comment text is required");
  }

  const myComment = await Comment.findById(req.params.id);

  if (!myComment) {
    throw new APIError(404, "Comment not found");
  }

  // check for ownership
  if (myComment.author.toString() !== req.user._id.toString()) {
    throw new APIError(403, "Not authorized to update this comment");
  }

  myComment.text = text.trim() || myComment.text;
  await myComment.save();

  return res
    .status(200)
    .json(new APIResponse(200, "Comment Updated", myComment));
});

const deleteComment = asyncHandler(async (req, res) => {
  if (!validator.isMongoId(req.params.id)) {
    throw new APIError(400, "Invalid Comment ID");
  }

  const myComment = await Comment.findById(req.params.id);

  if (!myComment) {
    throw new APIError(404, "Comment not found");
  }

  // check for ownership
  if (myComment.author.toString() !== req.user._id.toString()) {
    throw new APIError(403, "Not authorized to update this comment");
  }

  await myComment.deleteOne();

  // decrement the num count

  await Issues.findByIdAndUpdate(myComment.issue, {
    $inc: { numComments: -1 },
  });

  return res.status(200).json(new APIResponse(200, "Comment deleted"));
});

export { getCommentsForIssue, createComment, updateComment, deleteComment };
