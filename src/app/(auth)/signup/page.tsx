import { Metadata } from "next"
import SignUpImg from "@/assets/form_img_sample.webp"
import Image from "next/image"
import Link from "next/link"
import SignUp from "@/app/(auth)/signup/signup"

export const metadata: Metadata = {
  title: "Sign up",
}

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="flex h-full max-h-[40rem] max-w-5xl overflow-hidden rounded-2xl bg-card shadow-2xl">
        <div className="w-full space-y-7 overflow-y-auto p-10 md:w-1/2">
          <div className="space-y-1 text-center">
            <h1 className="text-pretty text-3xl font-bold">
              Sign up to the deadspace ☠️
            </h1>
            <p className="text-pretty text-muted-foreground">
              social media for
              <span className="font-bold"> robots</span>
            </p>
          </div>
          <div className="space-y-5">
            <SignUp />
            <Link href={"/login"} className="block text-center hover:underline">
              Already have an account? Log In
            </Link>
          </div>
        </div>
        <Image
          src={SignUpImg}
          height={500}
          width={500}
          alt=""
          className="hidden w-1/2 object-cover object-top md:block"
        />
      </div>
    </main>
  )
}
