import { db } from "@/lib/db";
import { hobbies, values as valuesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getActiveHobbies() {
  return db.query.hobbies.findMany({
    where: eq(hobbies.isActive, true),
    orderBy: (hobbies, { asc }) => [asc(hobbies.category), asc(hobbies.sortOrder)],
  });
}

export async function getActiveValues() {
  return db.query.values.findMany({
    where: eq(valuesTable.isActive, true),
    orderBy: (values, { asc }) => [asc(values.sortOrder)],
  });
}
