import { apiSlice } from './ApiSlice';
import { COMMENTS_URL } from '@/constants';

export const commentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCommentsForIssue: builder.query({
      query: (id) => ({
        url: `${COMMENTS_URL}/issue/${id}`,
        method: 'GET',
      }),
    }),
    createComment: builder.mutation({
      query: ({ issueId, data }) => ({
        url: `${COMMENTS_URL}/issue/${issueId}`,
        method: 'POST',
        body: data,
      }),
    }),
    updateComment: builder.mutation({
      query: ({ id, data }) => ({
        url: `${COMMENTS_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),
    deleteComment: builder.mutation({
      query: (id) => ({
        url: `${COMMENTS_URL}/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetCommentsForIssueQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApiSlice;
