import { apiSlice } from './ApiSlice';
import { PROJECTS_URL } from '@/constants';

export const projectApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: () => ({
        url: `${PROJECTS_URL}`,
        method: 'GET',
      }),
    }),
    createProject: builder.mutation({
      query: (data) => ({
        url: `${PROJECTS_URL}`,
        method: 'POST',
        body: data,
      }),
    }),
    getProjectById: builder.query({
      query: (id) => ({
        url: `${PROJECTS_URL}/${id}`,
        method: 'GET',
      }),
    }),
    updateProjectDetails: builder.mutation({
      query: ({ id, data }) => ({
        url: `${PROJECTS_URL}/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `${PROJECTS_URL}/${id}`,
        method: 'DELETE',
      }),
    }),
    sendInvitation: builder.mutation({
      query: ({ id, data }) => ({
        url: `${PROJECTS_URL}/invite/${id}`,
        method: 'POST',
        body: data,
      }),
    }),
    respondToInvitation: builder.mutation({
      query: ({ id, data }) => ({
        url: `${PROJECTS_URL}/invite/respond/${id}`,
        method: 'POST',
        body: data,
      }),
    }),
    getSentInvites: builder.query({
      query: () => ({
        url: `${PROJECTS_URL}/invite/sent`,
        method: 'GET',
      }),
    }),
    getReceivedInvites: builder.query({
      query: () => ({
        url: `${PROJECTS_URL}/invite/received`,
        method: 'GET',
      }),
    }),
    promoteMemberToAdmin: builder.mutation({
      query: ({ id, data }) => ({
        url: `${PROJECTS_URL}/${id}/promote`,
        method: 'POST',
        body: data,
      }),
    }),
    demoteAdminToMember: builder.mutation({
      query: ({ id, data }) => ({
        url: `${PROJECTS_URL}/${id}/demote`,
        method: 'POST',
        body: data,
      }),
    }),
    removeMemberFromProject: builder.mutation({
      query: ({ id, data }) => ({
        url: `${PROJECTS_URL}/${id}/remove`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetProjectByIdQuery,
  useUpdateProjectDetailsMutation,
  useDeleteProjectMutation,
  useSendInvitationMutation,
  useRespondToInvitationMutation,
  useGetSentInvitesQuery,
  useGetReceivedInvitesQuery,
  usePromoteMemberToAdminMutation,
  useDemoteAdminToMemberMutation,
  useRemoveMemberFromProjectMutation,
} = projectApiSlice;
