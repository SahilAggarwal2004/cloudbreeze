import { useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useFileContext } from "../../contexts/ContextProvider";
import Logo from "../../components/Logo";
import Password from "../../components/Password";

export default function Signup({ router }) {
  const { fetchApp, progress } = useFileContext();
  const name = useRef();
  const email = useRef();
  const password = useRef();

  async function submit(e) {
    e.preventDefault();
    const { error } = await fetchApp({ url: "auth/signup", method: "POST", body: { name: name.current.value, email: email.current.value, password: password.current.value } });
    if (!error) router.replace("/account/login");
  }

  return (
    <>
      <Head>
        <title>Sign up | CloudBreeze</title>
      </Head>
      <div className="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Logo />
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Sign up for an account</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              or{" "}
              <Link href="/account/login" className="font-medium hover:text-black">
                Log in
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={submit}>
            <div className="-space-y-px rounded-md shadow-xs">
              <input ref={name} type="text" autoComplete="name" required minLength={3} maxLength={20} className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-black focus:ring-black focus:outline-hidden sm:text-sm" placeholder="Your name" />
              <input ref={email} type="email" autoComplete="email" required className="relative block w-full appearance-none rounded-none border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-black focus:ring-black focus:outline-hidden sm:text-sm" placeholder="Email address" />
              <Password password={password} />
            </div>
            <button type="submit" disabled={progress > 0} className="button-animation relative flex w-full justify-center rounded-md border px-4 py-2 text-sm font-medium">
              Sign up
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
