import React, { useState } from 'react';
import {
  usePromoteMemberToAdminMutation,
  useDemoteAdminToMemberMutation,
  useRemoveMemberFromProjectMutation,
  useSendInvitationMutation,
} from '@/slices/remote/projectApiSlice';
import { Dialog, DialogTrigger } from '@radix-ui/react-dialog';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './ui/dialog';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import {
  FaPlus,
  FaUserShield,
  FaUser,
  FaUserSlash,
  FaArrowDown,
  FaArrowUp,
} from 'react-icons/fa6';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const MembersTab = ({ project, refetch }) => {
  const { userInfo } = useSelector((store) => store.auth);
  const [username, setUserName] = useState('');
  const [promote, { isLoading: isPromoting }] =
    usePromoteMemberToAdminMutation();
  const [demote, { isLoading: isDemoting }] = useDemoteAdminToMemberMutation();
  const [removeMember, { isLoading: isRemoving }] =
    useRemoveMemberFromProjectMutation();
  const [sendInvite, { isLoading: isInviting }] = useSendInvitationMutation();

  const handlePromote = async (userId) => {
    try {
      const res = await promote({
        id: project._id,
        data: { memberId: userId },
      }).unwrap();
      toast.success(res.message);
    } catch (error) {
      toast.error(error.data?.message || 'Error promoting member');
    }
  };

  const handleDemote = async (userId) => {
    try {
      const res = await demote({
        id: project._id,
        data: { adminId: userId },
      }).unwrap();
      toast.success(res.message);
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Error demoting admin');
    }
  };

  const handleRemove = async (userId) => {
    try {
      const res = await removeMember({
        id: project._id,
        data: { memberId: userId },
      }).unwrap();
      toast.success(res.message);
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Error removing member');
    }
  };

  const sendInvitationHandler = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    try {
      const res = await sendInvite({
        id: project._id,
        data: { username },
      }).unwrap();
      toast.success(res.message);
      setUserName('');
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Error sending invitation');
    }
  };

  return (
    <div className='max-w-4xl mx-auto px-2 sm:px-6 py-2 sm:py-6 space-y-8'>
      {/* Invite User Button */}
      <header className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <h1 className='text-2xl sm:text-3xl font-bold'>Members &amp; Admins</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant='green'
              className='flex items-center gap-2 w-full sm:w-auto'
            >
              <FaPlus /> Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
              <DialogDescription>
                Enter a username to send an invitation to join this project.
              </DialogDescription>
              <Input
                placeholder='Username'
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                className='mt-4'
              />
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant='black'
                  className='w-full flex justify-center'
                  onClick={sendInvitationHandler}
                  disabled={isInviting}
                >
                  {isInviting ? <ClipLoader size={20} /> : 'Send Invite'}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* Admins Section */}
      <section className='bg-white shadow rounded-lg px-2 sm:px-6 py-2 sm:py-6'>
        <h2 className='text-xl sm:text-2xl font-semibold flex items-center gap-2'>
          <FaUserShield className='text-blue-500' /> Admins
        </h2>
        <Separator className='my-4' />
        {project.admins.length === 0 && (
          <p className='text-gray-600'>No admins assigned.</p>
        )}
        <div className='space-y-4'>
          {project.admins.map((admin) => (
            <div
              key={admin._id}
              className='flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-200 rounded-lg p-2 sm:p-4 gap-3 hover:shadow-md transition-shadow'
            >
              <div className='flex items-center gap-3'>
                <FaUserShield className='text-blue-600 text-lg' />
                <div>
                  <p className='font-medium'>{admin.name}</p>
                  <p className='text-sm text-gray-500'>{admin.username}</p>
                </div>
              </div>
              {project.admins.find((user) => user._id === userInfo._id) && (
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => handleDemote(admin._id)}
                  disabled={isDemoting}
                  className='flex items-center gap-1'
                >
                  {isDemoting ? (
                    <ClipLoader size={16} />
                  ) : (
                    <>
                      <FaArrowDown /> Demote
                    </>
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Members Section */}
      <section className='bg-white shadow rounded-lg px-2 sm:px-6 py-2 sm:py-6'>
        <h2 className='text-xl sm:text-2xl font-semibold flex items-center gap-2'>
          <FaUser className='text-green-500' /> Members
        </h2>
        <Separator className='my-4' />
        {project.members.length === 0 && (
          <p className='text-gray-600'>No members yet.</p>
        )}
        <div className='space-y-4'>
          {project.members.map((member) => (
            <div
              key={member._id}
              className='flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-200 rounded-lg p-2 sm:p-4 gap-3 hover:shadow-md transition-shadow'
            >
              <div className='flex items-center gap-3'>
                <FaUser className='text-green-600 text-lg' />
                <div>
                  <p className='font-medium'>{member.name}</p>
                  <p className='text-sm text-gray-500'>{member.username}</p>
                </div>
              </div>
              {project.admins.find((user) => user._id === userInfo._id) && (
                <div className='flex flex-col sm:flex-row gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handlePromote(member._id)}
                    disabled={isPromoting}
                    className='flex items-center gap-1'
                  >
                    {isPromoting ? (
                      <ClipLoader size={16} />
                    ) : (
                      <>
                        <FaArrowUp /> Promote
                      </>
                    )}
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => handleRemove(member._id)}
                    disabled={isRemoving}
                    className='flex items-center gap-1'
                  >
                    {isRemoving ? (
                      <ClipLoader size={16} />
                    ) : (
                      <>
                        <FaUserSlash /> Remove
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MembersTab;
