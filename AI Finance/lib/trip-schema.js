import { z } from "zod";

// ---------------------------------------------------------------------------
// Trip creation schema
// ---------------------------------------------------------------------------

export const tripSchema = z.object({
  name: z
    .string()
    .min(1, "Trip name is required")
    .max(100, "Trip name must be 100 characters or fewer"),
  destination: z
    .string()
    .min(1, "Destination is required")
    .max(100, "Destination must be 100 characters or fewer"),
  baseCurrency: z.string().min(3).max(3).default("USD"),
  budget: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  coverColor: z.string().default("#6366f1"),
});

// ---------------------------------------------------------------------------
// Trip expense schema
// ---------------------------------------------------------------------------

export const tripExpenseSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description must be 200 characters or fewer"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      { message: "Amount must be a positive number" }
    ),
  currency: z.string().min(3).max(3),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().max(500).optional(),
});
