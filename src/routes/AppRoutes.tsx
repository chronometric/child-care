import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

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
import PatientsPage from "../pages/patients/PatientsPage";
import RoomCreateOnboarding1 from "../pages/room_create/Onboarding/RoomCreateOnboarding1";
import RoomCreateOnboarding2 from "../pages/room_create/Onboarding/RoomCreateOnboarding2";
import RoomCreateOnboarding3 from "../pages/room_create/Onboarding/RoomCreateOnboarding3";
import RoomCreateOnboarding4 from "../pages/room_create/Onboarding/RoomCreateOnboarding4";

/**
 * Single route tree for the app. Import this from `AnimatedRoutes` only.
 */
function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence>
      <Routes location={location} key={location.pathname}>
        <Route path="patient" element={<PatientDashboard />} />
        <Route path="guest" element={<GuestDashboard />} />
        <Route path="admin" element={<Outlet />}>
          <Route path="sign-in" element={<AdminLogin />} />
          <Route path="" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
          </Route>
        </Route>
        <Route path="auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="sign-in" replace />} />
          <Route path="sign-in" element={<Login />} />
          <Route path="sign-up" element={<Register />} />
          <Route path="guest-signin" element={<GuestLogin />} />
          <Route path="patient-signin" element={<PatientLogin />} />
          <Route path="payment" element={<Payment />} />
          <Route path="payment-detail" element={<PaymentDetail />} />
          <Route path="signin-with-bank" element={<LoginWithBank />} />
          <Route path="signup-with-bank" element={<RegisterWithBank />} />
        </Route>
        <Route path="" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="rooms" element={<RoomListPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="ai-structure" element={<AIStructureList />} />
          <Route path="room/:id" element={<RoomPage />} />
        </Route>
        <Route path="room" element={<Outlet />}>
          <Route path="create" element={<Outlet />}>
            <Route index element={<CreateRoomMain />} />
            <Route path="onboarding" element={<RoomCreateOnboardingMain />}>
              <Route index element={<Navigate to="step1" replace />} />
              <Route path="step1" element={<RoomCreateOnboarding1 />} />
              <Route path="step2" element={<RoomCreateOnboarding2 />} />
              <Route path="step3" element={<RoomCreateOnboarding3 />} />
              <Route path="step4" element={<RoomCreateOnboarding4 />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default AppRoutes;
