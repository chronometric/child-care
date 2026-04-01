import { useEffect, useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";

import TradeMark from "../user/TradeMark";
import Avatar from "../common/Avatar";
import ActionButton from "../common/ActionButton";
import SignOutButton from "../layout/header/SignOutButton";
import SearchInput from "../layout/header/SearchInput";
import NotificationBell from "../layout/NotificationBell";

import DashboardSVG from "../../assets/navbar/Dashboard.svg?react";
import RoomSVG from "../../assets/navbar/Room.svg?react";
import CalendarSVG from "../../assets/navbar/Calendar.svg?react";
import FolderSVG from "../../assets/navbar/Folder.svg?react";
import SettingsSVG from "../../assets/navbar/Settings.svg?react";
import { io, Socket } from "socket.io-client";
import { InitResponse } from "../../pages/room/types";
import { useAppSelector } from "../../store";
import config from "../../config";

const API_LOCATION = import.meta.env.VITE_BACKEND_URL
// Sidebar items with their corresponding icons and paths
const sidebarItems = [
  {
    title: "Dashboard",
    icon: <DashboardSVG />,
    path: "/",
  },
  {
    title: "Rooms",
    icon: <RoomSVG />,
    path: "/rooms",
    subPath: "/room/",
  },
  {
    title: "Calendar",
    icon: <CalendarSVG />,
    path: "/calendar",
  },
  {
    title: "Files",
    icon: <FolderSVG />,
    path: "/files",
  },
  {
    title: "Patients",
    icon: <RoomSVG />,
    path: "/patients",
  },
  {
    title: "Inställningar",
    icon: <SettingsSVG />,
    path: "/settings",
  },
];

// Lists of users based on their types
// const guestList = ["Anna", "Lukas", "Sara"];
// const patientList = ["Elsa"];

// interface User {
//   id: string;
//   name: string;
// }

// MainLayout component definition
const MainLayout = () => {
  const navigate = useNavigate(); // React Router hook for navigation
  // const location = useLocation();
  // const search = location.search;
  // const params = new URLSearchParams(search);
  // const redirect = params.get("redirect") as string;
  const { pathname } = useLocation(); // React Router hook for current pathname
  const searchParams = useSearchParams(); // Hook to access URL search parameters
  const isAIPage = pathname === "/room/create/ai-structure"; // Check if the current page is the AI creation page
  const isRoomPage = pathname.startsWith("/room/"); // Check if the current page is a room page
  const accountMe = useAppSelector(state => state.auth.createUser);
  const isAuth = useAppSelector((state) => state.auth.isAuth);
  const isLoading = useAppSelector((state) => state.loading.isLoading);


  useEffect(() => {
    if (!isAuth && !isLoading) {
      navigate("/auth");
    }
  }, [isAuth, isLoading]);

  const [isSidebarExpand, setSidebarExpand] = useState<boolean>(false); // State to control sidebar expansion
  const [activeUser, setActiveUser] = useState<string>(""); // State to store the active user
  const [userType, setUserType] = useState<string>("guest"); // State to store the current user type
  const [userList, setUserList] = useState<Participant[]>([]); // State to store the list of users based on the user type

  const [patientList, setPatientList] = useState<Participant[]>([]);
  const [guestList, setGuestList] = useState<Participant[]>([]);

  // Function to handle user click and update the URL with the selected user
  const handleUserClick = (user: string) => () => {
    setActiveUser(user);
    navigate(`${pathname}?${new URLSearchParams({ message: userType, user })}`);
  };

  // Effect to update user type and user list based on URL search parameters
  useEffect(() => {
    const userType = (searchParams[0].get("message") as string) || "guest";
    const userList = userType === "patient" ? patientList : guestList;
    const currentUser = (searchParams[0].get("user") as string) || userList[0]?.username;


    setUserType(userType);
    setUserList(userList);
    console.log('userlist', userList)
    if (!currentUser) setActiveUser(guestList[0]?.username || "");
    else setActiveUser(currentUser);
  }, [searchParams, patientList, guestList]);

  interface Participant {
    username: string;
    role: string;
    user_id: string;
  }

  useEffect(() => {

    const socket: Socket = io(API_LOCATION, {
      path: "/socket.io/",
      transports: ['websocket'],
    });

    socket.on("connect", () => {
      const roomName = localStorage.getItem("roomName");
      const username = localStorage.getItem("username");
      socket.emit("init", { username: username, role: "creator", roomName: roomName });
    })

    socket.on("init_response", (data: InitResponse) => {
      const patients = data.users.filter(user => user.role === "patient").map(user => ({ ...user, user_id: user.sid }));
      const guests = data.users.filter(user => user.role === "guest").map(user => ({ ...user, user_id: user.sid })) || [];

      setGuestList(guests);
      setPatientList(patients);

    });

  }, []);

  return (
    <div className="bg-light-background flex flex-col w-full h-full py-4 gap-y-4">
      {/* Header section */}
      <header className="flex items-center px-4 justify-between">
        {/* Trademark component */}
        <TradeMark className="float-left text-primary-background" />
        {/* Notification and sign-out buttons */}
        <div className="flex items-center gap-2">
          {!isAIPage && isRoomPage ? (
            <div className="flex gap-x-2">
              {userList.map((userItem, index) => (
                <ActionButton
                  key={index}
                  className={twMerge(
                    "w-9 h-9 text-white",
                    userItem.username === activeUser
                      ? "bg-primary-background"
                      : "bg-primary-text"
                  )}
                  onClick={handleUserClick(userItem.username)}
                >
                  {userItem.username.charAt(0).toUpperCase()}
                </ActionButton>
              ))}
            </div>
          ) : (
            <>
              <SearchInput /> {/* Search input component */}
              <NotificationBell />
            </>
          )}
          <div className="p-0.5">
            {/* Sign out button */}
            <SignOutButton />
          </div>
        </div>
      </header>
      {/* Main content section */}
      <div className="flex flex-1 min-h-0 px-4 gap-x-6">
        {/* Sidebar section */}

        <AnimatePresence mode="wait">
          <motion.aside
            initial={{ width: isSidebarExpand ? "240px" : "71px" }}
            animate={{ width: isSidebarExpand ? "240px" : "71px" }}
            transition={{ duration: 0.5 }}
            className={twMerge(
              "shrink-0 flex flex-col justify-between",
              isAIPage ? "justify-end" : ""
            )}
          >
            {/* Sidebar navigation links */}
            {!isAIPage && (
              <motion.div
                className={twMerge(
                  "w-full",
                  isSidebarExpand ? "pr-4" : "pr-[7px]"
                )}
              >
                <div className="relative w-full">
                  <ul className="grow bg-white rounded-xl flex flex-col py-8 shrink-0">
                    {/* Dashboard link */}
                    {sidebarItems.map((item, index) => (
                      <li
                        key={index}
                        className={twMerge(
                          "py-2 px-5 flex items-center gap-x-5 hover:text-primary-background cursor-pointer overflow-hidden",
                          pathname === item.path ||
                            (item.subPath && pathname.startsWith(item.subPath))
                            ? "text-primary-background"
                            : "text-disabled-text"
                        )}
                        onClick={() => navigate(item.path)}
                      >
                        <span className="text-inherit shrink-0">
                          {item.icon}
                        </span>
                        <motion.p className="grow text-left text-inherit">
                          {item.title}
                        </motion.p>
                      </li>
                    ))}
                  </ul>
                  {/* Sidebar toggle button */}
                  <span
                    className="w-8 h-8 bg-white rounded-lg text-primary-background absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-basic cursor-pointer"
                    onClick={() => {
                      setSidebarExpand(!isSidebarExpand); // Toggle sidebar expansion
                    }}
                  >
                    {isSidebarExpand ? <FaChevronLeft /> : <FaChevronRight />}
                  </span>
                </div>
              </motion.div>
            )}
            {/* Avatar */}
            <Avatar
              uri={`${config.api.resource_uri}/${accountMe.picture_id}`}
              name={accountMe.user_name}
              label={accountMe.user_email}
              isExpanded={isSidebarExpand}
              className="self-start"
            />
          </motion.aside>
        </AnimatePresence>
        {/* Main content area */}
        <main className="grow">
          <Outlet /> {/* Renders nested routes */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
