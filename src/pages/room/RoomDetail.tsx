// src/RoomDetail.tsx

import { useEffect, useState } from "react";
import { FaChevronLeft } from "react-icons/fa6";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

import Input from "../../components/common/Input";
import ChatItem from "./components/ChatItem";

import SendSVG from "../../assets/send.svg?react";
import RoomCall from "../../components/room/RoomCall";
import ShareDialog from "../../components/room/ShareDialog";
import ActionButton from "../../components/common/ActionButton";

import { io, Socket } from "socket.io-client";

import {
  // Role,
  User,
  ChatRequest,
  Message,
  // ChatRoom,
  // InitResponse,
  RoomMessage,
  ChatApproved,
  ChatStarted,
  ChatDenied,
  ChatRequestData,
  // ChatHistory,
} from "./types"; // Adjust the path as necessary
// import { RiPlayReverseLine } from "react-icons/ri";
import axios from "axios";
import apiClient from "../../libs/api";
import toast from "react-hot-toast";
import { useWebSpeechTranscript } from "../../hooks/useWebSpeechTranscript";

interface ITabItem {
  title: string; // Title of the tab
  key: string; // Unique key for the tab
}

// Tab items for switching between patient and guest views
const tabItems: ITabItem[] = [
  {
    title: "Patient",
    key: "patient",
  },
  {
    title: "Gäst",
    key: "guest",
  },
];

const API_LOCATION = import.meta.env.VITE_BACKEND_URL;

const RoomPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: roomName } = useParams();
  const [searchParams] = useSearchParams();
  const pathname = location.pathname;
  const receiver_role = searchParams.get("message") as string;
  const receiver = searchParams.get("user") as string;
  const myname = localStorage.getItem("username") || "";

  const [activePanel, setActivePanel] = useState<string>("patient"); // "patient" or "guest"
  const [messageList, setMessageList] = useState<Message[]>([]); // Array of chat messages
  const [activeUser, setActiveUser] = useState<User>({
    sid: "",
    username: "John Doe",
    role: "creator",
  }); // Active chat user
  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Socket.IO states
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [, setLoading] = useState<boolean>(true);
  // const [buttonStatus, setButtonStatus] = useState<boolean>(false);

  const [, setChatRequests] = useState<ChatRequest[]>([]);
  const [roomInfo, setRoomInfo] = useState<any>({});
  const [waitingQueue, setWaitingQueue] = useState<
    { sid: string; username: string; role: string }[]
  >([]);
  const [sessionTranscript, setSessionTranscript] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [consentDocumentation, setConsentDocumentation] = useState(false);
  const [visibleToPatient, setVisibleToPatient] = useState(false);
  const speech = useWebSpeechTranscript("sv-SE");

  // Function to handle tab click
  const handleTabItemClick =
    (tabItem: { title: string; key: string }) => () => {
      setActivePanel(tabItem.key);
      navigate(`${pathname}?${new URLSearchParams({ message: tabItem.key })}`);
      setActiveUser({
        sid: "",
        username: activeUser.username,
        role: tabItem.key === "patient" ? "patient" : "guest",
      });
    };

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  // Function to send messages
  const sendMessage = () => {
    // Role-based restriction
    if (activeUser.role === "guest" && activePanel === "patient") {
      alert("Guests can't chat directly with patients.");
      return;
    }

    // Check if the message is not empty
    if (message.trim() === "") {
      // alert("Message cannot be empty");
      return;
    }

    // Create a new message object
    const newMessage: Message = {
      from: myname,
      to: receiver,
      role: receiver_role,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    // Update the message list state
    if (receiver == null) alert("Select one user for chat...");
    else setMessageList((prevList) => [...prevList, newMessage]);
    // Emit the message via Socket.IO
    if (socketInstance) {
      socketInstance.emit("room_message", {
        room_id: roomName,
        to: receiver,
        role: receiver_role,
        message: message.trim(),
      });
    }

    // Clear the input field
    setMessage("");
  };

  // Socket initialization
  useEffect(() => {
    const staffToken = localStorage.getItem("token") || "";
    const socket: Socket = io(API_LOCATION, {
      path: "/socket.io/",
      transports: ["websocket"],
      auth: staffToken ? { token: staffToken } : {},
    });

    // Set the socket instance
    setSocketInstance(socket);

    // Emit 'init' event upon connection
    socket.on("connect", () => {
      setLoading(false);
      setActiveUser((prevUser) => ({
        ...prevUser,
        sid: socket.id ? socket.id : "",
      }));
      socket.emit("init", {
        username: myname,
        role: "creator",
        roomName: roomName,
        token: staffToken || undefined,
      });
    });

    // Listen for 'init_response'
    // socket.on("init_response", (data: InitResponse) => {
    //   setAllUsers(data.users);
    // });

    // Listen for 'user_disconnected'
    // socket.on(
    //   "user_disconnected",
    //   (data: { sid: string; username: string }) => {
    //     setAllUsers((prevUsers) =>
    //       prevUsers.filter((user) => user.sid !== data.sid)
    //     );
    //     // Optionally, remove messages from messageList if necessary
    //   }
    // );

    // Listen for 'room_message'
    // socket.on("room_message", (data: RoomMessage) => {
    //   const { room, from, to, role, message, timestamp } = data;
    //   const newMessage: Message = {
    //     from: from === socket.id ? "me" : from,
    //     to: receiver,
    //     role: role,
    //     message,
    //     timestamp,
    //     // role: activeUser.role,
    //   };
    //   setMessageList((prevList) => [...prevList, newMessage]);
    // });

    // Listen for 'chat_approved' and 'chat_started' to handle room creation
    socket.on("chat_approved", (data: ChatApproved) => {
      const { room_id, patient_sid, guest_sid } = data;
      console.log(
        `Chat approved: Room ID ${room_id} between ${patient_sid} and ${guest_sid}`
      );
      // Optionally, set activeUser based on the role
      const target_sid =
        activeUser.role === "creator" ? patient_sid : guest_sid;
      setActiveUser((prevUser) => ({ ...prevUser, sid: target_sid }));
      // Join the room
      socket.emit("join_room", { room_id });
      // Fetch chat history
      socket.emit("get_chat_history", { room_id });
    });

    socket.on("chat_started", (data: ChatStarted) => {
      const { room_id, guest_sid } = data;
      console.log(`Chat started: Room ID ${room_id} with ${guest_sid}`);
      setActiveUser((prevUser) => ({ ...prevUser, sid: guest_sid }));
      // Join the room
      socket.emit("join_room", { room_id });
      // Fetch chat history
      socket.emit("get_chat_history", { room_id });
    });

    // Listen for 'chat_denied'
    socket.on("chat_denied", (data: ChatDenied) => {
      alert(data.msg);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection Error:", error);
      setLoading(false);
      // Optionally, notify the user about the connection issue
    });

    socket.on(
      "waiting_room_update",
      (data: { room_name?: string; queue?: { sid: string; username: string; role: string }[] }) => {
        if (data.room_name === roomName) {
          setWaitingQueue(data.queue || []);
        }
      }
    );

    // Listen for 'chat_request' (Room Creator only)
    if (activeUser.role === "creator") {
      socket.on("chat_request", (data: ChatRequestData) => {
        console.log("Received chat request:", data);
        setChatRequests((prev) => [...prev, data]);
      });
    }

    // Listen for 'chat_history'
    // socket.on("chat_history", (data: ChatHistory) => {
    //   const { room_id, messages } = data;
    //   const formattedMessages: Message[] = messages.map((msg) => ({
    //     from: msg.sender_id === socket.id ? "me" : msg.sender_id,
    //     message: msg.message,
    //     timestamp: msg.timestamp,
    //     role: activeUser.role,
    //   }));
    //   setMessageList(formattedMessages);
    // });

    // Cleanup on component unmount or buttonStatus change
    return () => {
      socket.disconnect();
      setSocketInstance(null);
      setLoading(true);
    };
  }, []);

  // Display received message

  useEffect(() => {
    if (socketInstance) {
      const handleNewMessage = (data: RoomMessage) => {
        const { from, message, to, timestamp } = data;
        const newMessage: Message = {
          from: from === myname ? "me" : from,
          to: to,
          message,
          timestamp,
          role: activeUser.role,
        };
        if (to == "creator")
          setMessageList((prevList) => [...prevList, newMessage]);
      };
      socketInstance.on("room_message", handleNewMessage);
      return () => {
        socketInstance.off("room_message", handleNewMessage);
      };
    }
  }, [socketInstance, messageList]);

  // useEffect(() => {
  //   if (socketInstance) {
  //     socketInstance.on("room_message", (data: RoomMessage) => {
  //       const { from, message, to, timestamp } = data;
  //       console.log('messagedata', data, 'myname', myname, from, to)
  //       const newMessage: Message = {
  //         from: from === socketInstance.id ? "me" : from,
  //         to: to,
  //         message,
  //         timestamp,
  //         role: activeUser.role,
  //       };
  //       if (from != myname)
  //         console.log('altered')
  //         setMessageList((prevList) => [...prevList, newMessage]);
  //       console.log(messageList)
  //     });
  //   }
  // }, [socketInstance]);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await axios.post(
          `${API_LOCATION}/api/room/fetch_room_data`,
          {
            roomName,
          }
        );
        setRoomInfo(response.data?.data ?? response.data);
      } catch (err: any) {
        console.log("Error in fetching room data", err);
      }
    };

    fetchRoomData();
  }, [roomName]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  // buttonStatus, activeUser.username, activeUser.role, activeUser.sid

  // const [allUsers, setAllUsers] = useState<User[]>([]); // List of all connected users

  return (
    <>
      <motion.div
        className="w-full h-full flex gap-x-4 text-primary-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left panel containing call controls and chat */}
        <div className="grow pt-2 h-full flex flex-col gap-y-4">
          <div className="py-2 flex justify-between items-center">
            {/* Back button to navigate to rooms */}
            <div
              className="flex gap-2 items-center cursor-pointer"
              onClick={() => {
                navigate("/rooms");
              }}
            >
              <span className="w-6 h-6 flex items-center justify-center">
                <FaChevronLeft />
              </span>
              <p className="text-xl leading-6">Tillbaka</p>
            </div>

            {/* Room title and date */}
            <div className="flex flex-col items-end gap-y-1">
              <p className="font-bold text-xl leading-5 text-primary-background">
                {roomInfo?.patient_name || roomName || "Room"}
              </p>
              <p className="text-sm leading-4">2 Mars, 2024</p>
            </div>
          </div>

          {roomName && waitingQueue.length > 0 && socketInstance && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col gap-2">
              <p className="text-sm font-semibold text-amber-900">Waiting room</p>
              <ul className="flex flex-col gap-2">
                {waitingQueue.map((w) => (
                  <li
                    key={w.sid}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span>
                      {w.username} ({w.role})
                    </span>
                    <span className="flex gap-1">
                      <button
                        type="button"
                        className="px-2 py-1 rounded bg-primary-background text-white text-xs"
                        onClick={() =>
                          socketInstance.emit("admit_waiting", {
                            roomName: roomName as string,
                            targetSid: w.sid,
                          })
                        }
                      >
                        Admit
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 rounded bg-light-background text-xs"
                        onClick={() =>
                          socketInstance.emit("reject_waiting", {
                            roomName: roomName as string,
                            targetSid: w.sid,
                          })
                        }
                      >
                        Reject
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white rounded-lg p-4 flex flex-col gap-2 border border-primary-border/15">
            <p className="text-sm font-bold text-primary-background">Dokumentation efter samtal (AI)</p>
            <p className="text-xs text-disabled-text">
              Klistra in utskrift eller anteckningar. Web Speech (Chrome) är ett stöd — för produktion rekommenderas
              server-STT. Rapporter sparas som Markdown och PDF i ditt arkiv (mapp meetings_ai).
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              {speech.supported ? (
                <button
                  type="button"
                  className="px-3 py-1 rounded-lg border border-primary-border text-sm"
                  onClick={() => {
                    if (speech.listening) speech.stop();
                    else
                      speech.start((chunk) =>
                        setSessionTranscript((t) => t + chunk)
                      );
                  }}
                >
                  {speech.listening ? "Stoppa diktering" : "Starta diktering (webbläsare)"}
                </button>
              ) : (
                <span className="text-xs text-disabled-text">Web Speech stöds inte i denna webbläsare.</span>
              )}
            </div>
            <textarea
              className="w-full min-h-[100px] rounded-lg border border-primary-border/25 p-2 text-sm"
              value={sessionTranscript}
              onChange={(e) => setSessionTranscript(e.target.value)}
              placeholder="Transkript eller anteckningar…"
            />
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={consentDocumentation}
                onChange={(e) => setConsentDocumentation(e.target.checked)}
              />
              Jag bekräftar att vårdnadshavare/patient informerats om AI-stödd dokumentation enligt policy.
            </label>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={visibleToPatient}
                onChange={(e) => setVisibleToPatient(e.target.checked)}
              />
              Visa sammanfattning i patientportalen (kräver personnummer på rummet)
            </label>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                disabled={aiBusy || !sessionTranscript.trim()}
                className="px-4 py-2 rounded-lg bg-light-background text-primary-text text-sm disabled:opacity-40"
                onClick={async () => {
                  setAiBusy(true);
                  try {
                    const pid = roomInfo?.patient_personal_id || "";
                    await apiClient.post("/api/meeting_ai/transcript", {
                      room_name: roomName,
                      transcript: sessionTranscript,
                      patient_personal_id: pid || undefined,
                    });
                    toast.success("Klassisk AI-kö — se aviseringar");
                  } catch {
                    toast.error("Kunde inte köa (meeting_ai)");
                  } finally {
                    setAiBusy(false);
                  }
                }}
              >
                Köa (äldre flöde)
              </button>
              <button
                type="button"
                disabled={aiBusy || !sessionTranscript.trim()}
                className="px-4 py-2 rounded-lg bg-primary-background text-white text-sm disabled:opacity-40"
                onClick={async () => {
                  setAiBusy(true);
                  try {
                    const pid = roomInfo?.patient_personal_id || "";
                    await apiClient.post("/api/meetings_ai/generate", {
                      room_name: roomName,
                      transcript: sessionTranscript,
                      patient_personal_id: pid || undefined,
                      consent_documentation: consentDocumentation,
                      visible_to_patient: visibleToPatient,
                      async: false,
                    });
                    toast.success("Klinisk rapport sparad (MD + PDF)");
                    try {
                      await apiClient.post("/api/meetings_ai/transcript", {
                        room_name: roomName,
                        transcript: sessionTranscript,
                        source: "pre_generate",
                      });
                    } catch {
                      /* optional audit copy */
                    }
                  } catch (e: unknown) {
                    const err = e as { response?: { data?: { error?: string } } };
                    if (err?.response?.data?.error === "consent_documentation must be true") {
                      toast.error("Kryssa i samtycke för dokumentation.");
                    } else {
                      toast.error("Kunde inte generera rapport");
                    }
                  } finally {
                    setAiBusy(false);
                  }
                }}
              >
                {aiBusy ? "Arbetar…" : "Generera klinisk rapport (Phase 3)"}
              </button>
            </div>
          </div>

          {/* Video call component with share functionality */}
          <RoomCall className="grow" onShare={() => setShareDialogOpen(true)} />

          {/* Chat and files sections */}
          <div className="grid grid-cols-2 gap-4">
            {/* Chat section with patient */}
            <div className="bg-white rounded-lg p-4 flex flex-col gap-2">
              <div className="pb-2 border-b-2 border-b-light-background">
                <p className="text-xl leading-6 font-bold">Chatt med patient</p>
              </div>
              <ul className="list-disc pl-5 py-5 text-primary-text/50">
                <li>Tillgång till patient chatt</li>
                <li>Förmåga att skriva AI-prompt</li>
              </ul>
              <div className="flex gap-2 justify-end">
                {/* Buttons for chat actions */}
                <button className="rounded-lg bg-[#374151] text-[#E9E9F3] w-8 h-8">
                  L
                </button>
                <button className="rounded-lg bg-[#374151] text-[#E9E9F3] w-8 h-8">
                  A
                </button>
                <button className="rounded-lg bg-[#374151] text-[#E9E9F3] w-8 h-8">
                  S
                </button>
                <button className="rounded-lg bg-white text-[#B6C2E1] w-8 h-8 text-2xl border-[#B6C2E1] border">
                  +
                </button>
              </div>
            </div>

            {/* Files section related to patient */}
            <div className="bg-white rounded-lg p-5 flex flex-col gap-2">
              <div className="pb-2 border-b-2 border-b-light-background">
                <p className="text-xl leading-6 font-bold">Filer av patient</p>
              </div>
              <ul className="list-disc pl-5 py-5 text-primary-text/50">
                <li>Gäst kan se patientfiler</li>
                <li>Gäst kan lägga till filer och se patientinformation</li>
              </ul>
              <div className="flex gap-2 justify-end">
                {/* Buttons for file actions */}
                <button className="rounded-lg bg-[#374151] text-[#E9E9F3] w-8 h-8">
                  L
                </button>
                <button className="rounded-lg bg-white text-[#B6C2E1] w-8 h-8 text-2xl border-[#B6C2E1] border">
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel for tab controls and chat messages */}
        <div className="p-2 flex flex-col gap-2.5 bg-white rounded-2xl w-80">
          {/* Tab controls for switching between patient and guest views */}
          <div className="p-2 grid grid-cols-2 gap-x-2 bg-[#E9E9F3] rounded-xl font-bold text-lg">
            {tabItems.map((tabItem, index) => (
              <button
                key={index}
                className={twMerge(
                  "p-2 flex-1 flex items-center justify-center gap-2",
                  activePanel === tabItem.key &&
                    "bg-white rounded-xl text-primary-background"
                )}
                onClick={handleTabItemClick(tabItem)}
              >
                <p>{tabItem.title}</p>
                {tabItem.key === "guest" && (
                  <span className="rounded-lg text-white px-2 py-0 font-thin text-base bg-primary-background">
                    {receiver ? (
                      receiver_role === "geust" ? (
                        receiver.charAt(0).toUpperCase()
                      ) : (
                        <></>
                      )
                    ) : (
                      <></>
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Display chat messages */}
          <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto">
            {messageList
              .filter((msg) => {
                // Adjust filters based on role and active panel
                if (receiver_role !== msg.role) {
                  return false;
                }
                // if (
                //   (msg.from === myname && msg.to === receiver) ||
                //   (msg.from === receiver && msg.to === "creator")
                // )
                if (msg.from === myname || msg.to === "creator") return true;
              })
              .map((msg, index) => (
                <ChatItem
                  key={index}
                  name={msg.from === myname ? "Me" : msg.from}
                  role={msg.from === myname ? "me" : msg.role}
                  content={msg.message}
                  // timestamp={msg.timestamp}
                />
              ))}
          </div>

          {/* Input field for sending messages */}
          <div className="flex gap-2 m-2">
            <Input
              name="message"
              dataTestId="room-chat-input"
              value={message}
              placeholder="Skriv ett meddelande"
              className="flex-1 h-12 px-5 !py-[12.5px] bg-light-background border-none text-base"
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <ActionButton
              data-testid="room-chat-send"
              className="bg-primary-background"
              onClick={sendMessage}
            >
              <SendSVG />
            </ActionButton>
          </div>
        </div>
      </motion.div>

      {/* Dialog for sharing options */}
      <ShareDialog
        open={shareDialogOpen}
        animation={"to-left"}
        onClose={() => setShareDialogOpen(false)}
      />
    </>
  );
};

export default RoomPage;
