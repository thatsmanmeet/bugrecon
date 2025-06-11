import { apiSlice } from './ApiSlice';
import { DOCUMENTATION_URL } from '@/constants';

export const documentationAPISlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjectDocumentation: builder.query({
      query: ({ projectId }) => ({
        url: `${DOCUMENTATION_URL}/${projectId}`,
        method: 'GET',
      }),
    }),
    getDocumentationBySlug: builder.query({
      query: ({ projectId, slug }) => ({
        url: `${DOCUMENTATION_URL}/${projectId}/docs/${slug}`,
        method: 'GET',
      }),
    }),
    createNewDocumentation: builder.mutation({
      query: ({ projectId, data }) => ({
        url: `${DOCUMENTATION_URL}/${projectId}`,
        method: 'POST',
        body: data,
      }),
    }),
    updateDocumentation: builder.mutation({
      query: ({ projectId, slug, data }) => ({
        url: `${DOCUMENTATION_URL}/${projectId}/docs/${slug}`,
        method: 'PUT',
        body: data,
      }),
    }),
    deleteDocumentation: builder.mutation({
      query: ({ projectId, slug }) => ({
        url: `${DOCUMENTATION_URL}/${projectId}/docs/${slug}`,
        method: 'DELETE',
      }),
    }),
    //end
  }),
});

export const {
  useCreateNewDocumentationMutation,
  useDeleteDocumentationMutation,
  useUpdateDocumentationMutation,
  useGetDocumentationBySlugQuery,
  useGetProjectDocumentationQuery,
} = documentationAPISlice;
