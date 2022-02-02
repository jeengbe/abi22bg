import { gql } from "@apollo/client";
import cookies from "js-cookie";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "../../components/Button";
import * as Form from "../../components/Form";
import { client } from "../_app";

export default function Login() {
  const router = useRouter();

  async function login(username: string, password: string, setLoading: (loading: boolean) => void, setError: (error: string | null) => void): Promise<void> {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 333));

      const { data } = await client.mutate({
        mutation: gql`
          mutation login($username: String!, $password: String!) {
            login(username: $username, password: $password) {
              token
            }
          }
        `,
        variables: {
          username,
          password,
        },
      });

      if (data?.login?.token) {
        setError(null);
        cookies.set("token", data.login.token);
        router.push("/");
      } else {
        setError("Der Benutzername und das Passwort stimmen nicht überein.");
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "invalid") {
        setError("Der Benutzername und das Passwort stimmen nicht überein.");
      } else {
        setError("Ein unbekannter Fehler ist aufgetreten.");
      }
    } finally {
      setLoading(false);
    }
  }

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-blue-800/5 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <h2 className="text-center text-2xl font-bold mb-6">Anmeldung</h2>
          <Form.Form onSubmit={() => login(username, password, setLoading, setError)}>
            <Form.Input autoComplete="username" type="text" label="Benutzername" value={username} onChange={setUsername} />
            <Form.Input autoComplete="password" type="password" label="Passwort" value={password} onChange={setPassword} />
            <div>
              <Button variant={"primary"} type="submit" disabled={loading}>
                {loading && (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>{" "}
                  </>
                )}
                Anmelden
              </Button>
            </div>
            {error && <p className="mt-3 text-md text-center font-semibold text-red-600">{error}</p>}
          </Form.Form>
        </div>
      </div>
    </div>
  );
}
