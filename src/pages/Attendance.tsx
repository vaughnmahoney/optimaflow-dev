
import React from "react";
import { Layout } from "@/components/Layout";
import Supervisor from "./Supervisor";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { Link } from "react-router-dom";

// Rename Supervisor content to Attendance content
const Attendance = () => {
  return (
    <Layout
      header={
        <div className="flex justify-between items-center w-full">
          <h1 className="text-2xl font-bold">Attendance Tracking</h1>
          <Link to="/attendance-history">
            <Button variant="outline" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              View History
            </Button>
          </Link>
        </div>
      }
    >
      <Supervisor />
    </Layout>
  );
};

export default Attendance;
