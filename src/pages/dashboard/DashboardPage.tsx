import { Key, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Button from "../../components/common/Button";
//import LastActivityItem from "./components/LastActivityItem";
import Calendar from "../../components/dashboard/Calendar";
import VideoDialog from "../../components/dashboard/VideoDialog";
import ReportDialog from "../../components/dashboard/ReportDialog";

//import MessageIcon from "/Message.svg";
import RoomListItem, { IRoomListItem } from "../../components/room/RoomListItem";
import apiClient from "../../libs/api";
import { useAppSelector } from "../../store";
import { FileFormat, IFileTileItem } from "../../components/folder/FileTileItem";
import { IFileListItem } from "../../components/folder/FileListItem";
import FileReportItem from "../../components/folder/FileReportItem";




const DashboardPage = () => {
  const navigate = useNavigate();
  const userEmail = useAppSelector(state => state.auth.createUser.user_email)
  const [videoDialogOpen, setVideoDialogOpen] = useState<boolean>(false); // State to manage video dialog visibility
  const [reportDialogOpen, setReportDialogOpen] = useState<boolean>(false); // State to manage report dialog visibility
  const [roomData, setRoomData] = useState<any>([]);
  const [docList, setDocList] = useState<any>([]);
  const [reportContent, setReportContent] = useState<string>("");
  const [videoList, setVideoList] = useState<any>([]);
  const [currentVideoLink, setCurrentVideoLink] = useState<string>("");
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [currentFileDate, setCurrentFileDate] = useState<string>("");
  const [currentFileId, setCurrentFileId] = useState<string>("");
  const [isPdf, setIsPdf] = useState<boolean>(false);
  const [meetingsAiReports, setMeetingsAiReports] = useState<
    {
      _id: string;
      room_name: string;
      created_at?: string;
      retention_until?: string;
      pdf_file_id?: string;
      visible_to_patient?: boolean;
    }[]
  >([]);

  const handleFileItemClick =
    (fileItem: IFileListItem | IFileTileItem) => async () => {
      // Check if the file is a PDF
      const isPdf = fileItem.file_type.toLowerCase() === "pdf";
      setIsPdf(isPdf);

      if (fileItem.file_type == "mp4") {
        setCurrentFileDate(
          new Date(fileItem.upload_date).toLocaleDateString("sv-SE", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        );
        setCurrentFileName(fileItem.filename);
        setCurrentVideoLink(`${apiClient.defaults.baseURL}/api/file_system/file/${fileItem.file_id}`);
        setVideoDialogOpen(true);
      } else if (isPdf) {
        // Handle PDF files
        setCurrentFileName(fileItem.filename);
        setCurrentFileDate(
          new Date(fileItem.upload_date).toLocaleDateString("sv-SE", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        );
        setCurrentFileId(fileItem.file_id);
        // Directly fetch and display the PDF
        const pdfUrl = `${apiClient.defaults.baseURL}/api/file_system/file-as-pdf/${fileItem.file_id}`;
        setReportContent(pdfUrl); // Store PDF URL for use in the dialog
        setReportDialogOpen(true);
      } else {
        // Handle non-PDF files using the original XML logic
        setReportDialogOpen(true);
        setCurrentFileName(fileItem.filename);
        setCurrentFileDate(
          new Date(fileItem.upload_date).toLocaleDateString("sv-SE", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        );
        setCurrentFileId(fileItem.file_id);
        apiClient
          .get(`/api/file_system/file-as-xml/${fileItem.file_id}`)
          .then((response: any) => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response, "application/xml");
            const contentText =
              xmlDoc.getElementsByTagName("Content")[0]?.textContent || "";
            setReportContent(contentText);
          });
      }
    };

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await apiClient.post('/api/room/fetch_rooms_data', {
          userEmail
        });
        setRoomData(response);
      } catch (err: any) {
        console.log("Error in fetching room data", err);
      }
    };

    fetchRoomData();
  }, []);

  useEffect(() => {
    apiClient.get('api/file_system/list-documents')
      .then((response: any) => {
        setDocList(response);
      })
  }, [])

  useEffect(() => {
    apiClient.get('api/file_system/list-videos').then((response: any) => {
      console.log('list-videos', response)
      setVideoList(response);
    })
  }, [])

  useEffect(() => {
    apiClient
      .get("/api/meetings_ai/reports")
      .then((rows: unknown) => {
        setMeetingsAiReports(Array.isArray(rows) ? rows : []);
      })
      .catch(() => setMeetingsAiReports([]));
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full flex flex-col gap-y-4 text-primary-text"
      >
        {/* Container for the grid layout */}
        <div className="grid grid-cols-4 gap-4">
          {/* Section for displaying last activities */}
          <div className="rounded-xl bg-white p-4 pr-1.5 flex flex-col h-full overflow-y-auto">
            <div className="text-lg font-bold text-[#374151]">
              Sista aktiviteten
            </div>
            <div className="flex-1 pr-2 my-5 flex flex-col h-auto">
              {/* Render each activity item */}
              {/* {activityData.map((activity, index) => (
                <LastActivityItem
                  key={index}
                  title={activity.title}
                  imageUri={activity.imageUri}
                  activity={activity.activity}
                />
              ))} */}
              {roomData.length > 0 && roomData.slice(0, 2).map((room: IRoomListItem, index: Key | null | undefined) => (
                <RoomListItem key={index} room={room} room_name={0} />
              ))}
            </div>
            {/* Button to view more details */}
            <div className="flex justify-end">
              <Button size="compress" onClick={() => { navigate(`/rooms`); }}>Läs mer</Button>
            </div>
          </div>

          {/* Calendar section */}
          <Calendar className="col-span-3 h-full" />
        </div>

        <div className="rounded-xl bg-white p-4 flex flex-col gap-2 border border-primary-border/10">
          <div className="text-lg font-bold text-primary-text">
            Kliniska sessionsrapporter (AI)
          </div>
          <p className="text-xs text-disabled-text">
            Senaste rapporter från Phase 3 (Markdown + PDF i arkivet). Öppna PDF för att läsa.
          </p>
          {meetingsAiReports.length === 0 ? (
            <p className="text-sm text-disabled-text py-2">Inga rapporter ännu — generera efter ett rumssamtal.</p>
          ) : (
            <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {meetingsAiReports.map((r) => (
                <li
                  key={r._id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary-border/15 px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-semibold text-primary-text">{r.room_name}</span>
                    {r.created_at ? (
                      <span className="text-xs text-disabled-text ml-2">
                        {new Date(r.created_at).toLocaleString("sv-SE")}
                      </span>
                    ) : null}
                    {r.visible_to_patient ? (
                      <span className="ml-2 text-xs text-focused-background">Synlig patient</span>
                    ) : null}
                  </div>
                  {r.pdf_file_id ? (
                    <a
                      href={`${apiClient.defaults.baseURL}/api/file_system/file/${r.pdf_file_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-primary-background underline"
                    >
                      Öppna PDF
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 grow overflow-y-auto">
          {/* Room list section */}
          <div className="rounded-xl bg-white p-4 pr-2 h-full overflow-y-auto flex flex-col">
            <div className="flex flex-col gap-y-2.5 grow overflow-y-auto">
              <div className="text-lg font-bold text-primary-text">
                Rum lista
              </div>
              <div className="grow flex flex-col overflow-y-auto pt-4 pr-2">
                {roomData.map((room: IRoomListItem, index: Key | null | undefined) => (
                  <RoomListItem key={index} room={room} room_name={0} />
                ))}
              </div>
              {/* Button to add a new room */}
              <div className="pt-7 self-end">
                <Button
                  size="compress"
                  onClick={() => {
                    navigate("/room/create/onboarding"); // Navigate to room creation page
                  }}
                >
                  Lägg till rum
                </Button>
              </div>
            </div>
          </div>

          {/* Video reports section */}
          <div className="rounded-xl bg-white p-4 pr-2 h-full overflow-y-auto flex flex-col">
            <div className="flex flex-col gap-y-2.5 grow overflow-y-auto">
              <div className="text-lg font-bold text-primary-text">
                Video rapport
              </div>
              <div className="grow flex flex-col overflow-y-auto pt-4 pr-2">
                {/* Render each video item */}
                {videoList.map((video: any, index: number) => (
                  <div
                    key={index}
                    className="p-2 flex items-center gap-x-4 hover:bg-light-background transition duration-300 cursor-pointer rounded-lg"
                    onClick={() => {
                      setCurrentVideoLink(`${apiClient.defaults.baseURL}/api/file_system/file/${video.file_id}`);
                      setVideoDialogOpen(true); // Open video dialog
                    }}
                  >
                    <div className="relative rounded-lg overflow-hidden h-24 w-[200px] shrink-0">
                      <video
                        src={`${apiClient.defaults.baseURL}/api/file_system/file/${video.file_id}`}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full z-0"
                        preload="metadata"
                      >
                        <source src={`${apiClient.defaults.baseURL}/api/file_system/file/${video.file_id}#t=0.1`} type="video/mp4" />
                      </video>
                    </div>
                    <div className="flex flex-col gap-y-1">
                      <p className="font-semibold text-xl leading-6 line-clamp-1">
                        {video.filename}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Button to view more details */}
              <div className="pt-7 self-end">
                <Button size="compress" onClick={() => { navigate(`/files`); }}>Läs mer</Button>
              </div>
            </div>
          </div>

          {/* DOCs reports section */}
          <div className="rounded-xl bg-white py-4 px-7 pr-2 h-full overflow-y-auto flex flex-col">
            <div className="grow flex flex-col gap-y-2.5 overflow-y-auto">
              <div className="text-lg font-bold text-primary-text">
                DOCs rapport
              </div>
              <div className="grow py-4 flex flex-col gap-4 pr-4 overflow-y-auto">
                {/* Render each report item */}
                {docList.map((reportItem: any, index: number) => (
                  <FileReportItem
                    key={index}
                    {...reportItem}
                    file_type={reportItem.file_type as FileFormat}
                    date={reportItem.upload_date as Date}
                    onClick={handleFileItemClick(reportItem)}
                  />
                ))}
              </div>
              {/* Button to view more details */}
              <div className="self-end pt-7">
                <Button size="compress" onClick={() => { navigate(`/files`); }}>Läs mer</Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dialog components for video and report details */}
      <VideoDialog
        open={videoDialogOpen}
        onClose={() => {
          setVideoDialogOpen(false);
        }}
        source={currentVideoLink}
        title={currentFileName}
        date={currentFileDate}
      />
      <ReportDialog
        open={reportDialogOpen}
        onClose={() => {
          setReportDialogOpen(false);
        }}
        content={reportContent}
        title={currentFileName} // Dynamically set the title
        lastDate={currentFileDate} // Dynamically set the created date
        fileId={currentFileId}
        isPdf={isPdf}
      />
    </>
  );
};

export default DashboardPage;
