import { apiSlice } from './ApiSlice';
import { USERS_URL } from '@/constants';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/register`,
        method: 'POST',
        body: data,
      }),
    }),
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/login`,
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
    }),
    checkUserAvailability: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/username`,
        method: 'POST',
        body: data,
      }),
    }),
    getUserProfile: builder.query({
      query: () => ({
        url: `${USERS_URL}/profile`,
        method: 'GET',
      }),
    }),
    updateUserProfile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: 'PATCH',
        body: data,
      }),
    }),
    deleteUserProfile: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/profile`,
        method: 'DELETE',
      }),
    }),
    refreshToken: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/refreshToken`,
        method: 'POST',
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/forgotpassword`,
        method: 'POST',
        body: data,
      }),
    }),
    verifyResetPasswordToken: builder.mutation({
      query: ({ token, data }) => ({
        url: `${USERS_URL}/resetpassword/${token}`,
        method: 'POST',
        body: data,
      }),
    }),
    enable2FA: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/2fa/enable`,
        method: 'POST',
      }),
    }),
    verify2FA: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/2fa/verify`,
        method: 'POST',
        body: data,
      }),
    }),
    disable2FA: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/2fa/disable`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useCheckUserAvailabilityMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useDeleteUserProfileMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useVerifyResetPasswordTokenMutation,
  useEnable2FAMutation,
  useVerify2FAMutation,
  useDisable2FAMutation,
} = userApiSlice;
