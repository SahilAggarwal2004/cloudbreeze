import Head from "next/head";
import { useFileContext } from "../../../contexts/ContextProvider";

export default function Confirm({ router }) {
  const { fetchApp } = useFileContext();

  async function verify() {
    const { success } = await fetchApp({ url: "auth/confirm", method: "PUT", token: router.query.token });
    if (success) router.replace("/account/login");
  }

  return (
    <>
      <Head>
        <title>Confirm account | CloudBreeze</title>
      </Head>
      <h1 className="sticky inset-0 z-30 bg-black px-5 py-2 text-center text-xl font-medium text-white shadow-lg sm:text-left">CloudBreeze</h1>
      <div className="center space-y-5 text-center">
        <h3 className="text-lg font-semibold">Confirm your CloudBreeze account</h3>
        <button className="mt-1 rounded-md border-[1.5px] border-black bg-black px-2 py-1 text-white transition-all duration-300 hover:bg-white hover:text-black" onClick={verify}>
          Click Here!
        </button>
      </div>
    </>
  );
}
