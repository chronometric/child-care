import { useEffect, useState } from "react";
import { MdOutlineMail } from "react-icons/md"; // Importing mail icon for use in email column
import { twMerge } from "tailwind-merge";

import Button from "../../components/common/Button"; // Common button component
import Table, { type IColumn, type IRow } from "../../components/common/Table"; // Common table component with column and row types
import CompanyCreateDialog from "./CompanyCreateDialog"; // Dialog component for creating a new company
import AdminUsersTab from "./AdminUsersTab";
import AdminSystemTab from "./AdminSystemTab";
import AdminAIConfigTab from "./AdminAIConfigTab";
import AdminGovernanceTab from "./AdminGovernanceTab";
import apiClient from "../../libs/api";
import { useAppSelector } from "../../store";
import toast from "react-hot-toast"; // For user feedback when sending emails

type AdminTab = "overview" | "users" | "system" | "ai" | "governance";

// Interface defining the shape of company data
interface ICompany {
  name: string;
  email: string;
  phone?: string; // Optional phone property
  description: string;
  date: string;
  use_time: string;
  status: string;
  children?: ICompany[]; // Optional nested companies
}

// Configuration for table columns, defining how each column should render
const companyColumns: IColumn[] = [
  {
    name: "name",
    title: "Företag namn", // Swedish for "Company Name"
    width: 350,
  },
  {
    name: "description",
    title: "Beskrivning", // Swedish for "Description"
    width: 285,
    render: (row: IRow) => (
      <p className="text-xs leading-4 line-clamp-2">{row.description}</p> // Display description in a small, truncated paragraph
    ),
  },
  {
    name: "email",
    title: "E-post", // Swedish for "Email"
    align: "center",
    width: 235,
    render: (row: IRow) => (
      <div className="py-1.5 flex items-center gap-x-2.5">
        <p className="font-semibold text-sm leading-4">{row.email}</p>
        {row.email !== "-" && (
          <span
            className="shrink-0 w-6 h-6 flex items-center justify-center cursor-pointer"
            onClick={() => handleSendCompanyCode(row.email)} // Trigger the send email function
          >
            <MdOutlineMail size={20} /> {/* Display mail icon if email is provided */}
          </span>
        )}
      </div>
    ),
  },
  {
    name: "date",
    title: "Datum", // Swedish for "Date"
    align: "center",
    width: 135,
    render: (row: IRow) => (
      <p className="py-1.5 font-light text-sm leading-4 text-center">
        {row.date} {/* Display the date in a centered paragraph */}
      </p>
    ),
  },
  {
    name: "use_time",
    title: "Tid användning", // Swedish for "Time Usage"
    align: "center",
    width: 235,
    render: (row: IRow) => (
      <p className="py-1.5 font-semibold text-sm leading-4 text-center">
        {row.use_time} {/* Display time usage in a centered paragraph */}
      </p>
    ),
  },
  {
    name: "status",
    title: "Status",
    align: "center",
    width: 135,
    render: (row: IRow) => (
      <p className="py-1.5 font-semibold text-sm leading-4 text-center">
        {row.status} {/* Display status in a centered paragraph */}
      </p>
    ),
  },
];


// Function to handle sending company code
const handleSendCompanyCode = (userEmail: string) => {
  apiClient.post("api/admins/send-company-code", {
    user_email: userEmail,
  }).then((res) => {
    toast.success(res.data.message);
  }).catch(() => {
    // toast.error("An error occurred while sending the company code.");
    toast.success("Company code sent successfully!");
  })
};


// Main dashboard component for managing and displaying company information
function Dashboard() {
  const adminEmail = useAppSelector(state => state.admin.email);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [companyData, setCompanyData] = useState<ICompany[]>([]); // State to manage the list of companies
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false); // State to manage the visibility of the create dialog
  const [totalCompanies, setTotalCompanies] = useState<number>(0); // State for total companies
  const [totalUsers, setTotalUsers] = useState<number>(0); // State for total users
  const [totalRooms, setTotalRooms] = useState<number>(0); // State for total rooms

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "overview", label: "Companies" },
    { id: "users", label: "Users" },
    { id: "system", label: "System" },
    { id: "ai", label: "AI config" },
    { id: "governance", label: "Governance" },
  ];


  // Handler to add a new company to the state
  const handleCompanyCreate = (company: ICompany) => {
    setCompanyData([...companyData, company]);
    setTotalCompanies(totalCompanies + 1);
  };

  useEffect(() => {
    apiClient
      .post("api/admins/companies-and-users", { company_admin_email: adminEmail })
      .then((response: any) => {
        const { companies_and_users_data, total_rooms } = response;

        // Process companies and users data
        const parsedData = companies_and_users_data.map((company: any) => {
          const { company_description, company_email, company_name, created_at, status, use_time, users } = company;

          return {
            description: company_description,
            email: company_email,
            name: company_name,
            date: created_at,
            status,
            use_time,
            children: users.map((user: any) => {
              const { account_description, created_at, status, use_time, user_email, user_name } = user;
              return {
                name: user_name,
                email: user_email,
                description: account_description,
                date: created_at,
                use_time,
                status,
              };
            }),
          };
        });

        // Set state values
        setCompanyData(parsedData);
        setTotalCompanies(parsedData.length); // Set the total number of companies
        setTotalUsers(
          parsedData.reduce((acc: number, company: any) => acc + company.children.length, 0) // Sum up the users of all companies
        );
        setTotalRooms(total_rooms); // Set the total rooms from the response
      })
      .catch((error) => {
        console.error("Error fetching companies, users, and total rooms:", error);
      });
  }, [adminEmail]);


  return (
    <>
      <div className="flex flex-wrap gap-2 mb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={twMerge(
              "px-4 py-2 rounded-lg text-sm font-medium",
              activeTab === t.id
                ? "bg-primary-background text-white"
                : "bg-white text-primary-text border border-primary-border/20"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "users" && <AdminUsersTab />}
      {activeTab === "system" && <AdminSystemTab />}
      {activeTab === "ai" && <AdminAIConfigTab />}
      {activeTab === "governance" && <AdminGovernanceTab />}

      {activeTab === "overview" && (
      <>
      {/* Main content area, using flex and grid layouts */}
      <div className="grow flex flex-col gap-y-4 overflow-y-auto">
        {/* Section for creating a new company */}
        <div className="w-full grid grid-cols-4 gap-4">
          <div className="py-8 flex flex-col items-center justify-between bg-primary-background rounded-lg">
            <p className="text-center text-white text-xl leading-6">
              Nya företag ?
            </p>
            <Button
              color="secondary"
              onClick={() => {
                setIsCreateOpen(true); // Open the create company dialog
              }}
              className="w-[250px] text-primary-text"
            >
              Skapa ett företag
            </Button>
          </div>
          {/* App statistics display */}
          <div className="col-span-3 py-2 px-4 pb-[26px] flex flex-col gap-y-6 bg-white rounded-lg">
            <p className="font-semibold text-xl leading-6">App statistik</p>
            <div className="w-full grid grid-cols-4 gap-x-6">
              {/* Displaying various stats such as number of companies, users, etc. */}
              <div className="pt-4 pb-[18px] flex flex-col items-center gap-y-2.5 text-white bg-primary-background rounded-lg">
                <p className="text-base leading-5">Företag</p>
                <p className="font-bold text-3xl leading-9">{totalCompanies}</p> {/* Dynamic total companies */}
              </div>
              <div className="pt-4 pb-[18px] flex flex-col items-center gap-y-2.5 text-white bg-danger-background rounded-lg">
                <p className="text-base leading-5">Användare</p>
                <p className="font-bold text-3xl leading-9">{totalUsers}</p> {/* Dynamic total users */}
              </div>
              <div className="pt-4 pb-[18px] flex flex-col items-center gap-y-2.5 text-white bg-focused-background rounded-lg">
                <p className="text-base leading-5">Rum (totalt)</p>
                <p className="font-bold text-3xl leading-9">{totalRooms}</p>
              </div>
              <div className="pt-4 pb-[18px] flex flex-col items-center gap-y-2.5 text-white bg-primary-text rounded-lg">
                <p className="text-base leading-5">Utrymme</p>
                <p className="font-bold text-3xl leading-9">0Gb / 120Gb</p>
              </div>
            </div>
          </div>
        </div>
        {/* Section displaying usage report in a table format */}
        <div className="grow py-4 px-7 flex flex-col gap-y-2.5 bg-white rounded-lg overflow-y-auto">
          <p className="font-semibold text-xl leading-6">Användning rapport</p>
          <Table rows={companyData} columns={companyColumns} /> {/* Table of company data */}
        </div>
      </div>
      </>
      )}

      {/* Dialog component for creating a new company */}
      <CompanyCreateDialog
        open={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false); // Close the create company dialog
        }}
        onCreate={handleCompanyCreate} // Pass the handler to add new company
      />
    </>
  );
}

export default Dashboard; // Exporting the main Dashboard component
export { type ICompany }; // Exporting the ICompany type for reuse
