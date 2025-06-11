import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function RateLimitPage() {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-white px-4'>
      <AlertCircle size={64} className='text-gray-400 mb-6' />
      <h1 className='text-3xl font-semibold text-gray-900 mb-2'>
        429 Too Many Requests
      </h1>
      <p className='text-gray-600 mb-6'>
        You’ve sent too many requests in a short period. Please try again later.
      </p>
      <button
        onClick={() => navigate('/')}
        className='mt-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full font-medium transition'
      >
        Go Home
      </button>
    </div>
  );
}
