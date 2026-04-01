import SignOutButton from "../../components/layout/header/SignOutButton";
import { twMerge } from "tailwind-merge";
import TradeMark from "../../components/user/TradeMark";
import { ChatApproved, ChatDenied, ChatStarted, InitResponse, Message, RoomMessage, User } from "../room/types";
import { useContext, useEffect, useState } from "react";
import ChatItem from "../room/components/ChatItem";
import Input from "../../components/common/Input";
import { useSearchParams } from "react-router-dom";
import ActionButton from "../../components/common/ActionButton";
import SendSVG from "../../assets/send.svg?react";
// import { useSocket } from "../../contexts/SocketContext";
import { MeetingContext } from "../../MeetingContext";
import axios from "axios";
import config from "../../config";
import MeetingRoom from "../../components/room/MeetingRoom";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

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

const API_LOCATION = import.meta.env.VITE_BACKEND_URL;

// Functional component for the Patient Dashboard
function PatientDashboard() {
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");

  const [searchParams] = useSearchParams();
  const roomName = searchParams.get("roomname") as string;

  const [micShared, setMicShared] = useState(false);
  const [cameraShared, setCameraShared] = useState(false);
  const [screenShared, setScreenShared] = useState(false);
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(
    null
  );
  const [meetingEnded, setMeetingEnded] = useState(false);
  const [remoteTracks, setRemoteTracks] = useState<TrackItem[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Participant[]>([]);
  const [meetingInfo, setMeetingInfo] = useState<any>({});
  const [meetingjoined, setMeetingJoined] = useState<boolean>(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  /** Waiting room: host must admit before Metered join */
  const [admissionPhase, setAdmissionPhase] = useState<"waiting" | "live" | "denied">("waiting");

  const navigate = useNavigate();
  if (allUsers) {}
  if (
    meetingEnded ||
    meetingjoined ||
    localVideoStream ||
    remoteTracks ||
    onlineUsers ||
    meetingInfo
  ) {
  }

  // const { socketInstance } = useSocket();
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  useEffect(() => {
    if (!roomName?.trim()) {
      return;
    }

    const socket: Socket = io(API_LOCATION, {
      path: "/socket.io/",
      transports: ["websocket"],
      // Removed 'cors' as it's handled server-side
    });

    // Set the socket instance
    setSocketInstance(socket);

    socket.on("connect", () => {
      socket.emit("join_waiting_room", {
        roomName: roomName,
        username: "patient",
        role: "patient",
      });
    });

    socket.on("admission_granted", async (data: { room_name?: string }) => {
      if (data?.room_name && data.room_name !== roomName) return;
      const ok = await handleJoinMeeting(roomName, "patient");
      if (ok) {
        setAdmissionPhase("live");
        socket.emit("init", {
          username: "patient",
          role: "patient",
          roomName: roomName,
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
  }, [roomName])
  // Socket Initialization
  useEffect(() => {
    if (socketInstance) {
      const handleNewMessage = (data: RoomMessage) => {
        const { from, message, to, timestamp } = data;
        const newMessage: Message = {
          from: from === socketInstance.id ? "me" : from,
          to,
          message,
          timestamp,
          role: "patient",
        };
        if (to == "patient")
          setMessageList((prevList) => [...prevList, newMessage]);
      };
      socketInstance.on("room_message", handleNewMessage);
      return () => {
        socketInstance.off("room_message", handleNewMessage);
      };
    }
  }, [socketInstance, messageList]);

  const sendMessage = () => {
    // Check if the message is not empty
    if (message.trim() === "") {
      // alert("Message cannot be empty");
      return;
    }

    // Create a new message object
    const newMessage: Message = {
      from: "patient",
      to: "creator",
      role: "patient",
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    // Update the message list state
    setMessageList((prevList) => [...prevList, newMessage]);

    // Emit the message via Socket.IO
    if (socketInstance) {
      socketInstance.emit("room_message", {
        room_id: roomName, // Assuming room_id is activeUser.sid; adjust as per backend
        from: "patient",
        to: "creator",
        role: "patient",
        message: message.trim(),
      });
    }

    // Clear the input field
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

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
      `${config.api.endpoint_uri}/api/room/leave?roomName=${roomName}&userName=${"patient"}&role=patient`
    );
    if (response) {
    }
    setMeetingEnded(true);
  };

  async function handleJoinMeeting(roomName: string, username: string) {
    roomName = roomName.trim();

    try {
      // Calling API to validate the roomName
      const response = await axios.get<{ roomFound: boolean }>(
        `${config.api.endpoint_uri}/api/room/validate-meeting?roomName=${roomName}`
      );
      if (response.data.roomFound) {
        // Calling API to fetch Metered Domain
        const { data } = await axios.get<{ METERED_DOMAIN: string }>(
          `${config.api.endpoint_uri}/api/room/metered-domain`
        );
        // Extracting Metered Domain from response
        const METERED_DOMAIN = data.METERED_DOMAIN;

        const role = "patient";
        // Calling the join() of Metered SDK
        const joinResponse = await meteredMeeting.join({
          name: role,
          roomURL: `${METERED_DOMAIN}/${roomName}`,
        });

        
        const joinResponseToBackend = await axios.get(
          `${config.api.endpoint_uri}/api/room/join?roomName=${roomName}&userName=${username}&role=${role}`
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
      console.log('participant left', participant);
      if (participant) {
        if (participant.name === 'creator') {
          alert("creator left the room");
          navigate('/auth/guest-signin');
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

    meteredMeeting.on("remoteTrackStarted", handleRemoteTrackStarted);
    meteredMeeting.on("remoteTrackStopped", handleRemoteTrackStopped);
    meteredMeeting.on("participantJoined", hanldeParticipantJoined);
    meteredMeeting.on("participantLeft", handleParticipantLeft);
    meteredMeeting.on("onlineParticipants", handleOnlineParticipants);
    meteredMeeting.on("localTrackUpdated", handleLocalTrackUpdated);

    return () => {
      meteredMeeting.removeListener("remoteTrackStarted");
      meteredMeeting.removeListener("remoteTrackStopped");
      meteredMeeting.removeListener("participantJoined");
      meteredMeeting.removeListener("participantLeft");
      meteredMeeting.removeListener("onlineParticipants");
      meteredMeeting.removeListener("localTrackUpdated");
    };
  });

  if (!roomName?.trim()) {
    return (
      <div className="p-4 w-full h-full flex flex-col items-center justify-center bg-light-background gap-4">
        <p className="text-primary-text">Missing room link. Open the session URL from your invitation.</p>
        <SignOutButton redirectUri="/auth/patient-signin" />
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
            You are in the queue. The host will admit you to the video session shortly.
          </p>
        </div>
        <SignOutButton redirectUri="/auth/patient-signin" />
      </div>
    );
  }

  if (admissionPhase === "denied") {
    return (
      <div className="p-4 w-full h-full flex flex-col items-center justify-center bg-light-background gap-4">
        <p className="text-primary-text">You were not admitted to this session.</p>
        <SignOutButton redirectUri="/auth/patient-signin" />
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
            
            <div className="p-0.5">
              <SignOutButton redirectUri="/auth/guest-signin" />{" "}
              {/* Button to sign out */}
            </div>
          </div>
        </div>
        <div className="grow flex gap-x-6 overflow-y-auto">          
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
                  username={"patient"}
                  roomName={roomName}
                  meetingInfo={meetingInfo}
                  micShared={micShared}
                  cameraShared={cameraShared}
                  screenShared={screenShared}
                />
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
                    name={msg.from === "patient" ? "Me" : msg.from}
                    role={msg.from === "patient" ? "me" : msg.role}
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
    </>
  );
}

export default PatientDashboard;
