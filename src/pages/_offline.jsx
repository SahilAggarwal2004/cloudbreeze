import Head from "next/head";

export default function Offline() {
  return (
    <>
      <Head>
        <title>You are Offline!</title>
      </Head>
      <div className="fixed inset-0 z-20 flex h-screen w-screen items-center justify-center">
        <div className="space-y-2 px-4 text-center font-sans">
          <h1 className="text-3xl">Offline...</h1>
          <p>{"The current page isn't available offline. Please try again when you're back online."}</p>
        </div>
      </div>
    </>
  );
}
