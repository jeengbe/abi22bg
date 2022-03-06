import { useQuery } from "@apollo/client";
import { gql } from "apollo-server-micro";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { useRequireLogin } from "../../../misc/utils";
import { client } from "../../_app";

export default function Steckbrief() {
  useRequireLogin();

  const router = useRouter();
  const { name: username } = router.query as {
    name: string;
  };


  const [ownComments, setOwnComments] = useState<Comment[]>([]);

  useEffect(() => {
    setOwnComments([]);
  }, [username]);

  const data = useQuery(gql`
    query($username: ID!) {
      user(username: $username) {
        username
        name
        photo
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
        comments {
          id
          user {
            username
            name
            photo
          }
          text
          date
        }
      }
    }
  `, { variables: { username: username } });

  if (!data.data) {
    return <LoadingSpinner />;
  }

  const {
    data: { user: {
      name,
      photo: photoSmall,
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
      comments
    } }
  } = data;

  return (
    <>
      <Head>
        <title>Steckbrief: {name}</title>
      </Head>

      <div className="max-w-6xl mx-auto my-32 lg:my-40">
        <Link href="/steckbrief">
          <a className="-mt-12 text-base leading-6 font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition ease-in-out duration-150 mx-6 lg:mx-0">
            Zur Übersicht
          </a>
        </Link>
        <div className="flex items-top flex-wrap">
          <div className="w-full lg:w-3/5 mx-6 lg:mx-0 lg:pr-4 flex flex-col gap-8">
            <div id="profile" className="rounded-lg shadow-2xl bg-white opacity-75 p-4 md:p-12">
              <div className="block lg:hidden rounded-full shadow-xl mx-auto -mt-16 h-32 w-32 bg-cover bg-center opacity-100" style={{ backgroundImage: "url(" + photoSmall + ")" }}></div>
              <h1 className="text-3xl font-bold pt-8 lg:pt-0 text-center lg:text-left">{name}</h1>
              <div className="mx-auto lg:mx-0 w-4/5 pt-3 border-b-2 border-stone-500 opacity-25"></div>
              {Object.entries({
                "Spitzname": spitzname,
                "Spruch / Lebensmotto": motto,
                "Geburtstag": geb,
                "Leistungskurse": lks,
                "Lehrer-Buddy": buddy,
                "Lieblingskurs": herzKurs,
                "Hasskurs": hassKurs,
                "Was würdest du deinem 5.-Klässler-Ich sagen?": klasse5,
                "Wo siehst du dich in 10 Jahren?": jahre,
                "Prägendes Ereignis deiner Schulzeit": ereignis,
                "Lieblingsaktivität wenn man im Unterricht nicht aufgepasst hat": lw,
                "Unpopular Opinion": unpopular,
                "Ohne das hätte ich mein Abi nicht geschafft": hilfe,
                "Als Lehrer würde ich…": lehrer,
                "Was ich nach 8 Jahren immer noch nicht kann/verstanden habe": kp,
                "Eine zufällige (evtl. komische/unnötige/witzige/…) Sache, die du gelernt hast, die dir immer noch ins Hirn gebrannt ist (z.B. Mitternachtsformel, bestimmte Vokabeln, etc.)": random,
                "Ein kleines Gedicht über deine Schulzeit (paar Zeilen)": gedicht,
                "Letzte Worte": rip
              }).map(([question, answer]) => (
                <div className="mt-3" key={question}>
                  <p className="text-gray-600/90 text-sm">{question}</p>
                  <p className="font-medium pl-2 border-l-2 border-l-green-500/50 whitespace-pre-line">{answer === "" ? <i>Keine Angabe</i> : answer}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full lg:w-2/5 mx-6 lg:mx-0 lg:pl-4 flex flex-col gap-8 mt-8 lg:mt-0">
            <Comments username={username} comments={[...comments, ...ownComments]} disableCommenting pushComment={c => {
              setOwnComments(oc => [...oc, c]);
            }} />
          </div>
        </div>
      </div>
    </>
  );
}

function Photo({ photo }: {
  photo: string;
}) {
  return <img src={photo} className="rounded-lg shadow-2xl hidden lg:block" />;
}

interface Comment {
  id: string;
  user: {
    username: string;
    name: string;
    photo: string;
  };
  text: string;
  date: string;
}

function Comments({ comments, username, pushComment }: {
  comments: Comment[],
  username: string;
  disableCommenting?: boolean;
  pushComment: (comment: Comment) => void;
}) {
  const [text, setText] = useState("");

  function comment(anonymously: boolean) {
    client.mutate({
      mutation: gql`
        mutation($text: String!, $username: String!, $anonymously: Boolean!) {
          createComment(anonymously: $anonymously, username: $username, text: $text) {
            id
            user {
              username
              name
              photo
            }
            text
            date
          }
        }
      `,
      variables: {
        anonymously,
        username,
        text
      },
    }).then(({ data }) => {
      pushComment(data.createComment);
      setText("");
    });
  }

  return (
    <div id="comments" className="rounded-lg shadow-2xl bg-white p-4 md:p-8">
      <ul role="list" className="divide-y divide-gray-200">
        {comments.map(({ id, user, text, date }) => (
          <li key={id} className="py-4">
            <div className="flex space-x-3">
              <img className="w-12 rounded-lg" src={user !== null ? user.photo : "/pictures/anonymous.png"} alt="" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{user !== null ? <Link href={"/steckbrief/" + user.username} ><a>{user.name}</a></Link> : <i>Anonym</i>}</h3>
                  <p className="text-sm text-gray-500">{date}</p>
                </div>
                <p className="text-sm text-gray-500">
                  {text}
                </p>
              </div>
            </div>
          </li>
        ))}
        {comments.length === 0 && <h3 className="font-normal text-md text-center">Diesem Nutzer wurden keine Kommentare hinterlassen.</h3>}
      </ul>
      <div className="mt-4">
        <form className="flex flex-col space-y-2">
          <label className="text-sm text-gray-500">
            <textarea
              className="w-full p-2 border-2 border-gray-300 rounded-md"
              rows={3}
              placeholder="Kommentar schreiben..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <div className="flex gap-5">
            <button
              className="w-full bg-yellow-600/90 text-white text-sm font-medium py-2 px-4 rounded-md shadow-md hover:bg-yellow-700/90 focus:outline-none"
              onClick={e => {
                e.preventDefault();
                comment(true);
              }}
            >
              Kommentar <b>anonym</b> senden
            </button>
            <button
              className="w-full bg-gray-700/90 text-white text-sm font-medium py-2 px-4 rounded-md shadow-md hover:bg-gray-800/90 focus:outline-none"
              onClick={e => {
                e.preventDefault();
                comment(false);
              }}
            >
              Kommentar senden
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
