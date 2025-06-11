import React, { useState, useMemo } from 'react';
import { useGetProjectDocumentationQuery } from '@/slices/remote/documentationApiSlice';
import { Link, useParams } from 'react-router';
import { ClipLoader } from 'react-spinners';

const DocumentationTab = () => {
  const { id: projectId } = useParams();
  const {
    data: documentationResponse,
    isLoading,
    error,
  } = useGetProjectDocumentationQuery({ projectId });

  const [searchTerm, setSearchTerm] = useState('');

  // Get project documentation
  const projectDocumentation = useMemo(
    () => documentationResponse?.data || [],
    [documentationResponse]
  );

  // Apply search filter
  const filteredDocumentation = useMemo(() => {
    return projectDocumentation.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        doc.content.toLowerCase().includes(searchTerm.toLowerCase().trim());
      return matchesSearch;
    });
  }, [projectDocumentation, searchTerm]);

  return (
    <div className='space-y-6 px-4 sm:px-6 lg:px-8 py-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-4 sm:mb-0'>
          Documentation
        </h2>
        <Link
          to={`/project/${projectId}/documentation/new`}
          className='inline-block bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition'
        >
          + Create Documentation
        </Link>
      </div>

      {/* Loading / Error */}
      {isLoading ? (
        <div className='flex justify-center py-10'>
          <ClipLoader size={36} />
        </div>
      ) : error ? (
        <p className='text-red-500'>
          {error.message ||
            error.data?.message ||
            error.error ||
            'Failed to load documentation'}
        </p>
      ) : (
        <>
          {/* Search Controls */}
          <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
            {/* Search Box */}
            <input
              type='text'
              placeholder='Search Documentation'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full sm:w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          {/* No Documentation / Filtered Results */}
          {projectDocumentation.length === 0 ? (
            <p className='text-gray-500 text-center'>
              No documentation found for this project.
            </p>
          ) : filteredDocumentation.length === 0 ? (
            <p className='text-gray-500 text-center'>
              No documentation matches your search criteria.
            </p>
          ) : (
            /* Single‐column List of Cards */
            <ul className='space-y-6'>
              {filteredDocumentation.map((doc) => {
                const createdAt = new Date(doc.createdAt).toLocaleString();
                const updatedAt = new Date(doc.updatedAt).toLocaleString();

                return (
                  <li
                    key={doc._id}
                    className='bg-white shadow-sm rounded-lg hover:shadow-md transition p-5 flex flex-col'
                  >
                    {/* Top: Title */}
                    <div className='flex justify-between items-start'>
                      {/* Title */}
                      <Link
                        to={`/project/${projectId}/documentation/${doc.slug}`}
                        className='text-lg font-semibold text-blue-600 hover:underline'
                      >
                        {doc.title}
                      </Link>
                    </div>

                    {/* Content Preview */}
                    <div className='mt-3'>
                      <p className='text-gray-600 text-sm line-clamp-3'>
                        {doc.content.substring(0, 200)}
                        {doc.content.length > 200 && '...'}
                      </p>
                    </div>

                    {/* Created / Updated / Author */}
                    <div className='mt-4 space-y-1 text-sm text-gray-500 flex flex-col sm:flex-row gap-1 sm:gap-2'>
                      <span>Created: {createdAt}</span>
                      <span>Last updated: {updatedAt}</span>
                      {doc.author && (
                        <span>
                          Created by: {doc.author.name || doc.author.username}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default DocumentationTab;
