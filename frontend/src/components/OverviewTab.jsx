import React from 'react';
import { useGetProjectIssuesQuery } from '@/slices/remote/issueApiSlice';
import { ClipLoader } from 'react-spinners';
import { FaUser, FaUserLock } from 'react-icons/fa6';

const OverviewTab = ({ project }) => {
  const { data: issuesResponse, isLoading } = useGetProjectIssuesQuery({
    id: project._id,
  });

  const projectIssues = issuesResponse?.data?.filter(
    (issue) => issue.project === project._id
  );

  const issueStats = {
    total: projectIssues?.length || 0,
    open: projectIssues?.filter((i) => i.status === 'Open').length || 0,
    inProgress:
      projectIssues?.filter((i) => i.status === 'In-Progress').length || 0,
    closed: projectIssues?.filter((i) => i.status === 'Closed').length || 0,
    resolved: projectIssues?.filter((i) => i.status === 'Resolved').length || 0,
  };

  const iconNormatizationPath = project.icon
    .toString()
    .includes('/projects/default.png')
    ? `/uploads/projects/default.png`
    : project.icon;

  return (
    <div className='grid md:grid-cols-2 gap-8'>
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <img
            src={iconNormatizationPath}
            alt='Project Icon'
            className='w-20 h-20 rounded-full object-cover border'
          />
          <div>
            <h2 className='text-2xl font-semibold'>{project.name}</h2>
            <p className='text-gray-600'>{project.description}</p>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-semibold mb-2'>Users Statistics</h3>
          <p className='flex items-center gap-2'>
            <FaUserLock />
            <span className='font-semibold'>
              Admins: {project.admins.length || 0}
            </span>
          </p>
          <p className='flex items-center gap-2'>
            <FaUser />
            <span className='font-semibold'>
              Members: {project.members.length || 0}
            </span>
          </p>
        </div>

        <div>
          <h3 className='text-lg font-semibold'>Links</h3>
          {project.links.length > 0 ? (
            <ul className='list-disc pl-5'>
              {project.links.map((link, index) => (
                <li key={`link-${index}`}>
                  <a
                    href={link.linkUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-500 hover:underline'
                  >
                    {link.linkName || link.linkUrl}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-gray-500'>No links provided.</p>
          )}
        </div>

        <div className='text-sm text-gray-400'>
          <p>Created at: {new Date(project.createdAt).toLocaleString()}</p>
          <p>Last updated: {new Date(project.updatedAt).toLocaleString()}</p>
        </div>
      </div>

      <div>
        <h3 className='text-xl font-semibold mb-4'>Project Analytics</h3>
        {isLoading ? (
          <ClipLoader size={20} />
        ) : (
          <div className='grid grid-cols-2 gap-4'>
            <div className='p-4 bg-blue-50 rounded-lg'>
              <h4 className='text-lg font-medium'>Total Issues</h4>
              <p className='text-2xl font-bold'>{issueStats.total}</p>
            </div>
            <div className='p-4 bg-yellow-50 rounded-lg'>
              <h4 className='text-lg font-medium'>Open</h4>
              <p className='text-2xl font-bold'>{issueStats.open}</p>
            </div>
            <div className='p-4 bg-purple-50 rounded-lg'>
              <h4 className='text-lg font-medium'>In Progress</h4>
              <p className='text-2xl font-bold'>{issueStats.inProgress}</p>
            </div>
            <div className='p-4 bg-green-50 rounded-lg'>
              <h4 className='text-lg font-medium'>Resolved</h4>
              <p className='text-2xl font-bold'>{issueStats.resolved}</p>
            </div>
            <div className='p-4 bg-red-50 rounded-lg'>
              <h4 className='text-lg font-medium'>Closed</h4>
              <p className='text-2xl font-bold'>{issueStats.closed}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
