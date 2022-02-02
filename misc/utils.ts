import { gql } from "apollo-server-micro";
import * as crypto from "crypto";
import cookies from "js-cookie";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { client } from "./../pages/_app";

export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function mapDatabaseUserToGraphQLUser({
  _key: id,
  username,
  name,
  email,
  birthDate,
  photo
}: {
  _key: string;
  username: string;
  name: string;
  email?: string;
  birthDate?: string;
  photo?: string;
}, withDetails: any = false): any {
  return {
    id,
    username,
    name,
    email,
    birthDate,
    photo
  };
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
                    id
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
