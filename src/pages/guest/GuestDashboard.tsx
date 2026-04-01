import { useContext, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

import TradeMark from "../../components/user/TradeMark";
import ActionButton from "../../components/common/ActionButton";
import Avatar from "../../components/common/Avatar";
import Input from "../../components/common/Input";
import ReportDialog from "../../components/dashboard/ReportDialog";
import SignOutButton from "../../components/layout/header/SignOutButton";
import Button from "../../components/common/Button";
import ChatItem from "../room/components/ChatItem";

import SendSVG from "../../assets/send.svg?react";
// import DocIcon from "/images/report/doc.svg";
// import PdfIcon from "/images/report/pdf.svg";
import { io, Socket } from "socket.io-client";

import MeetingRoom from "../../components/room/MeetingRoom";
import { MeetingContext } from "../../MeetingContext";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import {
  // Role,
  User,
  // ChatRequest,
  Message,
  // ChatRoom,
  InitResponse,
  RoomMessage,
  ChatApproved,
  ChatStarted,
  ChatDenied,
  // ChatRequestData,
  // ChatHistory,
} from "../room/types";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getRoomToken } from "../../lib/roomToken";

const API_LOCATION = import.meta.env.VITE_BACKEND_URL;

interface TrackItem {
  streamId: string;
  track: MediaStreamTrack;
  type: "audio" | "video";
  participantSessionId: string;
}

interface Participant {
  _id: string;
  name: string;
}

function GuestDashboard() {
  const [isFilePanelActive, setFilePanelActive] = useState<boolean>(false); // State to manage file panel visibility
  const [isChatPanelActive, setChatPanelActive] = useState<boolean>(false); // State to manage chat panel visibility
  const [isReportDialogOpen, setReportDialogOpen] = useState<boolean>(false); // State to manage report dialog visibility
  const [micShared, setMicShared] = useState(false);
  const [cameraShared, setCameraShared] = useState(false);
  const [screenShared, setScreenShared] = useState(false);
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(
    null
  );
  const [, setMeetingEnded] = useState(false);
  const [remoteTracks, setRemoteTracks] = useState<TrackItem[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Participant[]>([]);
  const [meetingInfo, setMeetingInfo] = useState<any>({});
  const [, setMeetingJoined] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const [searchParams] = useSearchParams();
  const roomName = searchParams.get("roomname") as string;
  const username = searchParams.get("username") as string;
  const navigate = useNavigate();
  const meteredMeeting = useContext(MeetingContext);

  const handleMicBtn = async (): Promise<void> => {
    if (micShared) {
      await meteredMeeting.stopAudio();
      setMicShared(false);
    } else {
      await meteredMeeting.startAudio();
      setMicShared(true);
    }
  };

  const handleCameraBtn = async (): Promise<void> => {
    if (cameraShared) {
      await meteredMeeting.stopVideo();
      setLocalVideoStream(null);
      setCameraShared(false);
    } else {
      await meteredMeeting.startVideo();
      const stream = await meteredMeeting.getLocalVideoStream();
      setLocalVideoStream(stream);
      setCameraShared(true);
    }
  };

  const handleScreenBtn = async (): Promise<void> => {
    if (!screenShared) {
      await meteredMeeting.startScreenShare();
      setScreenShared(true);
    } else {
      await meteredMeeting.stopVideo();
      setCameraShared(false);
      setScreenShared(false);
    }
  };

  const handleLeaveBtn = async (): Promise<void> => {
    await meteredMeeting.leaveMeeting();

    const response = await axios.get(
      `${API_LOCATION}/api/room/leave?roomName=${roomName}&userName=${username}&role=guest`
    );
    if (response.status === 200) {
      console.log("left meeting");
    } else {
      console.log("error leaving meeting");
    }
    setMeetingEnded(true);

    // Redirect to guest sign-in page
    window.location.href = "/auth/guest-signin";
  };

  async function handleJoinMeeting(roomName: string, username: string) {
    roomName = roomName.trim();

    try {
      // Calling API to validate the roomName
      const response = await axios.get<{ roomFound: boolean }>(
        `${API_LOCATION}/api/room/validate-meeting?roomName=${roomName}`
      );
      if (response.data.roomFound) {
        // Calling API to fetch Metered Domain
        const { data } = await axios.get<{ METERED_DOMAIN: string }>(
          `${API_LOCATION}/api/room/metered-domain`
        );
        // Extracting Metered Domain from response
        const METERED_DOMAIN = data.METERED_DOMAIN;
        const role = "guest";
        // Calling the join() of Metered SDK
        const joinResponse = await meteredMeeting.join({
          name: role,
          roomURL: `${METERED_DOMAIN}/${roomName}`,
        });

        const joinResponseToBackend = await axios.get(
          `${API_LOCATION}/api/room/join?roomName=${roomName}&userName=${username}&role=${role}`
        );

        const uuid = joinResponseToBackend.data.uuid;
        if (uuid) {
        }
        // setUsername(username);
        // setRoomName(roomName);
        setMeetingInfo(joinResponse);
        setMeetingJoined(true);

        return true;
      } else {
        alert("Invalid roomName");
      }
    } catch (error) {
      console.error("Error joining meeting:", error);
      alert("An error occurred while joining the meeting. Please try again.");
    }
    return false;
  }

  useEffect(() => {
    const handleRemoteTrackStarted = (trackItem: TrackItem) => {
      setRemoteTracks((prevTracks) => [...prevTracks, trackItem]);
    };

    const handleRemoteTrackStopped = (trackItem: TrackItem) => {
      setRemoteTracks((prevTracks) =>
        prevTracks.filter((track) => track.streamId !== trackItem.streamId)
      );
    };

    const hanldeParticipantJoined = (participant: Participant) => {
      if (participant) {
      }
    };

    const handleParticipantLeft = (participant: Participant) => {
      // Handle participant left
      console.log("participant left", participant);
      if (participant) {
        if (participant.name === "creator") {
          alert("creator left the room");
          navigate("/auth/guest-signin");
        }
      }
    };

    const handleOnlineParticipants = (onlineParticipants: Participant[]) => {
      setOnlineUsers(onlineParticipants);
    };

    const handleLocalTrackUpdated = (item: TrackItem) => {
      const stream = new MediaStream([item.track]);
      setLocalVideoStream(stream);
    };

    const handleMeetingLeft = (item: any) => {
      if (item) {
      }
      alert("meeting left");
    };

    const handleStateChanged = (meetingState: any) => {
      console.log("meeting state changed", meetingState);
    };

    meteredMeeting.on("remoteTrackStarted", handleRemoteTrackStarted);
    meteredMeeting.on("remoteTrackStopped", handleRemoteTrackStopped);
    meteredMeeting.on("participantJoined", hanldeParticipantJoined);
    meteredMeeting.on("participantLeft", handleParticipantLeft);
    meteredMeeting.on("onlineParticipants", handleOnlineParticipants);
    meteredMeeting.on("localTrackUpdated", handleLocalTrackUpdated);
    meteredMeeting.on("meetingLeft", handleMeetingLeft);
    meteredMeeting.on("stateChanged", handleStateChanged);

    return () => {
      meteredMeeting.removeListener("remoteTrackStarted");
      meteredMeeting.removeListener("remoteTrackStopped");
      meteredMeeting.removeListener("participantJoined");
      meteredMeeting.removeListener("participantLeft");
      meteredMeeting.removeListener("onlineParticipants");
      meteredMeeting.removeListener("localTrackUpdated");
      meteredMeeting.removeListener("meetingLeft");
      meteredMeeting.removeListener("stateChanged");
    };
  }, []);

  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [admissionPhase, setAdmissionPhase] = useState<"waiting" | "live" | "denied">("waiting");

  if (allUsers) {
  }

  // Socket initialization
  useEffect(() => {
    if (!roomName?.trim()) {
      return;
    }

    const rt = getRoomToken();
    const socket: Socket = io(API_LOCATION, {
      path: "/socket.io/",
      transports: ["websocket"],
      auth: rt ? { token: rt } : {},
    });

    // Set the socket instance
    setSocketInstance(socket);

    socket.on("connect", () => {
      socket.emit("join_waiting_room", {
        roomName: roomName,
        username: username || "guest",
        role: "guest",
        token: rt || undefined,
      });
    });

    socket.on("admission_granted", async (data: { room_name?: string }) => {
      if (data?.room_name && data.room_name !== roomName) return;
      const ok = await handleJoinMeeting(roomName, username || "guest");
      if (ok) {
        setAdmissionPhase("live");
        socket.emit("init", {
          username: username || "guest",
          role: "guest",
          roomName: roomName,
          token: getRoomToken() || undefined,
        });
      } else {
        toast.error("Could not join the video session. You can stay in the waiting room or refresh.");
      }
    });

    socket.on("admission_denied", (data: { reason?: string }) => {
      setAdmissionPhase("denied");
      toast.error(data?.reason || "Host declined entry");
    });

    // Listen for 'init_response'
    socket.on("init_response", (data: InitResponse) => {
      setAllUsers(data.users);
    });

    // Listen for 'user_disconnected'
    socket.on(
      "user_disconnected",
      (data: { sid: string; username: string }) => {
        setAllUsers((prevUsers) =>
          prevUsers.filter((user) => user.sid !== data.sid)
        );
        // Optionally, remove messages from messageList if necessary
      }
    );

    // Listen for 'chat_approved' and 'chat_started' to handle room creation
    socket.on("chat_approved", (data: ChatApproved) => {
      const { room_id, patient_sid, guest_sid } = data;
      console.log(
        `Chat approved: Room ID ${room_id} between ${patient_sid} and ${guest_sid}`
      );
      // Optionally, set activeUser based on the role

      // Join the room
      socket.emit("join_room", { room_id });
      // Fetch chat history
      socket.emit("get_chat_history", { room_id });
    });

    socket.on("chat_started", (data: ChatStarted) => {
      const { room_id, guest_sid } = data;
      console.log(`Chat started: Room ID ${room_id} with ${guest_sid}`);
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
      // Optionally, notify the user about the connection issue
    });

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
    };
  }, [roomName, username]);

  // Display received message

  useEffect(() => {
    if (socketInstance) {
      const handleNewMessage = (data: RoomMessage) => {
        const { from, message, to, timestamp } = data;
        const self = username || "guest";
        const newMessage: Message = {
          from: from === self ? "me" : from,
          to: "me",
          message,
          timestamp,
          role: "guest",
        };
        if (to === self || to === "guest" || to === username)
          setMessageList((prevList) => [...prevList, newMessage]);
      };
      socketInstance.on("room_message", handleNewMessage);
      return () => {
        socketInstance.off("room_message", handleNewMessage);
      };
    }
  }, [socketInstance]);

  // Function to send messages
  const sendMessage = () => {
    // Check if the message is not empty
    if (message.trim() === "") {
      // alert("Message cannot be empty");
      return;
    }

    // Create a new message object
    const newMessage: Message = {
      from: username,
      to: "creator",
      role: "guest",
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    // Update the message list state
    setMessageList((prevList) => [...prevList, newMessage]);

    // Emit the message via Socket.IO
    if (socketInstance) {
      socketInstance.emit("room_message", {
        room_id: roomName,
        to: "creator",
        role: "guest",
        message: message.trim(),
      });
    }

    // Clear the input field
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!roomName?.trim()) {
    return (
      <div className="p-4 w-full h-full flex flex-col items-center justify-center bg-light-background gap-4">
        <p className="text-primary-text">Missing room in the link. Use the invitation URL from the host.</p>
        <SignOutButton redirectUri="/auth/guest-signin" />
      </div>
    );
  }

  if (admissionPhase === "waiting") {
    return (
      <div className="p-4 w-full h-full flex flex-col items-center justify-center bg-light-background gap-4">
        <TradeMark className="font-extrabold text-[32px] leading-10 !text-primary-background" />
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-basic">
          <p className="font-semibold text-lg text-primary-background">Waiting room</p>
          <p className="text-sm text-disabled-text mt-2">
            The host will admit you to the video session shortly.
          </p>
        </div>
        <SignOutButton redirectUri="/auth/guest-signin" />
      </div>
    );
  }

  if (admissionPhase === "denied") {
    return (
      <div className="p-4 w-full h-full flex flex-col items-center justify-center bg-light-background gap-4">
        <p className="text-primary-text">You were not admitted to this session.</p>
        <SignOutButton redirectUri="/auth/guest-signin" />
      </div>
    );
  }

  return (
    <>
      <div className="p-4 w-full h-full flex flex-col gap-y-2.5 bg-light-background">
        <div className="w-full flex items-center justify-between">
          <TradeMark className="font-extrabold text-[32px] leading-10 !text-primary-background" />
          {/* Notification and sign-out buttons */}
          <div className="flex items-center gap-2">
            <div className="flex gap-x-2 text-xs text-disabled-text items-center px-2">
              Session participants appear after you join.
            </div>
            <div className="p-0.5">
              <SignOutButton redirectUri="/auth/guest-signin" />{" "}
              {/* Button to sign out */}
            </div>
          </div>
        </div>
        <div className="grow flex gap-x-6 overflow-y-auto">
          <div className="flex flex-col justify-end">
            <Avatar uri="/images/guest/avatar.png" />{" "}
            {/* Display guest avatar */}
          </div>
          <div className="grow h-full flex gap-x-2.5">
            <div className="grow flex flex-col gap-y-2">
              <div className="py-2 flex flex-col items-center justify-center">
                <p className="font-semibold text-xl leading-6 text-primary-background">
                  Elsa rum
                </p>
                <p className="text-sm leading-4">2 Mars, 2024</p>
              </div>
              <div className="grow relative p-2.5 w-full flex justify-end rounded-lg overflow-hidden">
                <MeetingRoom
                  handleMicBtn={handleMicBtn}
                  handleCameraBtn={handleCameraBtn}
                  handelScreenBtn={handleScreenBtn}
                  handleLeaveBtn={handleLeaveBtn}
                  localVideoStream={localVideoStream}
                  onlineUsers={onlineUsers}
                  remoteTracks={remoteTracks}
                  username={username}
                  roomName={roomName}
                  meetingInfo={meetingInfo}
                  micShared={micShared}
                  cameraShared={cameraShared}
                  screenShared={screenShared}
                />
              </div>
              <div className="w-full flex gap-x-4">
                <div className="flex-[3] p-4 flex flex-col gap-y-2 bg-white rounded-lg">
                  <p className="pb-2 font-semibold text-xl leading-6 border-b-2 border-b-light-background">
                    Chatt med patient
                  </p>
                  {!isChatPanelActive ? (
                    <div className="pt-14 flex justify-end">
                      <Button
                        size="compress"
                        onClick={() => {
                          setChatPanelActive(true); // Show chat panel
                        }}
                      >
                        Skicka en förfrågan
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="my-auto">
                        <ul
                          style={{ listStyleType: "square" }}
                          className="flex flex-col pl-8 text-primary-text/50"
                        >
                          <li>Tillgång till patient chatt</li>
                          <li>Förmåga att skriva AI-prompt</li>
                        </ul>
                      </div>
                      <div className="px-2 flex justify-end text-xs text-disabled-text">
                        Chat targets load from the live session.
                      </div>
                    </>
                  )}
                </div>
                <div className="flex-[3] p-4 flex flex-col gap-y-2 bg-white rounded-lg">
                  <p className="pb-2 font-semibold text-xl leading-6 border-b-2 border-b-light-background">
                    Filer av patient
                  </p>
                  {!isFilePanelActive ? (
                    <div className="pt-14 flex justify-end">
                      <Button
                        size="compress"
                        onClick={() => {
                          setFilePanelActive(true); // Show file panel
                        }}
                      >
                        Skicka en förfrågan
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="my-auto">
                        <ul
                          style={{ listStyleType: "square" }}
                          className="flex flex-col pl-8 text-primary-text/50"
                        >
                          <li>Gäst kan se patientfiler</li>
                          <li>
                            Gäst kan lägga till filer och se patientinformation
                          </li>
                        </ul>
                      </div>
                      <div className="px-2 flex justify-end text-xs text-disabled-text">
                        Patient list is driven by the host session.
                      </div>
                    </>
                  )}
                </div>
                {isFilePanelActive && (
                  <div className="flex-[5] p-4 flex flex-col gap-y-2 bg-white rounded-lg">
                    <p className="pb-2 font-semibold text-xl leading-6 border-b-2 border-b-light-background">
                      Filer
                    </p>
                    <div className="grow py-4 max-h-[180px] flex flex-col gap-4 pr-4 overflow-y-auto">
                      {/* DOCs report items */}
                      {/* {reportData.map((reportItem: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center cursor-pointer"
                          onClick={() => {
                            setReportDialogOpen(true); // Open report dialog
                          }}
                        >
                          <div className="p-4">
                            <img
                              src={
                                reportItem.type === "doc" ? DocIcon : PdfIcon
                              }
                              alt="Report icon"
                              className="w-12"
                            />
                          </div>
                          <div className="py-2.5 px-4 flex flex-col justify-between">
                            <p className="font-semibold text-xl leading-6">
                              {reportItem.title}
                            </p>
                            {reportItem.lastDate && (
                              <div className="space-y-0.5 text-disabled-text text-sm leading-4">
                                <p>Sista aktiviteten</p>
                                <p>{reportItem.lastDate}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))} */}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-2 h-full flex flex-col gap-2.5 bg-white rounded-2xl w-80 overflow-y-auto">
              <div className="p-2 grid grid-cols-2 gap-x-2 bg-light-background rounded-xl font-bold text-lg">
                <button
                  className={twMerge(
                    "p-2 flex-1 flex items-center justify-center gap-2"
                  )}
                >
                  <p className="font-semibold text-xl leading-6">Användare</p>
                </button>
              </div>

              {/* Chat items */}
              <div className="grow py-4 px-2 flex-1 flex flex-col gap-2.5 overflow-y-auto">
                {messageList.map((msg, index) => (
                  <ChatItem
                    key={index}
                    name={msg.from === username ? "Me" : msg.from}
                    role={msg.from === username ? "me" : msg.role}
                    content={msg.message}
                  // timestamp={msg.timestamp}
                  />
                ))}
              </div>

              <div className="p-2 flex items-center gap-x-2.5">
                <Input
                  name="message"
                  placeholder="Skriva ett meddelande"
                  className="grow h-12 w-12"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <ActionButton
                  className="bg-primary-background"
                  onClick={sendMessage}
                >
                  <SendSVG />
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ReportDialog
        open={isReportDialogOpen}
        onClose={() => {
          setReportDialogOpen(false); // Close report dialog
        }}
        title="Sofia Rapport"
        lastDate="2 Mars, 2024"
        content=""
        fileId=""
        isPdf={false}
      />
    </>
  );
}

export default GuestDashboard;
