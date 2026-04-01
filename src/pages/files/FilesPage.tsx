import {
  ChangeEvent,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaPlus } from "react-icons/fa6";
import { useDraggable } from "react-use-draggable-scroll";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import {
  FileFormat,
  IFileListItem,
} from "../../components/folder/FileListItem";
import FileTileItem, {
  IFileTileItem,
} from "../../components/folder/FileTileItem";
import FolderList from "../../components/folder/FolderList";
import ReportDialog from "../../components/dashboard/ReportDialog";
import VideoDialog from "../../components/dashboard/VideoDialog";
import FileListItem from "../../components/folder/FileListItem";
import FileDialog from "../../components/dashboard/FileDialog";
import apiClient from "../../libs/api";

const FilesPage = () => {
  const filesRef = useRef<HTMLDivElement>(null);
  const { events } = useDraggable(filesRef as MutableRefObject<HTMLElement>);

  const [reportDialogOpen, setReportDialogOpen] = useState<boolean>(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState<boolean>(false);
  const [fileDialogOpen, setFileDialogOpen] = useState<boolean>(false);
  const [folderNames, setFolderNames] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>("");
  const [filesOfFolder, setFilesOfFolder] = useState<IFileTileItem[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [latestFiles, setLatestFiles] = useState<IFileListItem[]>([]);
  const [reportContent, setReportContent] = useState<string>("");
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [currentFileDate, setCurrentFileDate] = useState<string>("");
  const [currentVideoLink, setCurrentVideoLink] = useState<string>("");
  const [currentFileId, setCurrentFileId] = useState<string>("");
  const [isPdf, setIsPdf] = useState<boolean>(false);
  /** Optional metadata: shared materials for a patient / room */
  const [uploadPatientId, setUploadPatientId] = useState("");
  const [uploadRoomName, setUploadRoomName] = useState("");
  const [uploadSharedWithPatient, setUploadSharedWithPatient] = useState(false);

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


  const handleNameSubmit = (name: string) => {
    apiClient
      .post("/api/file_system/create-folder", { folder_name: name })
      .then(() => {
        setFolderNames([...new Set([...folderNames, name]).values()]);
      });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!currentFolder) return;
    const files = e.target.files;
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append("folder_name", currentFolder);
      formData.append("file", files[0]);
      if (uploadPatientId.trim())
        formData.append("patient_personal_id", uploadPatientId.trim());
      if (uploadRoomName.trim())
        formData.append("room_name", uploadRoomName.trim());
      formData.append(
        "shared_with_patient",
        uploadSharedWithPatient ? "true" : "false"
      );
      apiClient.post("/api/file_system/upload", formData).then(() => {
        toast.success("Filen har laddats upp.");
        apiClient
          .get(`/api/file_system/list-files?folder_name=${currentFolder}`)
          .then((response: any) => setFilesOfFolder(response));
      });
    }
  };

  useEffect(() => {
    apiClient
      .get(`/api/file_system/list-files?folder_name=${currentFolder}`)
      .then((response: any) => {
        setFilesOfFolder(response);
      });
  }, [currentFolder]);

  useEffect(() => {
    apiClient.get("api/file_system/list-folders").then((response: any) => {
      setFolderNames(response.map((item: any) => item.folder_name));
    });
  }, []);

  useEffect(() => {
    apiClient.get("api/file_system/recent-files").then((response: any) => {
      setLatestFiles(response);
    });
  }, []);

  return (
    <>
      <motion.div
        className="flex gap-x-2.5 h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left panel with folder list */}
        <div className="max-w-[400px] w-full bg-white rounded-xl p-4 flex flex-col gap-y-2.5 overflow-y-auto">
          <p className="text-xl font-semibold">Mapp</p>
          <div className="flex-1 flex flex-col">
            {/* Rendering FolderSelect component with folder names */}
            <FolderList
              folders={folderNames}
              activeFolder={currentFolder}
              onFolderChange={setCurrentFolder}
            />
          </div>
          <div className="flex justify-end">
            {/* Button to create a new folder */}
            <Button
              className="py-2 px-4 flex items-center gap-2 text-base leading-5"
              onClick={() => {
                setFileDialogOpen(true);
              }}
            >
              <span className="w-6 h-6 flex items-center justify-center">
                <FaPlus size={20} />
              </span>
              Skapa ett mapp
            </Button>
          </div>
        </div>

        {/* Right panel with recent files and all files */}
        <div className="p-4 pr-1.5 flex flex-col bg-white rounded-xl overflow-y-auto flex-1">
          <div className="grow pr-2 flex flex-col gap-y-2.5 overflow-x-auto">
            {/* Section for displaying recent files */}
            <div className="flex flex-col gap-y-2.5">
              <p className="text-xl font-semibold">Senaste filer</p>
              <div
                ref={filesRef}
                {...events}
                className="pb-1.5 flex gap-2 overflow-x-auto scrollbar scrollbar-none grow file-max-width"
              >
                {/* Displaying recent FileListItem components */}
                {latestFiles.map((fileItem, index) => (
                  <FileListItem
                    key={index}
                    {...fileItem}
                    // file_type={fileItem.file_type as FileFormat}
                    file_type={fileItem.file_type as FileFormat}
                    onClick={handleFileItemClick(fileItem)}
                  />
                ))}
              </div>
            </div>
            {/* Section for displaying all files */}
            <div className="grow flex flex-col gap-y-2.5 overflow-y-auto relative">
              <p className="text-xl font-semibold">Filer</p>
              <div className="flex flex-col gap-2 pb-2 border-b border-light-background text-sm">
                <p className="text-disabled-text text-xs">
                  Valfritt vid uppladdning: koppla till patient / rum (delat material)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    name="upload_patient_id"
                    placeholder="Patient-ID (personnummer)"
                    value={uploadPatientId}
                    onChange={(e) => setUploadPatientId(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    name="upload_room_name"
                    placeholder="Rum (metered room name)"
                    value={uploadRoomName}
                    onChange={(e) => setUploadRoomName(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={uploadSharedWithPatient}
                    onChange={(e) => setUploadSharedWithPatient(e.target.checked)}
                  />
                  Markera som delat med elev/patient
                </label>
              </div>
              <div className="py-2 pr-2 flex flex-wrap gap-2.5 overflow-y-auto">
                {/* Displaying FileTileItem components */}
                {filesOfFolder.map((fileItem, index) => (
                  <FileTileItem
                    key={index}
                    {...fileItem}
                    file_type={fileItem.file_type as FileFormat}
                    onClick={handleFileItemClick(fileItem)}
                  />
                ))}
              </div>
              <Button
                className="absolute p-2 flex items-center gap-2 text-base leading-5 right-0 bottom-0"
                onClick={() => {
                  fileRef.current && fileRef.current.click();
                }}
              >
                <span className="w-6 h-6 flex items-center justify-center">
                  <FaPlus size={20} />
                </span>
              </Button>
              <input
                ref={fileRef}
                accept=".docx, .xsl, .pdf, .mp4"
                type="file"
                onChange={handleFileChange}
                hidden
              />
            </div>
          </div>
        </div>
      </motion.div>
      {/* Dialogs for reports and videos */}
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
      <VideoDialog
        open={videoDialogOpen}
        onClose={() => {
          setVideoDialogOpen(false);
        }}
        source={currentVideoLink}
        title={currentFileName}
        date={currentFileDate}
      />
      <FileDialog
        open={fileDialogOpen}
        onClose={() => {
          setFileDialogOpen(false);
        }}
        onSubmit={handleNameSubmit}
      />
    </>
  );
};

export default FilesPage;
