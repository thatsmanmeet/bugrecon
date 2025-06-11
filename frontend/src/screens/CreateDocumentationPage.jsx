import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useCreateNewDocumentationMutation } from '@/slices/remote/documentationApiSlice';
import { ClipLoader } from 'react-spinners';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

const CreateDocumentationPage = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [createDocumentation, { isLoading }] =
    useCreateNewDocumentationMutation();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState('');

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

    if (formData.title.length < 3) {
      setError('Title must have more than 3 characters.');
      return;
    }

    try {
      const result = await createDocumentation({
        projectId,
        data: formData,
      }).unwrap();

      navigate(`/project/${projectId}/documentation/${result.data.slug}`);
    } catch (err) {
      setError(err.data?.message || 'Failed to create documentation');
    }
  };

  const handleCancel = () => {
    navigate(`/project/${projectId}?tab=documentation`);
  };

  return (
    <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Create Documentation
        </h1>
        <p className='text-gray-600'>
          Write comprehensive documentation for your project using Markdown.
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
        <div className='flex justify-end space-x-4 pt-6'>
          <button
            type='button'
            onClick={handleCancel}
            className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isLoading}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
          >
            {isLoading && <ClipLoader size={16} color='white' />}
            <span>{isLoading ? 'Creating...' : 'Create Documentation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDocumentationPage;
