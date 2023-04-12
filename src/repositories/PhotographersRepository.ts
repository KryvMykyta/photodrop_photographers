import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { photographers } from "./../schemas/photographersSchema";
import { eq } from "drizzle-orm/expressions";
export class PhotographersRepository {
  db: NodePgDatabase;

  constructor(pool: Pool) {
    const db = drizzle(pool);
    this.db = db;
  }

  public getPhotographerByLogin = async (login: string) => {
    const photographerData = await this.db
      .select()
      .from(photographers)
      .where(eq(photographers.login, login));
    return photographerData;
  };
}
