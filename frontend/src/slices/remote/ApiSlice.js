import { BASE_URL } from '../../constants';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  removeCredentialsOnLogout,
  setCredentialsOnLogin,
} from '../local/AuthSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.auth?.accessToken || null;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

let refreshing = null;

async function baseQueryWithAuth(args, api, extra) {
  let result = await baseQuery(args, api, extra);
  // console.log(result);
  if (result.error?.originalStatus === 429) {
    window.location.href = '/429';
    return result;
  }

  if (
    result.error?.status === 401 &&
    result.error.data?.message.includes('Authentication')
  ) {
    console.log('AUTH>>>>>>>>>>>');
    api.dispatch(removeCredentialsOnLogout());
    window.location.href = '/';
  }

  if (
    result.error?.status === 401 &&
    typeof result.error.data?.message === 'string' &&
    result.error.data.errCode === 'AUTH001'
  ) {
    // console.log('refresh token expired');
    if (!refreshing) {
      refreshing = (async () => {
        const refreshRes = await baseQuery(
          { url: '/api/v1/users/refreshToken', method: 'POST' },
          api,
          extra
        );
        if (refreshRes.data?.data) {
          api.dispatch(setCredentialsOnLogin(refreshRes.data.data));
          // console.log('refresh token refreshed', refreshRes.data.data);
        } else {
          api.dispatch(removeCredentialsOnLogout());
        }
        refreshing = null;
      })();
    }

    await refreshing;
    // retry original
    result = await baseQuery(args, api, extra);
  }

  return result;
}

export const apiSlice = createApi({
  baseQuery: baseQueryWithAuth,
  refetchOnMountOrArgChange: true,
  tagTypes: ['User', 'Comment', 'Issue', 'Project'],
  endpoints: () => ({}),
});
