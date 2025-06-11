import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { useCreateIssueMutation } from '@/slices/remote/issueApiSlice';
import { useGetProjectByIdQuery } from '@/slices/remote/projectApiSlice';
import { toast } from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';

// Available tag types and their colors:
const ALL_TAGS = ['Backlog', 'Bug', 'Feature', 'Blocked'];
const TAG_COLORS = {
  Backlog: 'bg-indigo-100 text-indigo-800',
  Bug: 'bg-red-100 text-red-800',
  Feature: 'bg-green-100 text-green-800',
  Blocked: 'bg-gray-100 text-gray-800',
};

// “Assignee” pill color
const ASSIGNEE_PILL_COLOR = 'bg-blue-100 text-blue-800';

const CreateIssuePage = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [createIssue, { isLoading: creating }] = useCreateIssueMutation();
  const {
    data: projectResponse,
    isLoading,
    error,
  } = useGetProjectByIdQuery(projectId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // State for tags and assignees
  const [selectedTags, setSelectedTags] = useState([]);

  // Extract project data
  const project = projectResponse?.data || {};

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      tags: selectedTags,
    };

    console.log(payload);

    try {
      const res = await createIssue({ projectId, data: payload }).unwrap();
      toast.success('Issue created successfully');
      navigate(`/issue/${res.data._id}`, {
        replace: true,
      });
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create issue');
    }
  };

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
        Failed to load project information
      </div>
    );
  }

  const iconNormatizationPath = project.icon
    .toString()
    .includes('/projects/default.png')
    ? `/uploads/projects/default.png`
    : project.icon;

  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Project Header */}
      <div className='flex items-center space-x-4 mb-8'>
        <img
          src={iconNormatizationPath}
          alt={project.name}
          className='w-12 h-12 rounded-md object-cover'
        />
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>{project.name}</h1>
          <p className='text-gray-600 text-sm'>{project.description}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className='bg-white shadow-sm rounded-lg p-6'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Left Column: Title, Content, Tag Pills */}
            <div className='space-y-6'>
              {/* Title Field */}
              <div>
                <label className='block text-sm font-semibold text-gray-700'>
                  Title
                </label>
                <input
                  type='text'
                  {...register('title', { required: 'Title is required' })}
                  placeholder='e.g. Fix task deletion bug'
                  className='mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                {errors.title && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Content Field */}
              <div>
                <label className='block text-sm font-semibold text-gray-700'>
                  Content
                </label>
                <textarea
                  {...register('content', { required: 'Content is required' })}
                  rows={6}
                  placeholder='Detailed explanation of the issue...'
                  className='mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                {errors.content && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.content.message}
                  </p>
                )}
              </div>

              {/* Tag Selection Pills */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Tags
                </label>
                <div className='flex flex-wrap'>
                  {ALL_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    const baseClasses =
                      'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2 cursor-pointer transition';
                    const classes = isSelected
                      ? `${TAG_COLORS[tag]}`
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200';
                    return (
                      <div
                        key={tag}
                        className={`${baseClasses} ${classes}`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Severity, Assign To, Tip */}
            <div className='space-y-6'>
              {/* Severity Field */}
              <div>
                <label className='block text-sm font-semibold text-gray-700'>
                  Severity
                </label>
                <select
                  {...register('severity')}
                  className='mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='Low'>Low</option>
                  <option value='Medium'>Medium</option>
                  <option value='High'>High</option>
                  <option value='Critical'>Critical</option>
                </select>
              </div>

              {/* Tip Box */}
              <div className='p-4 bg-gray-50 border border-gray-200 rounded-md'>
                <p className='text-sm text-gray-700'>
                  <strong>Tip:</strong> Write clear and detailed descriptions.
                  Include reproduction steps and expected behavior.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type='submit'
              disabled={creating}
              className='inline-block bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 disabled:opacity-50 transition'
            >
              {creating ? (
                <span className='flex items-center'>
                  <ClipLoader size={18} color='#FFF' className='mr-2' />{' '}
                  Creating...
                </span>
              ) : (
                'Create Issue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIssuePage;
