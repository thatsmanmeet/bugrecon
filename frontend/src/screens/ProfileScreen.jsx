import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  removeCredentialsOnLogout,
  setCredentialsOnLogin,
} from '@/slices/local/AuthSlice';
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  useDisable2FAMutation,
  useEnable2FAMutation,
  useUpdateUserProfileMutation,
  useVerify2FAMutation,
} from '@/slices/remote/userApiSlice';

function ProfileScreen() {
  const { userInfo } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [updateUserProfileAPI] = useUpdateUserProfileMutation();
  const [enableTwoFactorAPI] = useEnable2FAMutation();
  const [verifyTwoFactorAPI] = useVerify2FAMutation();
  const [disableTwoFactorAPI] = useDisable2FAMutation();
  const [profileData, setProfileData] = useState({
    name: userInfo.name,
    email: userInfo.email,
    password: '',
    confirmPassword: '',
  });
  const [qrCodeData, setQrCodeData] = useState('');
  const [secretToken, setSecretToken] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');

  const profileUpdateHandler = async () => {
    if (
      !profileData.name &&
      !profileData.email &&
      !profileData.password &&
      !profileData.confirmPassword
    )
      return;
    if (
      profileData.password &&
      profileData.password !== profileData.confirmPassword
    ) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      const { accessToken, refreshToken } = userInfo;
      const res = await updateUserProfileAPI(profileData).unwrap();
      dispatch(
        setCredentialsOnLogin({ ...res.data, accessToken, refreshToken })
      );
      toast.success(res.message);
    } catch (error) {
      toast.error(error?.message || error?.data?.message || error?.error);
    }
  };

  const enableTwoFactorHandler = async () => {
    try {
      const res = await enableTwoFactorAPI().unwrap();
      toast.success(res.message);
      setQrCodeData(res.data.qrCodeData);
      setSecretToken(res.data.secret);
    } catch (error) {
      toast.error(error?.message || error?.data?.message || error?.error);
    }
  };

  const disableTwoFactorHandler = async () => {
    if (!password) return toast.error('Password is required');
    try {
      const res = await disableTwoFactorAPI({ password }).unwrap();
      toast.success(res.message + ' Login again');
      setPassword('');
      dispatch(removeCredentialsOnLogout());
    } catch (error) {
      toast.error(error?.message || error?.data?.message || error?.error);
    }
  };

  const verifyTwoFactorHandler = async () => {
    if (!token) return toast.error('OTP code is required');
    try {
      const res = await verifyTwoFactorAPI({ token }).unwrap();
      setQrCodeData('');
      setSecretToken('');
      dispatch(removeCredentialsOnLogout());
      toast.success(res.message);
      navigate('/login');
    } catch (error) {
      toast.error(error?.message || error?.data?.message || error?.error);
    }
  };

  return (
    <div className='max-w-4xl mx-auto px-2 sm:px-6 py-4 sm:py-8 space-y-10'>
      <section className='bg-white shadow rounded-lg px-4 sm:px-6 py-4 sm:py-6 space-y-6'>
        <div>
          <h1 className='text-2xl font-bold mb-1'>Account</h1>
          <p className='text-sm text-gray-600'>
            Update your personal information below
          </p>
        </div>
        <div className='grid gap-4'>
          <div>
            <Label className='mb-3'>Name</Label>
            <Input
              placeholder='Your Name'
              value={profileData.name}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div>
            <Label className='mb-3'>Email</Label>
            <Input
              placeholder='Your Email'
              value={profileData.email}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>
          <div className='grid sm:grid-cols-2 gap-4'>
            <div>
              <Label className='mb-3'>Password</Label>
              <Input
                placeholder='Password'
                type='password'
                value={profileData.password}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label className='mb-3'>Confirm Password</Label>
              <Input
                placeholder='Confirm Password'
                type='password'
                value={profileData.confirmPassword}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <Button onClick={profileUpdateHandler}>Update</Button>
        </div>
      </section>

      <section className='bg-white shadow rounded-lg px-4 sm:px-6 py-4 sm:py-6 space-y-6'>
        <div>
          <h2 className='text-2xl font-bold mb-1'>Two Factor Authentication</h2>
          <p className='text-sm text-gray-600'>Secure your account with 2FA</p>
        </div>
        {!userInfo.twoFactorEnabled ? (
          <Button onClick={enableTwoFactorHandler}>
            Enable Two Factor Auth
          </Button>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='destructive' className='text-white'>
                Disable Two Factor Auth
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Disable 2FA</DialogTitle>
                <DialogDescription>
                  Enter your password to disable 2FA login
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder='Password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <DialogFooter>
                <Button
                  onClick={disableTwoFactorHandler}
                  variant='destructive'
                  className='text-white'
                >
                  Disable 2FA
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {qrCodeData && (
          <div className='space-y-4 text-center'>
            <p className='text-lg'>
              Scan this QR code with your authenticator app
            </p>
            <QRCode value={qrCodeData} className='mx-auto' />
            <p className='text-sm'>
              Manual code: <span className='font-bold'>{secretToken}</span>
            </p>
            <Input
              type='number'
              placeholder='Enter OTP code'
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <Button onClick={verifyTwoFactorHandler}>Verify</Button>
          </div>
        )}
      </section>
    </div>
  );
}

export default ProfileScreen;
