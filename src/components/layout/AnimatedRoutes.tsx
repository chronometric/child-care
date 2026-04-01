import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import AuthLayout from "../../components/layout/AuthLayout";
import MainLayout from "../../components/layout/MainLayout";
import AdminLayout from "../../components/layout/AdminLayout";

import GuestLogin from "../../pages/auth/GuestLogin";
import Payment from "../../pages/auth/Payment";
import Login from "../../pages/auth/Login";
import Register from "../../pages/auth/Register";
import CalendarPage from "../../pages/calendar/CalendarPage";
import DashboardPage from "../../pages/dashboard/DashboardPage";
import FilesPage from "../../pages/files/FilesPage";
import RoomListPage from "../../pages/room/RoomMain";
import RoomPage from "../../pages/room/RoomDetail";
import AIStructureList from "../../pages/room_create/AIStructureList";
import CreateRoomMain from "../../pages/room_create/CreateRoomMain";
import RoomCreateOnboardingMain from "../../pages/room_create/RoomCreateOnboardingMain";
import SettingsPage from "../../pages/settings/SetttingsPage";
import PatientLogin from "../../pages/auth/PatientLogin";
import PaymentDetail from "../../pages/auth/PaymentDetail";
import LoginWithBank from "../../pages/auth/LoginWithBank";
import RegisterWithBank from "../../pages/auth/RegisterWithBank";
import AdminLogin from "../../pages/admin/Login";
import AdminDashboard from "../../pages/admin/Dashboard";
import PatientDashboard from "../../pages/patient/PatientDashboard";
import GuestDashboard from "../../pages/guest/GuestDashboard";
import PatientsPage from "../../pages/patients/PatientsPage";
import RoomCreateOnboarding1 from "../../pages/room_create/Onboarding/RoomCreateOnboarding1";
import RoomCreateOnboarding2 from "../../pages/room_create/Onboarding/RoomCreateOnboarding2";
import RoomCreateOnboarding3 from "../../pages/room_create/Onboarding/RoomCreateOnboarding3";
import RoomCreateOnboarding4 from "../../pages/room_create/Onboarding/RoomCreateOnboarding4";

// import AppRoutes from "./Routes";

// import routes from "../../routes";

function AnimatedRoutes() {
  const location = useLocation();

  // Use the routes configuration to generate the routes for the application
  return (
    <AnimatePresence>
      <Routes location={location} key={location.pathname}>
        <Route path="patient" element={<PatientDashboard />} /> // Patient
        dashboard layout
        <Route path="guest" element={<GuestDashboard />} /> // Routes for
        guest-specific pages
        <Route path="admin" element={<Outlet />}>
      // Routes for admin-related pages
          <Route path="sign-in" element={<AdminLogin />} /> // Admin login page
          <Route path="" element={<AdminLayout />}>
        // Layout for admin dashboard and other pages
            <Route index element={<AdminDashboard />} /> // Default route for
            admin dashboard
          </Route>
        </Route>
        <Route path="auth" element={<AuthLayout />}>
          <Route index element={<Navigate to={"sign-in"} />} /> // Redirect to
          sign-in by default
          <Route path="sign-in" element={<Login />} /> // Login page
          <Route path="sign-up" element={<Register />} /> // Registration page
          <Route path="guest-signin" element={<GuestLogin />} /> // Guest login
          page
          <Route path="patient-signin" element={<PatientLogin />} /> // Patient
          login page
          <Route path="payment" element={<Payment />} /> // Payment page
          <Route path="payment-detail" element={<PaymentDetail />} /> // Payment
          detail page
          <Route path="signin-with-bank" element={<LoginWithBank />} /> // Login
          with bank page
          <Route path="signup-with-bank" element={<RegisterWithBank />} /> //
          Register with bank page
        </Route>
        <Route path="" element={<MainLayout />}>
          <Route index element={<DashboardPage />} /> // Default route for
          dashboard
          <Route path="rooms" element={<RoomListPage />} /> // Rooms list page
          <Route path="calendar" element={<CalendarPage />} /> // Calendar page
          <Route path="files" element={<FilesPage />} /> // Files page
          <Route path="patients" element={<PatientsPage />} /> // Patient records
          <Route path="settings" element={<SettingsPage />} /> // Settings page
          <Route path="room/:id" element={<RoomPage />} /> // Room details page,
          with dynamic ID
        </Route>
        <Route path="room" element={<Outlet />}>
      // Room-related layout with nested routes
          <Route path="create" element={<Outlet />}>
        // Room creation layout with nested routes
            <Route index element={<CreateRoomMain />} /> // Default route for
            room creation main page
            <Route path="onboarding" element={<RoomCreateOnboardingMain />}>
          // Onboarding page for room creation
              <Route index element={<Navigate to={"step1"} />} />
              <Route path="step1" element={<RoomCreateOnboarding1 />} />
              <Route path="step2" element={<RoomCreateOnboarding2 />} />
              <Route path="step3" element={<RoomCreateOnboarding3 />} />
              <Route path="step4" element={<RoomCreateOnboarding4 />} />
              <Route path="ai-structure" element={<MainLayout />}>
            // Main layout for AI structure management
                <Route index element={<AIStructureList />} /> // AI structure
                list page
              </Route>
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={'/auth'} />} />
      </Routes>
    </AnimatePresence>
  ); // Render the configured routes
}

export default AnimatedRoutes;
