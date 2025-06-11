import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import store from './store.js';
import ErrorPage from './screens/ErrorPage';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import PrivateRoute from './components/privateRoute';
import HomeScreen from './screens/HomeScreen';
import ProjectDetailScreen from './screens/ProjectDetailScreen';
import CreateIssuePage from './screens/CreateIssuePage';
import IssueDetailPage from './screens/IssueDetailsPage';
import InvitationPage from './screens/InvitationPage';
import ProfileScreen from './screens/ProfileScreen';
import CreateDocumentationPage from './screens/CreateDocumentationPage';
import ViewDocumentationPage from './screens/ViewDocumentationPage';
import EditDocumentationPage from './screens/EditDocumentationPage';
import RateLimitPage from './screens/RateLimitScreen';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/429',
        element: <RateLimitPage />,
      },
      {
        path: '',
        element: <PrivateRoute />,
        children: [
          {
            path: '/',
            element: <HomeScreen />,
            index: true,
          },
          {
            path: '/profile',
            element: <ProfileScreen />,
          },
          {
            path: '/project/:id',
            element: <ProjectDetailScreen />,
          },
          {
            path: '/project/:id/overview',
            element: <ProjectDetailScreen />,
          },
          {
            path: '/project/:id/issues',
            element: <ProjectDetailScreen />,
          },
          {
            path: '/project/:id/members',
            element: <ProjectDetailScreen />,
          },
          {
            path: '/project/:id/settings',
            element: <ProjectDetailScreen />,
          },
          {
            path: '/project/:id/documentation',
            element: <ProjectDetailScreen />,
          },
          {
            path: '/issue/:id',
            element: <IssueDetailPage />,
          },
          {
            path: '/project/:id/issues/new',
            element: <CreateIssuePage />,
          },
          {
            path: '/invitations',
            element: <InvitationPage />,
          },
          {
            path: '/project/:id/documentation/new',
            element: <CreateDocumentationPage />,
          },
          {
            path: '/project/:id/documentation/:slug',
            element: <ViewDocumentationPage />,
          },
          {
            path: '/project/:id/documentation/:slug/edit',
            element: <EditDocumentationPage />,
          },
        ],
      },
      {
        path: '/login',
        element: <LoginScreen title='BugRecon' />,
      },
      {
        path: '/register',
        element: <RegisterScreen title='BugRecon' />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <Toaster position='top-right' />
    </Provider>
  </StrictMode>
);
