"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { importTransactions } from "@/actions/import";
import { parseCSVToTransactions } from "@/lib/export-utils";
import useFetch from "@/hooks/use-fetch";

export default function ImportButton({ accountId, onImportComplete }) {
  const fileInputRef = useRef(null);
  const [isParsing, setIsParsing] = useState(false);

  const {
    loading: importLoading,
    fn: importFn,
    data: importResult,
  } = useFetch(importTransactions);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      e.target.value = "";
      return;
    }
    
    try {
      setIsParsing(true);
      const text = await file.text();
      const transactions = parseCSVToTransactions(text);
      
      if (transactions.length === 0) {
        toast.error("No valid transactions found in file");
        return;
      }
      
      await importFn(transactions, accountId);
    } catch (error) {
      toast.error(error.message || "Failed to parse CSV file");
    } finally {
      setIsParsing(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    if (importResult?.success) {
      toast.success(`Imported ${importResult.count} transactions`);
      if (onImportComplete) onImportComplete();
    }
  }, [importResult, onImportComplete]);

  const isLoading = isParsing || importLoading;

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".csv"
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-4 w-4" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Import CSV
          </>
        )}
      </Button>
    </div>
  );
}
