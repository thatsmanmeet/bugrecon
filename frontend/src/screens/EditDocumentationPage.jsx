import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  useGetDocumentationBySlugQuery,
  useUpdateDocumentationMutation,
  useDeleteDocumentationMutation,
} from '@/slices/remote/documentationApiSlice';
import { ClipLoader } from 'react-spinners';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import toast from 'react-hot-toast';

const EditDocumentationPage = () => {
  const { id: projectId, slug } = useParams();
  const navigate = useNavigate();

  const {
    data: documentationResponse,
    isLoading: isFetching,
    error: fetchError,
  } = useGetDocumentationBySlugQuery({ projectId, slug });

  const [updateDocumentation, { isLoading: isUpdating }] =
    useUpdateDocumentationMutation();
  const [deleteDocumentation, { isLoading: isDeleting }] =
    useDeleteDocumentationMutation();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const documentation = documentationResponse?.data;

  // Initialize form data when documentation loads
  useEffect(() => {
    if (documentation) {
      setFormData({
        title: documentation.title || '',
        content: documentation.content || '',
      });
    }
  }, [documentation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      const res = await updateDocumentation({
        projectId,
        slug,
        data: formData,
      }).unwrap();
      toast.success(res.message);
      navigate(`/project/${projectId}/documentation`);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update documentation');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteDocumentation({
        projectId,
        slug,
      }).unwrap();
      toast.success(res.message);
      navigate(`/project/${projectId}/documentation`);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to delete documentation');
      setShowDeleteConfirm(false);
    }
  };

  const handleCancel = () => {
    navigate(`/project/${projectId}/documentation/${slug}`);
  };

  if (isFetching) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <ClipLoader size={48} />
      </div>
    );
  }

  if (fetchError || !documentation) {
    return (
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Documentation Not Found
          </h1>
          <p className='text-red-500 mb-6'>
            {fetchError?.message ||
              fetchError?.data?.message ||
              'Failed to load documentation'}
          </p>
          <button
            onClick={() => navigate(`/project/${projectId}?tab=documentation`)}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition'
          >
            Back to Documentation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Edit Documentation
        </h1>
        <p className='text-gray-600'>
          Update your documentation content using Markdown.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-600 text-sm'>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Title Input */}
        <div>
          <label
            htmlFor='title'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Title
          </label>
          <input
            type='text'
            id='title'
            name='title'
            value={formData.title}
            onChange={handleInputChange}
            placeholder='Enter documentation title'
            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            required
          />
        </div>

        {/* Content Editor with Preview Toggle */}
        <div>
          <div className='flex justify-between items-center mb-2'>
            <label
              htmlFor='content'
              className='block text-sm font-medium text-gray-700'
            >
              Content
            </label>
            <div className='flex space-x-2'>
              <button
                type='button'
                onClick={() => setPreviewMode(false)}
                className={`px-3 py-1 text-sm rounded ${
                  !previewMode
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Write
              </button>
              <button
                type='button'
                onClick={() => setPreviewMode(true)}
                className={`px-3 py-1 text-sm rounded ${
                  previewMode
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          <div className='border border-gray-300 rounded-md overflow-hidden'>
            {!previewMode ? (
              <textarea
                id='content'
                name='content'
                value={formData.content}
                onChange={handleInputChange}
                placeholder='Write your documentation content using Markdown...'
                rows={20}
                className='w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                required
              />
            ) : (
              <div className='p-4 bg-gray-50 min-h-[500px]'>
                {formData.content.trim() ? (
                  <div className='prose prose-sm max-w-none'>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {formData.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className='text-gray-500 italic'>Nothing to preview</p>
                )}
              </div>
            )}
          </div>

          <p className='mt-2 text-sm text-gray-500'>
            You can use Markdown syntax including headers, lists, code blocks,
            tables, and more.
          </p>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-between pt-6'>
          {/* Delete Button */}
          <button
            type='button'
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
          >
            {isDeleting && <ClipLoader size={16} color='white' />}
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>

          {/* Save & Cancel Buttons */}
          <div className='flex space-x-4'>
            <button
              type='button'
              onClick={handleCancel}
              className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isUpdating}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
            >
              {isUpdating && <ClipLoader size={16} color='white' />}
              <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Delete Documentation
            </h3>
            <p className='text-gray-600 mb-6'>
              Are you sure you want to delete this documentation? This action
              cannot be undone.
            </p>
            <div className='flex justify-end space-x-4'>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition'
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
              >
                {isDeleting && <ClipLoader size={16} color='white' />}
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditDocumentationPage;
