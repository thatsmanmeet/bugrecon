import React from 'react';
import { FaUserGroup } from 'react-icons/fa6';
import { Link } from 'react-router';

const ProjectCard = ({ project }) => {
  const iconNormatizationPath = project.icon
    .toString()
    .includes('/projects/default.png')
    ? `/uploads/projects/default.png`
    : project.icon;

  return (
    <Link to={`/project/${project._id}`} className='block h-full'>
      <div className='bg-gray-100 p-5 cursor-pointer rounded-sm flex flex-col gap-3 h-full'>
        <img src={iconNormatizationPath} className='w-12 h-12 rounded-md' />
        <h1 className='font-bold text-2xl'>{project.name}</h1>
        <p className='text-gray-700 text-sm'>
          {project.description.length > 70
            ? project.description.substr(0, 70) + '...'
            : project.description}
        </p>
        <div className='flex items-center gap-2 mt-auto'>
          <FaUserGroup />
          <p>
            {project.admins.length} admins & {project.members.length} members
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
