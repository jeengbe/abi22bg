import { useQuery } from "@apollo/client";
import { gql } from "apollo-server-micro";
import Link from "next/link";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useRequireLogin } from "../../misc/utils";

export default function Übersicht() {
  useRequireLogin();

  const data = useQuery(gql`
    query {
      users {
        id
        username
        name
        photo
      }
    }
  `);

  if (data.loading) {
    return <LoadingSpinner />;
  }

  const {
    data: { users },
  } = data;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {users.map(({ id, username, name, photo }: { id: string; username: string; name: string; photo: string; }) => (
          <Link key={id} href={"/benutzer/" + username} >
            <a className="col-span-1 flex flex-col text-center bg-indigo-200/5 rounded-lg shadow divide-y divide-gray-200 cursor-pointer">
              <div className="flex-1 flex flex-col p-6">
                <img className="w-32 h-32 flex-shrink-0 mx-auto rounded-md" src={photo} alt="" />
                <h3 className="mt-6 text-gray-900 text-sm font-medium">{name}</h3>
              </div>
            </a>
          </Link>
        ))}
      </ul>
    </div>
  );
}
