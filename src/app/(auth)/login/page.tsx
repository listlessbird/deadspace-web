import { Login } from "@/app/(auth)/login/login"
import { Metadata } from "next"
import Link from "next/link"
import LoginBanner from "@/assets/login_banner_tmp.webp"
import Image from "next/image"
import { GoogleSignInButton } from "@/app/(auth)/login/google-btn"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Login",
}

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="flex size-full max-h-[40rem] max-w-5xl overflow-hidden rounded-2xl bg-card shadow-xl">
        <div className="w-full space-y-7 overflow-y-auto p-10 md:w-1/2">
          <h1 className="text-pretty text-center text-3xl font-bold">
            Log in to the deadspace ☠️
          </h1>
          <div className="space-y-5">
            <GoogleSignInButton />
            <Separator />
            <Login />
            <Link
              href={"/signup"}
              className="block text-center hover:underline"
            >
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </div>
        <Image
          src={LoginBanner}
          height={500}
          width={500}
          alt=""
          className="hidden w-1/2 object-cover object-top md:block"
        />
      </div>
    </main>
  )
}
