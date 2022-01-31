import { Database } from "arangojs";
import { NextApiRequest } from "next";
import { mapDatabaseUserToGraphQLUser } from "../../misc/utils";
import { requireLogin } from "../user/login";

export async function users(_: any, __: any, { db, req }: { db: Database, req: NextApiRequest; }) {
  requireLogin(req);
  const users = await db.query(`
        FOR u IN users
          RETURN u
      `);

  return users.map(mapDatabaseUserToGraphQLUser);
}

export async function user(_: any, { id }: { id: string; }, { db, req }: { db: Database, req: NextApiRequest; }) {
  requireLogin(req);
  const user = await db.query(`
        FOR u IN users
          FILTER u._key == @id
          RETURN u
      `, { id });

  return user.hasNext ? mapDatabaseUserToGraphQLUser(await user.next()) : null;
}
