
import React from 'react';
import { Layout } from "@/components/Layout";
import { DiagnosticChart } from "@/components/reports/DiagnosticChart";

const DiagnosticPage = () => {
  return (
    <Layout title="Data Flow Diagnostics">
      <div className="space-y-6">
        <DiagnosticChart />
      </div>
    </Layout>
  );
};

export default DiagnosticPage;
