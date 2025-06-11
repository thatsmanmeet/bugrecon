import React from 'react';
import { Link, useRouteError } from 'react-router';

const ErrorPage = () => {
  const error = useRouteError();
  return (
    <div className='min-h-screen w-full flex items-center justify-center p-10 flex-col gap-3'>
      <h1 className='text-4xl font-black'>
        {error?.status} {error?.statusText}
      </h1>
      <h2 className='text-2xl font-bold'>Oops! Something went wrong.</h2>
      <p>{error.data}</p>
      <Link href='/' style={{ color: 'blue' }}>
        Go back home
      </Link>
    </div>
  );
};

export default ErrorPage;
