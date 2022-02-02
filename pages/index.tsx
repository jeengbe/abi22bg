import { useRouter } from "next/router";
import LoadingSpinner from "../components/LoadingSpinner";
import { useRequireLogin } from "../misc/utils";

export default function Index() {
  const router = useRouter();

  useRequireLogin(() =>
    router.replace({
      pathname: "/benutzer",
    })
  );

  return (
    <LoadingSpinner />
  );
}
