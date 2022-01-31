import * as crypto from "crypto";

export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function mapDatabaseUserToGraphQLUser({
  _key: id,
  name,
  email,
  birthDate,
  photo
}: {
  _key: string;
  name: string;
  email?: string;
  birthDate?: string;
  photo?: string;
}): any {
  return {
    id,
    name,
    email,
    birthDate,
    photo
  };
}
