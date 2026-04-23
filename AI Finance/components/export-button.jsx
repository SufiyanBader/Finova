"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportTransactionsToCSV } from "@/lib/export-utils";
import { toast } from "sonner";

export default function ExportButton({ transactions, filename }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (!transactions || transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    
    try {
      setIsExporting(true);
      exportTransactionsToCSV(transactions, filename);
      toast.success(`Exported ${transactions.length} transactions`);
    } catch (error) {
      toast.error("Failed to export transactions");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      {isExporting ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
