"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scanReceipt } from "@/actions/transaction";
import useFetch from "@/hooks/use-fetch";

export default function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);

  const {
    loading: scanLoading,
    fn: scanFn,
    data: scannedData,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }
    await scanFn(file);
  };

  useEffect(() => {
    if (scannedData && !scanLoading) {
      onScanComplete(scannedData);
      toast.success("Receipt scanned successfully");
    }
  }, [scannedData, scanLoading, onScanComplete]);

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />
      <Button
        type="button"
        className="w-full h-10 bg-gradient-to-r from-orange-500 via-pink-500 to-teal-500 hover:opacity-90 text-white animate-gradient"
        disabled={scanLoading}
        onClick={() => fileInputRef.current?.click()}
      >
        {scanLoading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Scanning Receipt...
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4" />
            Scan Receipt with AI
          </>
        )}
      </Button>
    </div>
  );
}
