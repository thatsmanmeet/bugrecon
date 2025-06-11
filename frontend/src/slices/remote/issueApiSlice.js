import { apiSlice } from './ApiSlice';
import { ISSUES_URL } from '@/constants';

export const issueApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjectIssues: builder.query({
      query: ({ id }) => ({
        url: `${ISSUES_URL}/project/${id}`,
        method: 'GET',
      }),
    }),
    getMyIssues: builder.query({
      query: () => ({
        url: `${ISSUES_URL}/my`,
        method: 'GET',
      }),
    }),
    createIssue: builder.mutation({
      query: ({ projectId, data }) => ({
        url: `${ISSUES_URL}/project/${projectId}`,
        method: 'POST',
        body: data,
      }),
    }),
    getIssueById: builder.query({
      query: (id) => ({
        url: `${ISSUES_URL}/${id}`,
        method: 'GET',
      }),
    }),
    updateIssue: builder.mutation({
      query: ({ id, data }) => ({
        url: `${ISSUES_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),
    deleteIssue: builder.mutation({
      query: (id) => ({
        url: `${ISSUES_URL}/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetMyIssuesQuery,
  useGetProjectIssuesQuery,
  useCreateIssueMutation,
  useGetIssueByIdQuery,
  useUpdateIssueMutation,
  useDeleteIssueMutation,
} = issueApiSlice;
