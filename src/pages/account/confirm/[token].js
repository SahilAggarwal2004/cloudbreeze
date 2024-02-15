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
      <h1 className="sticky inset-0 z-30 bg-black text-white py-2 px-5 shadow-lg text-xl font-medium text-center sm:text-left">CloudBreeze</h1>
      <div className="center space-y-5 text-center">
        <h3 className="text-lg font-semibold">Confirm your CloudBreeze account</h3>
        <button className="mt-1 py-1 px-2 rounded-md border-[1.5px] border-black text-white bg-black hover:text-black hover:bg-white transition-all duration-300" onClick={verify}>
          Click Here!
        </button>
      </div>
    </>
  );
}
