import { aql, Database } from "arangojs";
import * as jwt from "jsonwebtoken";
import { NextApiRequest } from "next";
import { sha256 } from "../misc/utils";

const jwtSecret = "iAmASecret";

export function generateJwt(user: any) {
  const { _key, username } = user;
  return jwt.sign({ id: _key, username }, jwtSecret);
}

/**
 * Check whether a given jwt token is valid
 *
 * @returns false if invalid, else the payload
 */
export function checkJwt(token: string): jwt.JwtPayload | false {
  try {
    return jwt.verify(token, jwtSecret) as jwt.JwtPayload;
  } catch (e) {
    return false;
  }
}

/**
 * Throws an error if the token is invalid
 */
export function requireLogin(req: NextApiRequest) {
  let token: string | null = null;
  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1] ?? null;
  }
  if (!token) {
    throw new Error("Not authorized");
  }

  const jwtContent = checkJwt(token);
  if (!jwtContent) {
    throw new Error("Not authorized");
  }

  return jwtContent;
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
