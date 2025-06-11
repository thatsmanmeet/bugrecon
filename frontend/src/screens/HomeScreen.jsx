import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import {
  useCreateProjectMutation,
  useGetProjectsQuery,
} from '@/slices/remote/projectApiSlice';
import React, { useState } from 'react';
import { FaPlus, FaUserGroup } from 'react-icons/fa6';
import { ClipLoader } from 'react-spinners';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DialogClose } from '@radix-ui/react-dialog';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import ProjectCard from '@/components/ProjectCard';

const HomeScreen = () => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: projectsResponse,
    isLoading,
    error,
    refetch,
  } = useGetProjectsQuery({}, { pollingInterval: 30000 });
  const [projectCreationAPI, { isLoading: isProjectCreating }] =
    useCreateProjectMutation();

  if (isLoading) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <ClipLoader size={30} />
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <p>
          {error.message ||
            error.data.message ||
            error.error ||
            "Something wen't wrong fetching projects"}
        </p>
      </div>
    );
  }

  const projectCreationHandler = async () => {
    if (!projectName || !projectDescription) {
      toast.error('Project name and description required.');
      return;
    }
    try {
      const res = await projectCreationAPI({
        name: projectName,
        description: projectDescription,
      }).unwrap();
      toast.success(res.message);
      setProjectName('');
      setProjectDescription('');
      refetch();
    } catch (error) {
      toast.error(
        error.error ||
          error.data ||
          error.message ||
          error.data.message ||
          "Something wen't wrong"
      );
    }
  };

  const projectsList = searchTerm
    ? projectsResponse.data.filter(
        (project) =>
          project.name.trim().toLowerCase().includes(searchTerm) ||
          project.description.trim().toLowerCase().includes(searchTerm)
      )
    : projectsResponse.data;

  return (
    <div>
      <Navbar />
      <div className='p-5'>
        <div className='flex flex-col sm:flex-row w-full sm:items-center sm:justify-between gap-3'>
          <h1 className='font-semibold text-2xl'>Your Projects</h1>
          <Dialog>
            <DialogTrigger>
              <div className='flex items-center justify-center gap-2 text-white bg-black rounded-md px-2 py-3 cursor-pointer'>
                <FaPlus /> Create Project
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add new project</DialogTitle>
                <DialogDescription>Create a new project</DialogDescription>
                <Input
                  placeholder='Project Name'
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
                <Textarea
                  placeholder='Project Description'
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                />
              </DialogHeader>
              <DialogFooter>
                <DialogClose onClick={projectCreationHandler}>
                  <div className='flex items-center justify-center gap-2 text-white bg-black rounded-md px-2 py-3 cursor-pointer'>
                    {isProjectCreating ? <ClipLoader /> : 'Submit Project'}
                  </div>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className='w-full sm:max-w-md my-2'>
          <Input
            placeholder='Search Project'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='p-4'
          />
        </div>

        {projectsList.length === 0 ? (
          <p className='p-1 mt-3 text-gray-700'>
            No Projects Found. Create new one or ask an admin to invite you.
          </p>
        ) : (
          <div className='mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-stretch'>
            {projectsList.map((project) => (
              <ProjectCard project={project} key={project._id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
