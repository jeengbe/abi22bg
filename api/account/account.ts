import { Database } from "arangojs";
import { NextApiRequest } from "next";
import { mapDatabaseUserToGraphQLUser } from "../../misc/utils";
import { requireLogin } from "../login";

export async function me(_: any, __: any, { db, req }: { db: Database, req: NextApiRequest; }) {
  const { id } = requireLogin(req);
  const user = await db.query(`
        FOR u IN users
          FILTER u._key == @id
          RETURN u
      `, { id });

  return user.hasNext ? {
    user: mapDatabaseUserToGraphQLUser(await user.next(), true)
  } : null;
}
