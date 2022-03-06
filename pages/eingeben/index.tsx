import { useQuery } from "@apollo/client";
import { CollectionIcon, LogoutIcon } from "@heroicons/react/outline";
import { gql } from "apollo-server-micro";
import cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useRequireLogin } from "../../misc/utils";
import { client } from "../_app";

export default function Eingeben() {
  const router = useRouter();
  useRequireLogin();

  const data = useQuery(gql`
    query {
      me {
        user {
          name
          spitzname
          motto
          geb
          lks
          buddy
          herzKurs
          hassKurs
          klasse5
          jahre
          ereignis
          lw
          unpopular
          hilfe
          lehrer
          kp
          random
          gedicht
          rip
        }
      }
    }
  `);

  if (!data.data) {
    return <LoadingSpinner />;
  }

  const { me: { user } } = data.data;

  return <div className="max-w-4xl p-5 lg:p-0 lg:py-20 mx-auto">
    <form className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div>
          <div className="flex justify-between">
            <div>
              <h3 className="text-xl leading-6 font-medium text-gray-900">{user.name}</h3>
              <p className="mt-1 max-w-3xl text-sm text-gray-500">
                Diese Eingaben werden so in der Abizeitung gedruckt.<br />Sei dir sicher, dass du das, was du eingibst, so gedruckt haben möchtest.<br />Nichtausfüllen von Feldern ist möglich.<br />Eingaben werden automatisch gespeichert.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-400/80 hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={() => {
                  cookies.remove("token");
                  router.push("/");
                }}
              >
                <LogoutIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              <Link
                href="/steckbrief"
              >
                <a className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-400/80 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <CollectionIcon className="h-6 w-6" aria-hidden="true" />
                </a>
              </Link>
            </div>
          </div>
          <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
            <Input defaultValue={user.spitzname} label="Spitzname" id="spitzname" width="sm" />
            <Input defaultValue={user.motto} label="Spruch / Lebensmotto" id="motto" type="textarea" />
            <Input defaultValue={user.geb} label="Geburtstag" id="geb" width="sm" type="date" />
            <Input defaultValue={user.lks} label="Leistungskurse" id="lks" width="lg" />
            <Input defaultValue={user.buddy} label="Lehrer-Buddy" id="buddy" width="sm" />
            <Input defaultValue={user.herzKurs} label="Lieblingskurs" id="herzKurs" width="sm" />
            <Input defaultValue={user.hassKurs} label="Hasskurs" id="hassKurs" width="sm" />
            <Input defaultValue={user.klasse5} label="Was würdest du deinem 5.-Klässler-Ich sagen?" id="klasse5" type="textarea" />
            <Input defaultValue={user.jahre} label="Wo siehst du dich in 10 Jahren?" id="jahre" type="textarea" />
            <Input defaultValue={user.ereignis} label="Prägendes Ereignis deiner Schulzeit" id="ereignis" type="textarea" />
            <Input defaultValue={user.lw} label="Lieblingsaktivität wenn man im Unterricht nicht aufgepasst hat" id="lw" type="textarea" />
            <Input defaultValue={user.unpopular} label="Unpopular Opinion" id="unpopular" type="textarea" />
            <Input defaultValue={user.hilfe} label="Ohne das hätte ich mein Abi nicht geschafft" id="hilfe" type="textarea" />
            <Input defaultValue={user.lehrer} label="Als Lehrer würde ich…" id="lehrer" type="textarea" />
            <Input defaultValue={user.kp} label="Was ich nach 8 Jahren immer noch nicht kann/verstanden habe" id="kp" type="textarea" />
            <Input defaultValue={user.random} label="Eine zufällige (evtl. komische/unnötige/witzige/…) Sache, die du gelernt hast, die dir immer noch ins Hirn gebrannt ist (z.B. Mitternachtsformel, bestimmte Vokabeln, etc.)" id="random" type="textarea" />
            <Input defaultValue={user.gedicht} label="Ein kleines Gedicht über deine Schulzeit (paar Zeilen)" id="gedicht" type="textarea" />
            <Input defaultValue={user.rip} label="Letzte Worte" id="rip" width="lg" />
          </div>
        </div>
      </div>
    </form>
  </div>;
}

function Input({ label, id, width = "lg", type = "text", hint, defaultValue = "" }: { label: string, id: string, width?: string, type?: string; hint?: string; defaultValue?: string; }) {
  const [value, setValue] = useState(defaultValue);

  function updateValue(value: string) {
    setValue(value);
    client.mutate({
      mutation: gql`
        mutation($key: String!, $value: String) {
          updateMe(key: $key, value: $value) {
            success
          }
        }
      `,
      variables: {
        key: id,
        value,
      }
    });
  }

  return <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
      {label}
    </label>
    <div className="mt-1 sm:mt-0 sm:col-span-2">
      {type === "textarea" ?
        <textarea
          id={id}
          rows={3}
          className="max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
          value={value}
          onChange={(e) => updateValue((e.target as any as { value: string; }).value)}
        />
        :
        <input
          id={id}
          type={type}
          className={"block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-md sm:text-sm border-gray-300 " + {
            "sm": "max-w-xs",
            "lg": "max-w-lg"
          }[width]}
          value={value}
          onChange={(e) => updateValue((e.target as any as { value: string; }).value)}
        />}
      {hint && <p className="mt-2 text-sm text-gray-500">{hint}</p>}
    </div>
  </div>;
}
