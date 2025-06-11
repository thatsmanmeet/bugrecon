import React, { useState, useMemo } from 'react';
import { useGetProjectIssuesQuery } from '@/slices/remote/issueApiSlice';
import { Link, useParams } from 'react-router';
import { ClipLoader } from 'react-spinners';

// Color lookup maps for pills:
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

const Pill = ({ label, className }) => (
  <span
    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
  >
    {label}
  </span>
);

const IssuesTab = () => {
  const { id: projectId } = useParams();
  const {
    data: issuesResponse,
    isLoading,
    error,
  } = useGetProjectIssuesQuery({ id: projectId });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // "All", "Open", "In-Progress", "Resolved", "Closed"

  // Filter client‐side just in case the API returns all issues
  const projectIssues = useMemo(
    () =>
      issuesResponse?.data?.filter((issue) => issue.project === projectId) ||
      [],
    [issuesResponse, projectId]
  );

  // Apply search + status filter
  const filteredIssues = useMemo(() => {
    return projectIssues.filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        issue.content.toLowerCase().includes(searchTerm.toLowerCase().trim());
      const matchesStatus =
        statusFilter === 'All' || issue.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projectIssues, searchTerm, statusFilter]);

  return (
    <div className='space-y-6 px-4 sm:px-6 lg:px-8 py-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-4 sm:mb-0'>
          Issues
        </h2>
        <Link
          to={`/project/${projectId}/issues/new`}
          className='inline-block bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition'
        >
          + Create Issue
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
            'Failed to load issues'}
        </p>
      ) : (
        <>
          {/* Search & Filter Controls */}
          <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
            {/* Search Box */}
            <input
              type='text'
              placeholder='Search an Issue'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full sm:w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='w-full sm:w-1/4 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='All'>All statuses</option>
              <option value='Open'>Open</option>
              <option value='In-Progress'>In-Progress</option>
              <option value='Resolved'>Resolved</option>
              <option value='Closed'>Closed</option>
            </select>
          </div>

          {/* No Issues / Filtered Results */}
          {projectIssues.length === 0 ? (
            <p className='text-gray-500 text-center'>
              No issues found for this project.
            </p>
          ) : filteredIssues.length === 0 ? (
            <p className='text-gray-500 text-center'>
              No issues match your search or filter criteria.
            </p>
          ) : (
            /* Single‐column List of Cards */
            <ul className='space-y-6'>
              {filteredIssues.map((issue) => {
                const createdAt = new Date(issue.createdAt).toLocaleString();
                const updatedAt = new Date(issue.updatedAt).toLocaleString();

                return (
                  <li
                    key={issue._id}
                    className='bg-white shadow-sm rounded-lg hover:shadow-md transition p-5 flex flex-col'
                  >
                    {/* Top: Title + Comment Count */}
                    <div className='flex justify-between items-start'>
                      {/* Title */}
                      <Link
                        to={`/issue/${issue._id}`}
                        className='text-lg font-semibold text-blue-600 hover:underline'
                      >
                        {issue.title}
                      </Link>

                      {/* numComments Badge */}
                      <span className='inline-flex items-center bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full'>
                        🗨 {issue.numComments}
                      </span>
                    </div>

                    {/* Pills: Status, Severity, Tags */}
                    <div className='mt-3 flex flex-wrap gap-2'>
                      <Pill
                        label={issue.status}
                        className={
                          STATUS_COLORS[issue.status] ||
                          'bg-gray-100 text-gray-800'
                        }
                      />
                      <Pill
                        label={issue.severity}
                        className={
                          SEVERITY_COLORS[issue.severity] ||
                          'bg-gray-100 text-gray-800'
                        }
                      />
                      {issue.tags?.map((tag) => (
                        <Pill
                          key={tag}
                          label={tag}
                          className={
                            TAG_COLORS[tag] || 'bg-gray-100 text-gray-800'
                          }
                        />
                      ))}
                    </div>

                    {/* Created / Updated / Author / Assignees */}
                    <div className='mt-4 space-y-1 text-sm text-gray-500 flex flex-col sm:flex-row gap-1 sm:gap-2'>
                      <span>Created: {createdAt}</span>
                      <span>Last updated: {updatedAt}</span>
                      <span>Created by: {issue.createdBy.username}</span>
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

export default IssuesTab;
