import React from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useGetDocumentationBySlugQuery } from '@/slices/remote/documentationApiSlice';
import { ClipLoader } from 'react-spinners';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

const ViewDocumentationPage = () => {
  const { id: projectId, slug } = useParams();
  const navigate = useNavigate();

  const {
    data: documentationResponse,
    isLoading,
    error,
  } = useGetDocumentationBySlugQuery({ projectId, slug });

  const documentation = documentationResponse?.data;

  const handleBack = () => {
    navigate(`/project/${projectId}/documentation`);
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <ClipLoader size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Documentation Not Found
          </h1>
          <p className='text-red-500 mb-6'>
            {error.message ||
              error.data?.message ||
              'Failed to load documentation'}
          </p>
          <button
            onClick={handleBack}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition'
          >
            Back to Documentation
          </button>
        </div>
      </div>
    );
  }

  if (!documentation) {
    return (
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Documentation Not Found
          </h1>
          <button
            onClick={handleBack}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition'
          >
            Back to Documentation
          </button>
        </div>
      </div>
    );
  }

  const createdAt = new Date(documentation.createdAt).toLocaleString();
  const updatedAt = new Date(documentation.updatedAt).toLocaleString();

  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center space-x-4 mb-4'>
          <button
            onClick={handleBack}
            className='text-blue-600 hover:text-blue-800 transition'
          >
            ← Back to Documentation
          </button>
        </div>

        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              {documentation.title}
            </h1>
            <div className='flex flex-wrap gap-4 text-sm text-gray-600'>
              <span>Created: {createdAt}</span>
              <span>Last updated: {updatedAt}</span>
              {documentation.author && (
                <span>
                  By:{' '}
                  {documentation.author.name || documentation.author.username}
                </span>
              )}
            </div>
          </div>

          <div className='flex space-x-2 mt-4 sm:mt-0'>
            <Link
              to={`/project/${projectId}/documentation/${slug}/edit`}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition'
            >
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='prose prose-lg max-w-none'>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              // Custom styling for code blocks
              code: ({ inline, className, children, ...props }) => {
                return !inline ? (
                  <pre className='bg-gray-100 rounded-md p-4 overflow-x-auto'>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code
                    className='bg-gray-100 px-1 py-0.5 rounded text-sm'
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              // Custom table styling
              table: ({ children }) => (
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-300'>
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50'>
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-200'>
                  {children}
                </td>
              ),
            }}
          >
            {documentation.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ViewDocumentationPage;
