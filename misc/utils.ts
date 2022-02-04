import { gql } from "apollo-server-micro";
import * as crypto from "crypto";
import cookies from "js-cookie";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { client } from "./../pages/_app";

export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export interface DatabaseUser {
  username: string;
  name: string;
  photo?: string;
  spitzname?: string;
  motto?: string;
  geb?: string;
  lks?: string;
  buddy?: string;
  herzKurs?: string;
  hassKurs?: string;
  klasse5?: string;
  jahre?: string;
  ereignis?: string;
  lw?: string;
  unpopular?: string;
  hilfe?: string;
  lehrer?: string;
  kp?: string;
  random?: string;
  gedicht?: string;
  rip?: string;
  comments?: DatabaseComment[];
}

export interface DatabaseComment {
  _key: string;
  user?: {
    username: string;
    name: string;
    photo?: string;
  };
  text: string;
  date: string;
}

export function mapDatabaseUserToGraphQLUser({
  username,
  name,
  photo,
  spitzname = "",
  motto = "",
  geb = "",
  lks = "",
  buddy = "",
  herzKurs = "",
  hassKurs = "",
  klasse5 = "",
  jahre = "",
  ereignis = "",
  lw = "",
  unpopular = "",
  hilfe = "",
  lehrer = "",
  kp = "",
  random = "",
  gedicht = "",
  rip = "",
  comments = []
}: DatabaseUser, withDetails: any = false): any {
  return {
    username,
    name,
    photo,
    spitzname,
    motto,
    geb,
    lks,
    buddy,
    herzKurs,
    hassKurs,
    klasse5,
    jahre,
    ereignis,
    lw,
    unpopular,
    hilfe,
    lehrer,
    kp,
    random,
    gedicht,
    rip,
    comments: comments.map(mapDatabaseCommentToGraphQLComment)
  };
}

export function mapDatabaseCommentToGraphQLComment({
  _key: id,
  user,
  text,
  date
}: DatabaseComment): any {
  return {
    id,
    user: user ? mapDatabaseUserToGraphQLUser(user) : undefined,
    text,
    date
  }
}

export function useRequireLogin(verifiedCallback?: (id: string) => void) {
  const router = useRouter();

  useEffect(() => {
    if (!cookies.get("token")) {
      router.replace({
        pathname: "/login",
      });
    } else {
      (async () => {
        try {
          const { data: { me: { id } } } = await client.query({
            query: gql`
              query {
                me {
                  user {
                    username
                  }
                }
              }
            `,
            fetchPolicy: "network-only"
          });

          verifiedCallback?.(id);
        } catch (e) {
          router.replace({
            pathname: "/login",
            query: {
              reason: "invalid",
            },
          });
        }
      })();
    }
  }, [router, verifiedCallback]);
}
