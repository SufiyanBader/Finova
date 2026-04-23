import { z } from "zod";

export const portfolioSchema = z.object({
  name: z.string().min(1, "Portfolio name is required").max(100),
  description: z.string().max(300).optional(),
  color: z.string().default("#6366f1"),
});

export const holdingSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(20).toUpperCase(),
  name: z.string().min(1, "Asset name is required").max(100),
  assetType: z.enum(["STOCK", "CRYPTO", "ETF", "MUTUAL_FUND", "MANUAL"]),
  quantity: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce
      .number()
      .min(0.000001, "Quantity must be a positive number")
  ),
  averageBuyPrice: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce
      .number()
      .min(0, "Buy price must be a positive number")
  ),
  sector: z.string().optional(),
});

export const portfolioTransactionSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(20),
  name: z.string().min(1, "Asset name is required").max(100),
  assetType: z.enum(["STOCK", "CRYPTO", "ETF", "MUTUAL_FUND", "MANUAL"]),
  type: z.enum(["BUY", "SELL"]),
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Quantity must be a positive number",
    }),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
      message: "Price must be positive",
    }),
  fees: z.string().default("0"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().max(500).optional(),
});
