import { z } from "zod";

export const CreateScanRequestSchema = z.object({
  url: z.string().min(1, "A website URL is required."),
});
