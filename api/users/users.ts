import { Database } from "arangojs";
import { NextApiRequest } from "next";
import { mapDatabaseCommentToGraphQLComment, mapDatabaseUserToGraphQLUser } from "../../misc/utils";
import { requireLogin } from "../login";

export async function users(_: any, __: any, { db, req }: { db: Database, req: NextApiRequest; }) {
  requireLogin(req);
  const users = await db.query(`
        FOR u IN users
          SORT u.username
          RETURN u
      `);

  return users.map(mapDatabaseUserToGraphQLUser);
}

export async function user(_: any, { username }: { username: string; }, { db, req }: { db: Database, req: NextApiRequest; }) {
  requireLogin(req);
  const user = await db.query(`
    FOR u IN users
        FILTER u.username == @username
        LET comments = (
            FOR c IN comments
                FILTER c._to == u._id
                RETURN {
                  _key: c._key,
                  user: c.anonymous ? null : DOCUMENT(c._from),
                  text: c.text,
                  date: c.date
              }
        )
        RETURN MERGE(u, { comments })
  `, { username });

  return user.hasNext ? mapDatabaseUserToGraphQLUser(await user.next()) : null;
}

const keys = ["spitzname", "motto", "geb", "lks", "buddy", "herzKurs", "hassKurs", "klasse5", "jahre", "ereignis", "lw", "unpopular", "hilfe", "lehrer", "kp", "random", "gedicht", "rip"];

export async function updateMe(_: any, { key, value }: { key: string, value?: string; }, { db, req }: { db: Database, req: NextApiRequest; }) {
  const { id } = requireLogin(req);
  if (!keys.includes(key)) throw new Error(`Invalid key: ${key}`);

  await db.query(`
        FOR u IN users
          FILTER u._key == @id
          UPDATE u WITH { ${key}: @value } IN users
      `, { id, value });

  return {
    success: true
  };
}

export async function createComment(_: any, { anonymously: anonymous, username: usernameTo, text }: { anonymously: boolean, username: string; text: string; }, { db, req }: { db: Database, req: NextApiRequest; }) {
  const { id } = requireLogin(req);

  const idTo = await db.query(`
    FOR u IN users
      FILTER u.username == @usernameTo
      RETURN u._id
  `, { usernameTo });
  if (!idTo) throw new Error(`User ${usernameTo} not found`);

  const newComment = await db.query(`
    LET comment = {
      _from: CONCAT("users/", @id),
      _to: @idTo,
      text: @text,
      date: DATE_FORMAT(DATE_NOW(), "%yyyy-%mm-%dd"),
      anonymous: @anonymous
    }
    LET u = DOCUMENT(CONCAT("users/", @id))
    INSERT comment INTO comments
    RETURN MERGE(NEW, { user: @anonymous ? null : u })
  `, { id, idTo: await idTo.next(), text, anonymous });

  return mapDatabaseCommentToGraphQLComment(await newComment.next());
}
