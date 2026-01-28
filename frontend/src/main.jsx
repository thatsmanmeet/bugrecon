import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import store from "./store.js";

const ErrorPage = lazy(() => import("./screens/ErrorPage"));
const LoginScreen = lazy(() => import("./screens/LoginScreen"));
const RegisterScreen = lazy(() => import("./screens/RegisterScreen"));
const PrivateRoute = lazy(() => import("./components/privateRoute"));
const HomeScreen = lazy(() => import("./screens/HomeScreen"));
const ProjectDetailScreen = lazy(() => import("./screens/ProjectDetailScreen"));
const CreateIssuePage = lazy(() => import("./screens/CreateIssuePage"));
const IssueDetailPage = lazy(() => import("./screens/IssueDetailsPage"));
const InvitationPage = lazy(() => import("./screens/InvitationPage"));
const ProfileScreen = lazy(() => import("./screens/ProfileScreen"));
const CreateDocumentationPage = lazy(
  () => import("./screens/CreateDocumentationPage"),
);
const ViewDocumentationPage = lazy(
  () => import("./screens/ViewDocumentationPage"),
);
const EditDocumentationPage = lazy(
  () => import("./screens/EditDocumentationPage"),
);
const RateLimitPage = lazy(() => import("./screens/RateLimitScreen"));

const appFallbackNode = (
  <div className="flex min-h-screen items-center justify-center bg-white text-gray-600">
    Loading...
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/429",
        element: <RateLimitPage />,
      },
      {
        path: "",
        element: <PrivateRoute />,
        children: [
          {
            path: "/",
            element: <HomeScreen />,
            index: true,
          },
          {
            path: "/profile",
            element: <ProfileScreen />,
          },
          {
            path: "/project/:id",
            element: <ProjectDetailScreen />,
          },
          {
            path: "/project/:id/overview",
            element: <ProjectDetailScreen />,
          },
          {
            path: "/project/:id/issues",
            element: <ProjectDetailScreen />,
          },
          {
            path: "/project/:id/members",
            element: <ProjectDetailScreen />,
          },
          {
            path: "/project/:id/settings",
            element: <ProjectDetailScreen />,
          },
          {
            path: "/project/:id/documentation",
            element: <ProjectDetailScreen />,
          },
          {
            path: "/issue/:id",
            element: <IssueDetailPage />,
          },
          {
            path: "/project/:id/issues/new",
            element: <CreateIssuePage />,
          },
          {
            path: "/invitations",
            element: <InvitationPage />,
          },
          {
            path: "/project/:id/documentation/new",
            element: <CreateDocumentationPage />,
          },
          {
            path: "/project/:id/documentation/:slug",
            element: <ViewDocumentationPage />,
          },
          {
            path: "/project/:id/documentation/:slug/edit",
            element: <EditDocumentationPage />,
          },
        ],
      },
      {
        path: "/login",
        element: <LoginScreen title="BugRecon" />,
      },
      {
        path: "/register",
        element: <RegisterScreen title="BugRecon" />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <Suspense fallback={appFallbackNode}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster position="top-right" />
    </Provider>
  </StrictMode>,
);
