import { z } from "zod";
import { EntityZod } from "./Entity";

export const FurnitureZod = {
  id: EntityZod.id,
  description: z.string().min(1),
};

export const FurnitureZodObject = z.object(FurnitureZod);
export type Furniture = z.infer<typeof FurnitureZodObject>;

export const FurnitureZodCreate = z.object({
  description: FurnitureZod.description,
});
export type FurnitureCreate = z.infer<typeof FurnitureZodCreate>;
