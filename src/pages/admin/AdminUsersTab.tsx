import { useEffect, useState } from "react";
import Table, { type IColumn, type IRow } from "../../components/common/Table";
import apiClient from "../../libs/api";

const columns: IColumn[] = [
  { name: "user_name", title: "Name", width: 180 },
  { name: "user_email", title: "Email", width: 220 },
  { name: "account_description", title: "Description", width: 280 },
];

function AdminUsersTab() {
  const [rows, setRows] = useState<IRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  useEffect(() => {
    apiClient
      .get(`/api/admins/users?page=${page}&page_size=15`)
      .then((res: unknown) => {
        const r = res as {
          users?: IRow[];
          total_pages?: number;
          total_users?: number;
        };
        setRows(r.users || []);
        setTotalPages(r.total_pages || 1);
        if (typeof r.total_users === "number") setTotalUsers(r.total_users);
      })
      .catch(() => setRows([]));
  }, [page]);

  return (
    <div className="grow py-4 px-7 flex flex-col gap-y-3 bg-white rounded-lg overflow-y-auto">
      <p className="font-semibold text-xl leading-6">Users (doctors)</p>
      <p className="text-sm text-disabled-text">
        From <code className="text-xs bg-light-background px-1 rounded">GET /api/admins/users</code>
        {totalUsers != null ? ` — ${totalUsers} accounts total.` : " — paginated directory (admin JWT required)."}
        Company association is managed per registration.
      </p>
      <Table rows={rows} columns={columns} />
      {totalPages > 1 && (
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            className="px-3 py-1 rounded bg-light-background disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="text-sm py-1">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className="px-3 py-1 rounded bg-light-background disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminUsersTab;
