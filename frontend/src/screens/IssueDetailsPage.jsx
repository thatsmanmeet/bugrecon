import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  useGetIssueByIdQuery,
  useUpdateIssueMutation,
  useDeleteIssueMutation,
} from '@/slices/remote/issueApiSlice';
import {
  useCreateCommentMutation,
  useGetCommentsForIssueQuery,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
} from '@/slices/remote/commentApiSlice';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { FaTrash, FaEdit } from 'react-icons/fa';
import Select from 'react-select';
import { ClipLoader } from 'react-spinners';
import { useSelector } from 'react-redux';

const STATUS_COLORS = {
  Open: 'bg-green-100 text-green-800',
  'In-Progress': 'bg-yellow-100 text-yellow-800',
  Resolved: 'bg-blue-100 text-blue-800',
  Closed: 'bg-red-100 text-red-800',
};
const SEVERITY_COLORS = {
  Critical: 'bg-red-200 text-red-900',
  High: 'bg-orange-200 text-orange-900',
  Medium: 'bg-yellow-200 text-yellow-900',
  Low: 'bg-gray-200 text-gray-900',
};
const TAG_COLORS = {
  Backlog: 'bg-indigo-100 text-indigo-800',
  Bug: 'bg-red-100 text-red-800',
  Feature: 'bg-green-100 text-green-800',
  Blocked: 'bg-gray-100 text-gray-800',
};

const TAG_OPTIONS = Object.keys(TAG_COLORS).map((tag) => ({
  value: tag,
  label: tag,
}));

const IssueDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userInfo } = useSelector((store) => store.auth);
  const {
    data: issueResponse,
    isLoading,
    error,
    refetch,
  } = useGetIssueByIdQuery(id);
  const {
    data: commentsResponse,
    isLoading: loadingComments,
    refetch: refetchComments,
  } = useGetCommentsForIssueQuery(id);

  const [updateIssue] = useUpdateIssueMutation();
  const [deleteIssue] = useDeleteIssueMutation();
  const [addComment, { isLoading: isCommenting }] = useCreateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [updateComment] = useUpdateCommentMutation();

  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  const handleUpdateField = async (field, value) => {
    try {
      await updateIssue({ id, data: { [field]: value } });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update issue');
    }
  };

  const handleDeleteIssue = async () => {
    try {
      const res = await deleteIssue(id).unwrap();
      toast.success(res.message);
      navigate(-1);
    } catch (err) {
      toast.error(err.data.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await deleteComment(commentId).unwrap();
      toast.success(res.message);
      refetchComments();
    } catch (err) {
      toast.error(err.data.message);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setCommentError('Comment cannot be empty.');
      return;
    }
    setCommentError('');
    try {
      const res = await addComment({
        issueId: id,
        data: { text: newComment },
      }).unwrap();
      toast.success(res.message);
      setNewComment('');
      refetchComments();
    } catch (err) {
      toast.error(err.data.message);
    }
  };

  const issue = issueResponse?.data;
  const comments = commentsResponse?.data || [];
  const isClosed = issue?.status === 'Closed' || issue?.status === 'Resolved';

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <ClipLoader size={36} />
      </div>
    );
  }
  if (error) {
    return (
      <div className='text-center text-red-500 mt-10'>
        Failed to load issue details
      </div>
    );
  }

  const uniqueUsersMap = new Map();

  [...issue.project.admins, ...issue.project.members].forEach((user) => {
    if (!uniqueUsersMap.has(user._id)) {
      uniqueUsersMap.set(user._id, user);
    }
  });

  return (
    <div className='min-h-screen bg-white px-6 py-8'>
      <div className='max-w-6xl mx-auto p-6 space-y-8'>
        {/* Header */}
        <div>
          <p className='text-sm text-gray-500'>
            {issue.project?.name || 'Untitled Project'}
          </p>
          <h1 className='text-3xl font-bold text-gray-900'>{issue.title}</h1>
          <p className='text-sm text-gray-500 mt-1'>
            Created by {issue.createdBy?.name || 'Unknown'} on{' '}
            {dayjs(issue.createdAt).format('MMM D, YYYY')}
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Sidebar */}
          <aside className='space-y-6'>
            {/* Severity */}
            <section>
              <h4 className='text-xs text-gray-500 uppercase'>Severity</h4>
              <select
                value={issue.severity}
                onChange={(e) => handleUpdateField('severity', e.target.value)}
                className='w-full mt-1 border px-3 py-2 rounded text-sm'
              >
                {Object.keys(SEVERITY_COLORS).map((sev) => (
                  <option key={sev}>{sev}</option>
                ))}
              </select>
            </section>

            {/* Status */}
            <section>
              <h4 className='text-xs text-gray-500 uppercase'>Status</h4>
              <select
                value={issue.status}
                onChange={(e) => handleUpdateField('status', e.target.value)}
                className='w-full mt-1 border px-3 py-2 rounded text-sm'
              >
                {Object.keys(STATUS_COLORS).map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </section>
            {/* Tags */}
            <section>
              <h4 className='text-xs text-gray-500 uppercase'>Tags</h4>
              <Select
                isMulti
                options={TAG_OPTIONS}
                value={issue.tags?.map((tag) => ({ label: tag, value: tag }))}
                onChange={(selected) =>
                  handleUpdateField(
                    'tags',
                    selected.map((s) => s.value)
                  )
                }
              />
            </section>

            {/* Last Updated */}
            <section>
              <h4 className='text-xs text-gray-500 uppercase'>Last Updated</h4>
              <p className='text-sm'>
                {dayjs(issue.updatedAt).format('MMM D, YYYY')}
              </p>
            </section>

            {/* Last Updated */}
            <section>
              <h4 className='text-xs text-gray-500 uppercase'>Created By</h4>
              <p className='text-sm'>{issue.createdBy.username}</p>
            </section>

            {/* Delete Button */}

            {issue.createdBy._id === userInfo._id && (
              <section>
                <button
                  onClick={handleDeleteIssue}
                  className='text-red-600 hover:text-red-800 text-sm border border-red-300 px-4 py-2 rounded-md w-full text-center'
                >
                  <FaTrash className='inline mr-2' /> Delete Issue
                </button>
              </section>
            )}
          </aside>

          {/* Main Content */}
          <main className='md:col-span-2 space-y-8'>
            <div className='text-sm text-gray-800 whitespace-pre-line'>
              {issue.content}
            </div>

            {/* Comments */}
            <section>
              <div className='flex justify-between items-center mb-2'>
                <h4 className='text-xs text-gray-500 uppercase'>Comments</h4>
                <button
                  onClick={refetchComments}
                  className='text-blue-500 hover:underline text-sm'
                >
                  Refresh
                </button>
              </div>

              {loadingComments ? (
                <ClipLoader size={20} />
              ) : comments.length === 0 ? (
                <p className='text-sm text-gray-500'>No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className='bg-gray-100 border border-gray-200 rounded-md p-4 relative mb-2'
                  >
                    {editingCommentId === comment._id ? (
                      <>
                        <textarea
                          className='w-full border px-2 py-1 rounded text-sm mt-2'
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                        />
                        <div className='mt-2 flex gap-2'>
                          <button
                            className='text-green-600 hover:text-green-800 text-sm'
                            onClick={async () => {
                              await updateComment({
                                id: comment._id,
                                data: { text: editCommentText },
                              });
                              setEditingCommentId(null);
                              refetchComments();
                            }}
                          >
                            Save
                          </button>
                          <button
                            className='text-gray-500 hover:text-gray-700 text-sm'
                            onClick={() => setEditingCommentId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className='text-sm text-gray-800 mt-2'>
                          {comment.text}
                        </p>
                        <p className='text-xs text-gray-500 mt-2'>
                          By {comment.author?.name || 'Unknown'} on{' '}
                          {dayjs(comment.createdAt).format(
                            'MMM D, YYYY h:mm A'
                          )}
                        </p>
                        {comment.author._id === userInfo._id && (
                          <div className='absolute top-2 right-2 flex gap-2'>
                            <button
                              className='text-blue-500 hover:text-blue-700'
                              title='Edit Comment'
                              onClick={() => {
                                setEditingCommentId(comment._id);
                                setEditCommentText(comment.text);
                              }}
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              className='text-red-500 hover:text-red-700'
                              onClick={() => handleDeleteComment(comment._id)}
                              title='Delete Comment'
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}

              {!isClosed && (
                <div className='mt-6 space-y-2'>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder='Add a comment...'
                    className='w-full border px-4 py-2 text-sm rounded-md'
                    rows={3}
                  />
                  {commentError && (
                    <p className='text-red-500 text-xs'>{commentError}</p>
                  )}
                  <button
                    onClick={handleAddComment}
                    disabled={isCommenting}
                    className='bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded disabled:opacity-50'
                  >
                    {isCommenting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailPage;
