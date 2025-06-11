import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router';
import validator from 'validator';
import {
  FaUserLock,
  FaRegEnvelope,
  FaLock,
  FaUser,
  FaIdCard,
} from 'react-icons/fa6';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ClipLoader } from 'react-spinners';
import { useRegisterMutation } from '@/slices/remote/userApiSlice';

const RegisterScreen = ({ title }) => {
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const registerHandler = async (e) => {
    e.preventDefault();
    if (!email || !password || !name || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (!validator.isEmail(email)) {
      toast.error('Invalid email address');
      return;
    }

    if (confirmPassword !== password) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      toast.error('Password must have minimum length of 8 characters.');
      return;
    }

    try {
      const res = await register({
        name,
        username,
        email,
        password,
        confirmPassword,
      }).unwrap();
      toast.success(`Welcome ${res.data.name}. Please login`);
      navigate('/login');
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.error ||
          'Something went wrong while trying to register'
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
            Welcome Vistor
          </h2>
          <p className='text-center text-sm'>Create your new {title} account</p>
        </div>
        <form className='p-3 flex flex-col gap-4' onSubmit={registerHandler}>
          <div className='relative w-full'>
            <FaUser className='absolute left-0 top-[0.13rem] m-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Name'
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              className='bg-slate-100 dark:bg-slate-600 rounded-xl p-5 pl-9'
            />
          </div>
          <div className='relative w-full'>
            <FaIdCard className='absolute left-0 top-[0.13rem] m-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='text'
              placeholder='username'
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              className='bg-slate-100 dark:bg-slate-600 rounded-xl p-5 pl-9'
            />
          </div>
          <div className='relative w-full'>
            <FaRegEnvelope className='absolute left-0 top-[0.13rem] m-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='email'
              placeholder='Email Address'
              value={email}
              onChange={(e) => {
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
          <div className='relative w-full'>
            <FaLock className='absolute left-0 top-[0.13rem] m-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='password'
              placeholder='Confirm Password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='bg-slate-100 dark:bg-slate-600 rounded-xl p-5 pl-9'
            />
          </div>
          <p className='text-sm dark:text-white'>
            already have an account?{' '}
            <Link className='text-blue-400' to='/login'>
              login
            </Link>
          </p>
          <Button
            variant='outline'
            type='submit'
            className='w-full bg-blue-500 hover:bg-blue-600 hover:text-white text-white rounded-xl p-5'
          >
            {isRegistering ? <ClipLoader size={22} color='#666' /> : 'Register'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegisterScreen;
