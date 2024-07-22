"use client"

import { SignUpInput, signUpSchema } from "@/lib/validations"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useState, useTransition } from "react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signUp } from "@/app/(auth)/signup/actions"

import { AnimatePresence, motion } from "framer-motion"
import { PasswordInput } from "@/components/ui/password-input"
import { LoadingButton } from "@/components/ui/loading-button"

export default function SignUp() {
  const [error, setError] = useState<string>()

  const [isPending, startTransition] = useTransition()

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  })

  const onSubmit = useCallback(async (values: SignUpInput) => {
    setError(undefined)

    startTransition(async () => {
      const { error } = await signUp(values)
      if (error) setError(error)
    })
  }, [])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <AnimatePresence initial={false}>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ filter: "blur(10px)", opacity: 0, y: -20 }}
              className="text-balance text-center text-red-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>email</FormLabel>
              <FormControl>
                <Input placeholder="email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton loading={isPending} type="submit" className="w-full">
          Create account
        </LoadingButton>
      </form>
    </Form>
  )
}
