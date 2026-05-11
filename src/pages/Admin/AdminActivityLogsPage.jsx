import React from "react";

const logs = [
  {
    id: 1,
    admin: "Admin",
    action: "Updated Slide 7: subtitle",
    time: "34 mins ago",
    type: "update",
  },
  {
    id: 2,
    admin: "Admin",
    action: "Updated Slide 7: subtitle",
    time: "34 mins ago",
    type: "update",
  },
  {
    id: 3,
    admin: "Admin",
    action: "Created Slide 6",
    time: "48 mins ago",
    type: "create",
  },
];

export default function AdminActivityLogsPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Admin Activity Logs
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View all admin actions and recent system changes.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">All Logs</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                    log.type === "create" ? "bg-emerald-500" : "bg-indigo-600"
                  }`}
                >
                  A
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-900">
                    <span className="font-bold">{log.admin}</span>{" "}
                    {log.action}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
