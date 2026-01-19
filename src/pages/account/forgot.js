import { useState, useRef } from "react";
import Link from "next/link";
import { useFileContext } from "../../contexts/ContextProvider";
import Logo from "../../components/Logo";
import Password from "../../components/Password";
import Head from "next/head";

export default function Forgot({ router }) {
  const { fetchApp, progress } = useFileContext();
  const email = useRef();
  const otp = useRef();
  const password = useRef();
  const [stage, setStage] = useState(0);

  async function submit(e) {
    e.preventDefault();
    if (!stage) {
      const { success, error } = await fetchApp({ url: "auth/otp", method: "POST", body: { email: email.current.value } });
      if (success || error === "OTP already sent!") setStage(1);
    } else {
      const { success } = await fetchApp({ url: "auth/forgot", method: "PUT", body: { email: email.current.value, otp: otp.current.value, password: password.current.value } });
      if (success) router.push("/account/login");
    }
  }

  return (
    <>
      <Head>
        <title>Reset password | CloudBreeze</title>
      </Head>
      <div className="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Logo />
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Forgot Password</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              or{" "}
              <Link href="/account/login" className="font-medium hover:text-black">
                Login
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={submit}>
            <div className="-space-y-px rounded-md shadow-xs">
              <input ref={email} type="email" autoComplete="email" required className={`relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 ${stage ? "rounded-b-none" : ""} focus:z-10 focus:border-black focus:ring-black focus:outline-hidden sm:text-sm`} placeholder="Email address" />
              {Boolean(stage) && (
                <>
                  <input ref={otp} type="text" autoComplete="new-password" minLength={6} maxLength={6} required className="relative block w-full appearance-none rounded-none border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-black focus:ring-black focus:outline-hidden sm:text-sm" placeholder="Enter OTP" />
                  <Password password={password} />
                </>
              )}
            </div>
            <button type="submit" disabled={progress > 0} className="button-animation relative flex w-full justify-center rounded-md border px-4 py-2 text-sm font-medium">
              {stage ? "Reset password" : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
