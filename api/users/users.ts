import { Database } from "arangojs";
import { NextApiRequest } from "next";
import { mapDatabaseUserToGraphQLUser } from "../../misc/utils";
import { requireLogin } from "../login";

export async function users(_: any, __: any, { db, req }: { db: Database, req: NextApiRequest; }) {
  requireLogin(req);
  const users = await db.query(`
        FOR u IN users
          RETURN u
      `);

  return users.map(mapDatabaseUserToGraphQLUser);
}

export async function user(_: any, { username }: { username: string; }, { db, req }: { db: Database, req: NextApiRequest; }) {
  requireLogin(req);
  const user = await db.query(`
        FOR u IN users
          FILTER u.username == @username
          RETURN u
      `, { username });

  return user.hasNext ? mapDatabaseUserToGraphQLUser(await user.next()) : null;
}
