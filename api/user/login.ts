import { aql, Database } from "arangojs";
import * as jwt from "jsonwebtoken";
import { NextApiRequest } from "next";
import { sha256 } from "../../misc/utils";

const jwtSecret = "iAmASecret";

export function generateJwt(user: any) {
  const { _key, username } = user;
  return jwt.sign({ id: _key, username }, jwtSecret);
}

/**
 * Check whether a given jwt token is valid
 *
 * @returns false if invalid, else the user's id
 */
export function checkJwt(token: string): string | false {
  try {
    return (jwt.verify(token, jwtSecret) as jwt.JwtPayload).id;
  } catch (e) {
    return false;
  }
}

export function requireLogin(req: NextApiRequest) {
  if (!req.headers.authorization) {
    throw new Error("Not authorized");
  }

  const token = req.headers.authorization.replace("Bearer ", "");
  const userId = checkJwt(token);
  if (!userId) {
    throw new Error("Not authorized");
  }

  return userId;
}

export async function login(_: any, { username, password }: { username: string, password: string; }, { db }: { db: Database; }) {
  const user = await db.query(aql`
        FOR u IN users
          FILTER u.username == ${username} && u.password == ${sha256(password)}
          RETURN u
      `);

  if (!user.hasNext) {
    throw new Error('Invalid credentials');
  }

  return {
    token: generateJwt(await user.next()),
  };
}
