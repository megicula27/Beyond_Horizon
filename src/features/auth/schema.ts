import { z } from "zod";

export const loginSchema = z.object({
  imoNumber: z.string().min(3, "IMO number is required"),
  crewId: z.string().min(3, "Crew ID is required"),
  password: z.string().min(6, "Access key must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;