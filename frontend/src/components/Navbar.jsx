import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { FaCircleUser, FaInbox } from 'react-icons/fa6';
import { useLogoutMutation } from '@/slices/remote/userApiSlice';
import { removeCredentialsOnLogout } from '@/slices/local/AuthSlice';
import logo from '@/assets/icon.webp';
import { useGetReceivedInvitesQuery } from '@/slices/remote/projectApiSlice';

const Navbar = () => {
  const { userInfo } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      const res = await logoutApi().unwrap();
      dispatch(removeCredentialsOnLogout());
      navigate('/login');
      toast.success(res.message || 'Logout Successful');
    } catch (error) {
      toast.error(
        'Logout Failed.',
        error?.data?.message || error?.error || 'Server Error'
      );
    }
  };

  const linkNavigator = (link) => {
    navigate(link);
  };

  const { data: myInvitesResponse, isLoading } = useGetReceivedInvitesQuery();

  return (
    <div className='w-full p-2 flex items-center justify-between'>
      <div className='flex flex-col text-xl text-black font-semibold'>
        <Link to={'/'}>
          <img src={logo} alt='bytebazaar' className='w-32 h-20' />
        </Link>
      </div>

      <div className='mr-3 flex items-center gap-5'>
        <Link to={'/invitations'}>
          <div className='bg-gray-100 p-4 rounded-full relative cursor-pointer'>
            <FaInbox size={18} />
            {isLoading ? (
              ''
            ) : myInvitesResponse.data.length === 0 ? (
              ''
            ) : (
              <div className='flex items-center justify-center absolute -top-2 -right-1 text-white bg-red-600 w-6 h-6 rounded-full p-1'>
                {
                  myInvitesResponse.data.filter(
                    (invite) => invite.status === 'Pending'
                  ).length
                }
              </div>
            )}
          </div>
        </Link>
        {userInfo !== null ? (
          <DropdownMenu>
            <DropdownMenuTrigger className='relative outline-none'>
              <Avatar className={'w-12 h-12'}>
                <AvatarImage
                  src={userInfo.avatar || '/uploads/default.png'}
                  alt='avatar'
                  className={' rounded-full border-green-800 border-2'}
                />
                <AvatarFallback>
                  {userInfo.name.substr(0, 1) || 'A'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => linkNavigator('/profile')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logoutHandler}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to='/login'>
            <FaCircleUser size={30} color='#333' />
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
