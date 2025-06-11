// Main screen with tabs for Overview, Issues, Members, and Settings
import React, { useEffect, useState } from 'react';
import { useGetProjectByIdQuery } from '@/slices/remote/projectApiSlice';
import { ClipLoader } from 'react-spinners';
import OverviewTab from '@/components/OverviewTab';
import IssuesTab from '@/components/IssueTab';
import MembersTab from '@/components/MembersTab';
import SettingsTab from '@/components/SettingsTab';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { FaArrowLeft } from 'react-icons/fa6';
import DocumentationTab from '@/components/DocumentationTab';

const tabs = ['overview', 'issues', 'documentation', 'members', 'settings'];

const ProjectDetailScreen = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const currentLocationSplit = loc.pathname.toString().split('/');
    const currentLocation =
      currentLocationSplit[currentLocationSplit.length - 1];
    if (!tabs.includes(currentLocation)) {
      setActiveTab('overview');
    } else {
      setActiveTab(currentLocation);
    }
  }, [loc]);

  const {
    data: projectResponse,
    isLoading,
    error,
    refetch,
  } = useGetProjectByIdQuery(id);

  if (isLoading) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <ClipLoader size={30} />
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full h-screen flex flex-col items-center justify-center'>
        <p>
          {error?.message ||
            error?.data?.message ||
            error?.error ||
            'Something went wrong fetching project details'}
        </p>
        <br />
        <Link to={'/'} className='text-blue-500'>
          Go Back To Home
        </Link>
      </div>
    );
  }

  const project = projectResponse?.data;

  return (
    <div className='p-6'>
      <Link className='flex gap-2 items-center mb-2' to={'/'}>
        <FaArrowLeft />
        <span>Go Back</span>
      </Link>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>{project.name}</h1>
        <p className='text-gray-600'>{project.description}</p>
      </div>

      <div className='flex flex-wrap gap-4 border-b mb-4'>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              navigate(`/project/${project._id}/${tab}`);
              setActiveTab(tab);
            }}
            className={`pb-2 px-2 capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className='mt-4'>
        {activeTab === 'overview' && <OverviewTab project={project} />}
        {activeTab === 'issues' && <IssuesTab projectId={project._id} />}
        {activeTab === 'documentation' && <DocumentationTab />}
        {activeTab === 'members' && (
          <MembersTab project={project} refetch={refetch} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab project={project} refetch={refetch} />
        )}
      </div>
    </div>
  );
};

export default ProjectDetailScreen;
