import { twMerge } from "tailwind-merge";
import "../../pages/room/MeetingComponents/index.css";
import MeetingRoom from "./MeetingRoom";
import { MeetingContext } from "../../MeetingContext";
import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Define props for the RoomCall component
interface RoomCallProps {
  className?: string; // Optional className for additional styling
  onShare: () => void; // Callback function for the share action
}

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

function RoomCall({ className = "", onShare }: RoomCallProps) {
  const [meetingJoined, setMeetingJoined] = useState(false);
  const [username, setUsername] = useState("");
  const [micShared, setMicShared] = useState(false);
  const [cameraShared, setCameraShared] = useState(false);
  const [screenShared, setScreenShared] = useState(false);
  const [meetingEnded, setMeetingEnded] = useState(false);
  const [roomName, setRoomName] = useState<string>("");
  const [meetingInfo, setMeetingInfo] = useState<any>({});
  // const [role, setRole] = useState<"creator" | "participant">("participant");

  const [remoteTracks, setRemoteTracks] = useState<TrackItem[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Participant[]>([]);
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(
    null
  );

  const navigate = useNavigate();

  if (meetingEnded && meetingJoined) {
    onShare;
  }

  const meteredMeeting = useContext(MeetingContext);

  // const location = useLocation();
  // const state = location.state;

  const roomname = localStorage.getItem("roomName") || "";
  const user_name = localStorage.getItem("username") || "";

  useEffect(() => {
    handleJoinMeeting(roomname, user_name);
    setMeetingJoined(true);
  }, []);

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
      if (participant) {
      }
      // Handle participant left
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

  const endMeeting = async () => {
    const response = await axios.get(
      `${API_LOCATION}/api/room/end?roomName=${roomName}`
    );
    if (response) {
    }
  }

  useEffect(() => {
    const handleParticipantLeft = (participantInfo: any) => {
      console.log("participant had left the room", participantInfo);
    };

    const handleParticipantJoined = (participantInfo: any) => {
      console.log("participant had joined the room", participantInfo);
    };

    const handleStateChanged = (meetingState: any) => {
      console.log("meeting state changed", meetingState);
    };

    const handleMeetingLeft = (_meetingState: any) => {
      endMeeting();
      navigate('/');
    };

    meteredMeeting.on("participantLeft", handleParticipantLeft);
    meteredMeeting.on("participantJoined", handleParticipantJoined);
    meteredMeeting.on("stateChanged", handleStateChanged);
    meteredMeeting.on("meetingLeft", handleMeetingLeft);
    return () => {
      meteredMeeting.removeListener("participantLeft", handleParticipantLeft);
      meteredMeeting.removeListener("participantJoined", handleParticipantJoined);
      meteredMeeting.removeListener("stateChanged", handleStateChanged);
      meteredMeeting.removeListener("meetingLeft", handleMeetingLeft);
    };
  });

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

        // Calling the join() of Metered SDK
        const joinResponse = await meteredMeeting.join({
          name: 'creator',
          roomURL: `${METERED_DOMAIN}/${roomName}`,
        });

        const joinResponseToBackend = await axios.get(
          `${API_LOCATION}/api/room/join?roomName=${roomName}`
        );

        if (joinResponseToBackend) {
        }

        setUsername(username);
        setRoomName(roomName);
        setMeetingInfo(joinResponse);
        setMeetingJoined(true);
      } else {
        alert("Invalid roomName");
      }
    } catch (error) {
      console.error("Error joining meeting:", error);
      alert("An error occurred while joining the meeting. Please try again.");
    }
  }

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
      navigate('/');
    } else {
      await meteredMeeting.stopVideo();
      setCameraShared(false);
      setScreenShared(false);
    }
  };

  const handleLeaveBtn = async (): Promise<void> => {
    await meteredMeeting.leaveMeeting();
    
    const response = await axios.get(
      `${API_LOCATION}/api/room/end?roomName=${roomName}&userName=${username}&role=creator`
    );
    if (response) {
    }
    setMeetingEnded(true);
  };

  return (
    <div
      className={twMerge(
        "relative w-full h-full rounded-lg overflow-hidden", // Container with relative positioning and full width
        className // Apply additional styles from props
      )}
    >
      <div className="h-full" id="roomview">
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
    </div>
  );
}

export default RoomCall;
