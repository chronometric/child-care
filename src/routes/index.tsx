import { Navigate, Outlet } from "react-router-dom";

import AuthLayout from "../components/layout/AuthLayout";
import MainLayout from "../components/layout/MainLayout";
import AdminLayout from "../components/layout/AdminLayout";

import GuestLogin from "../pages/auth/GuestLogin";
import Payment from "../pages/auth/Payment";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import CalendarPage from "../pages/calendar/CalendarPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import FilesPage from "../pages/files/FilesPage";
import RoomListPage from "../pages/room/RoomMain";
import RoomPage from "../pages/room/RoomDetail";
import AIStructureList from "../pages/room_create/AIStructureList";
import CreateRoomMain from "../pages/room_create/CreateRoomMain";
import RoomCreateOnboardingMain from "../pages/room_create/RoomCreateOnboardingMain";
import SettingsPage from "../pages/settings/SettingsPage";
import PatientLogin from "../pages/auth/PatientLogin";
import PaymentDetail from "../pages/auth/PaymentDetail";
import LoginWithBank from "../pages/auth/LoginWithBank";
import RegisterWithBank from "../pages/auth/RegisterWithBank";
import AdminLogin from "../pages/admin/Login";
import AdminDashboard from "../pages/admin/Dashboard";
import PatientDashboard from "../pages/patient/PatientDashboard";
import GuestDashboard from "../pages/guest/GuestDashboard";
import RoomCreateOnboarding1 from "../pages/room_create/Onboarding/RoomCreateOnboarding1";
import RoomCreateOnboarding2 from "../pages/room_create/Onboarding/RoomCreateOnboarding2";
import RoomCreateOnboarding3 from "../pages/room_create/Onboarding/RoomCreateOnboarding3";
import RoomCreateOnboarding4 from "../pages/room_create/Onboarding/RoomCreateOnboarding4";

const routes = [
  // Routes for patient-specific pages
  {
    path: "patient",
    element: <PatientDashboard />, // Patient dashboard layout
  },
  // Routes for guest-specific pages
  {
    path: "guest",
    element: <GuestDashboard />, // Guest dashboard layout
  },
  // Routes for admin-related pages
  {
    path: "admin",
    element: <Outlet />, // Admin-specific layout with nested routes
    children: [
      {
        path: "sign-in",
        element: <AdminLogin />, // Admin login page
      },
      {
        path: "",
        element: <AdminLayout />, // Layout for admin dashboard and other pages
        children: [
          {
            index: true,
            element: <AdminDashboard />, // Default route for admin dashboard
          },
        ],
      },
    ],
  },
  // Routes for room creation and management
  {
    path: "room",
    element: <Outlet />, // Room-related layout with nested routes
    children: [
      {
        path: "create",
        element: <Outlet />, // Room creation layout with nested routes
        children: [
          {
            index: true,
            element: <CreateRoomMain />, // Default route for room creation main page
          },
          {
            path: "onboarding",
            element: <RoomCreateOnboardingMain />, // Onboarding page for room creation
            children: [
              {
                index: true,
                element: <Navigate to={"step1"} />,
              },
              {
                path: "step1",
                element: <RoomCreateOnboarding1 />,
              },
              {
                path: "step2",
                element: <RoomCreateOnboarding2 />,
              },
              {
                path: "step3",
                element: <RoomCreateOnboarding3 />,
              },
              {
                path: "step4",
                element: <RoomCreateOnboarding4 />,
              },
            ],
          },
          {
            path: "ai-structure",
            element: <MainLayout />, // Main layout for AI structure management
            children: [{ index: true, element: <AIStructureList /> }], // AI structure list page
          },
        ],
      },
    ],
  },
  // Routes for authentication pages
  {
    path: "auth",
    element: <AuthLayout />, // Layout for authentication-related pages
    children: [
      { index: true, element: <Navigate to={"sign-in"} /> }, // Redirect to sign-in by default
      { path: "sign-in", element: <Login /> }, // Login page
      { path: "sign-up", element: <Register /> }, // Registration page
      { path: "guest-signin", element: <GuestLogin /> }, // Guest login page
      { path: "patient-signin", element: <PatientLogin /> }, // Patient login page
      { path: "payment", element: <Payment /> }, // Payment page
      { path: "payment-detail", element: <PaymentDetail /> }, // Payment detail page
      { path: "signin-with-bank", element: <LoginWithBank /> }, // Login with bank page
      { path: "signup-with-bank", element: <RegisterWithBank /> }, // Register with bank page
    ],
  },
  // Routes for main application pages
  {
    path: "",
    element: <MainLayout />, // Main layout for general application pages
    children: [
      { index: true, element: <DashboardPage /> }, // Default route for dashboard
      { path: "rooms", element: <RoomListPage /> }, // Rooms list page
      { path: "calendar", element: <CalendarPage /> }, // Calendar page
      { path: "files", element: <FilesPage /> }, // Files page
      { path: "settings", element: <SettingsPage /> }, // Settings page
      { path: "room/:id", element: <RoomPage /> }, // Room details page, with dynamic ID
    ],
  },
];

export default routes;
