// src/app/page.tsx

import RecentDataTable from "@/components/dashboard/RecentDataTable";
import { DollarSign, Users, Package, Activity } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      </div>

      <RecentDataTable />
    </div>
  );
}
