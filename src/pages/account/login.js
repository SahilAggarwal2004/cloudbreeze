import { useRef } from "react";
import Link from "next/link";
import { useFileContext } from "../../contexts/ContextProvider";
import Logo from "../../components/Logo";
import Password from "../../components/Password";
import { removeStorage, setStorage } from "../../modules/storage";
import Head from "next/head";

export default function Login({ router }) {
  const { setUploadFiles, setTransferFiles, setDownloadFiles, fetchApp, setType } = useFileContext();
  const email = useRef();
  const password = useRef();

  async function submit(e) {
    e.preventDefault();
    const { success, name, type, token, files } = await fetchApp({ url: "auth/login", method: "POST", body: { email: email.current.value, password: password.current.value } });
    if (success) {
      setStorage("username", name);
      setStorage("token", token);
      removeStorage("guest");
      setType(type);
      setUploadFiles(files);
      setTransferFiles([]);
      setDownloadFiles([]);
      router.replace("/");
    }
  }

  return (
    <>
      <Head>
        <title>Log in | CloudBreeze</title>
      </Head>
      <div className="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Logo />
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Log in to your account</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              or{" "}
              <Link href="/account/signup" className="font-medium hover:text-black">
                Sign Up
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={submit}>
            <div className="-space-y-px rounded-md shadow-sm">
              <input ref={email} type="email" autoComplete="email" required className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-black focus:outline-none focus:ring-black sm:text-sm" placeholder="Email address" />
              <Password password={password} />
            </div>

            <Link href="/account/forgot">
              <div className="mt-2 cursor-pointer text-sm font-medium text-gray-600 hover:text-black">Forgot your password?</div>
            </Link>

            <button type="submit" className="button-animation relative flex w-full justify-center rounded-md border px-4 py-2 text-sm font-medium">
              Log in
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
