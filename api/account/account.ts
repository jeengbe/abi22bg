import { Database } from "arangojs";
import fs from "fs";
import { NextApiRequest } from "next";
import { mapDatabaseUserToGraphQLUser } from "../../misc/utils";
import { requireLogin } from "../login";

export async function me(_: any, __: any, { db, req }: { db: Database, req: NextApiRequest; }) {
  const { id, username } = requireLogin(req);

  fs.appendFileSync('../../log.txt', `(me) ${req.headers['user-agent']} -> ${username}\n`);

  const user = await db.query(`
        FOR u IN users
          FILTER u._key == @id
          RETURN u
      `, { id });

  return user.hasNext ? {
    user: mapDatabaseUserToGraphQLUser(await user.next(), true)
  } : null;
}
