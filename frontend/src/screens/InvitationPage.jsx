import React from 'react';
import {
  useGetReceivedInvitesQuery,
  useRespondToInvitationMutation,
} from '@/slices/remote/projectApiSlice';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { FaInbox } from 'react-icons/fa6';

const InvitationPage = () => {
  const {
    data: myInvitesResponse,
    isLoading,
    refetch,
  } = useGetReceivedInvitesQuery();
  const [respondToInvite, { isLoading: isProcessing }] =
    useRespondToInvitationMutation();

  const invites = myInvitesResponse?.data || [];

  const handleResponse = async (inviteId, action) => {
    try {
      await respondToInvite({ id: inviteId, data: { action } }).unwrap();
      toast.success(
        `Invite ${action === 'Accepted' ? 'accepted' : 'declined'}!`
      );
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to respond to invite');
    }
  };

  return (
    <div className='min-h-screen w-screen bg-white px-6 py-10 text-gray-800'>
      <div className='flex items-center gap-2 mb-8'>
        <FaInbox size={26} />
        <h1 className='text-3xl font-semibold'>Notifications</h1>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center h-40'>
          <ClipLoader size={28} />
        </div>
      ) : invites.length === 0 ? (
        <p className='text-sm text-gray-500'>You have no invitations.</p>
      ) : (
        <div className='space-y-6'>
          {invites.map((invite) => {
            const isAccepted = invite.status === 'Accepted';
            const isDeclined = invite.status === 'Declined';
            return (
              <div
                key={invite._id}
                className={`border border-gray-200 rounded-xl p-4 flex justify-between items-center ${
                  isAccepted
                    ? 'border-green-500 cursor-not-allowed'
                    : 'border-red-600 cursor-not-allowed'
                }`}
              >
                <div>
                  <p className='text-lg font-medium'>
                    {invite.project?.name || 'Deleted Project'}
                  </p>
                  <p className='text-sm text-gray-500 mt-1'>
                    Invited by {invite.invitedBy?.name || 'Someone'}
                  </p>
                  <p className='text-xs text-gray-400 mt-1'>
                    Status: {invite.status}
                  </p>
                </div>

                <div className='flex gap-3'>
                  <button
                    onClick={() => handleResponse(invite._id, 'Accepted')}
                    disabled={isProcessing || isAccepted || isDeclined}
                    className={`px-4 py-1.5 text-sm rounded-lg text-white ${
                      isAccepted || isDeclined
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isAccepted ? 'Accepted' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleResponse(invite._id, 'Declined')}
                    disabled={isProcessing || isAccepted || isDeclined}
                    className={`px-4 py-1.5 text-sm rounded-lg text-white ${
                      isAccepted || isDeclined
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {isDeclined ? 'Declined' : 'Decline'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InvitationPage;
