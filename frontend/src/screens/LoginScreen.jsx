import { setCredentialsOnLogin } from '@/slices/local/AuthSlice';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router';
import validator from 'validator';
import { FaUserLock, FaRegEnvelope, FaLock } from 'react-icons/fa6';
import { TbBrandAuth0 } from 'react-icons/tb';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ClipLoader } from 'react-spinners';
import { useLoginMutation } from '@/slices/remote/userApiSlice';

const LoginScreen = ({ title = 'New' }) => {
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [isTokenRequired, setIsTokenRequired] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loginHandler = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('All fields are required');
      return;
    }

    if (!validator.isEmail(email)) {
      toast.error('Invalid email address');
      return;
    }

    if (isTokenRequired && !token) {
      toast.error('Token is required');
      return;
    }

    try {
      const res = await login({
        email,
        password,
        token,
      }).unwrap();

      if (res.data.token === true) {
        console.log('REC');

        setIsTokenRequired(true);
        return;
      }
      dispatch(setCredentialsOnLogin(res.data));
      toast.success('Login Sucessful');
      navigate('/');
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.error ||
          'Something went wrong while trying to log in'
      );
    }
  };

  return (
    <div className='flex justify-center items-center w-full h-screen bg-white dark:bg-slate-800'>
      <div className='w-[480px] flex flex-col justify-center gap-2 p-5 bg-white dark:bg-slate-800 sm:dark:bg-slate-700 rounded-xl'>
        <div className='m-2 flex flex-col justify-center items-center gap-1'>
          <div className='w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-500 flex justify-center items-center'>
            <FaUserLock size={32} />
          </div>
          <h2 className='text-3xl font-bold text-center dark:text-white'>
            Welcome Back
          </h2>
          <p className='text-center text-sm'>Sign in to your {title} account</p>
        </div>
        <form className='p-3 flex flex-col gap-4' onSubmit={loginHandler}>
          <div className='relative w-full'>
            <FaRegEnvelope className='absolute left-0 top-[0.13rem] m-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='email'
              placeholder='Email Address'
              value={email}
              onChange={(e) => {
                if (isTokenRequired) {
                  setIsTokenRequired(false);
                }
                setEmail(e.target.value);
              }}
              className='bg-slate-100 dark:bg-slate-600 rounded-xl p-5 pl-9'
            />
          </div>
          <div className='relative w-full'>
            <FaLock className='absolute left-0 top-[0.13rem] m-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='bg-slate-100 dark:bg-slate-600 rounded-xl p-5 pl-9'
            />
          </div>
          {isTokenRequired && (
            <div className='relative w-full'>
              <TbBrandAuth0 className='absolute left-0 top-[0.13rem] m-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                type='number'
                placeholder='2FA Token'
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className='bg-slate-100 dark:bg-slate-600 rounded-xl p-5 pl-9'
              />
            </div>
          )}
          <p className='text-sm dark:text-white'>
            Don&apos;t have an account?{' '}
            <Link className='text-blue-400' to='/register'>
              create new account
            </Link>
          </p>
          <Button
            variant='outline'
            type='submit'
            className='w-full bg-blue-500 hover:bg-blue-600 hover:text-white text-white rounded-xl p-5'
          >
            {isLoggingIn ? <ClipLoader size={22} color='#666' /> : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
