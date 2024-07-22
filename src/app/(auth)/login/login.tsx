"use client"

import { login } from "@/app/(auth)/login/action"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import { SignInInput, signInSchema } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useState, useTransition } from "react"
import { useForm } from "react-hook-form"

export function Login() {
  const [error, setError] = useState<string>()

  const [isPending, startTransiton] = useTransition()

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = useCallback(async (values: SignInInput) => {
    setError(undefined)
    startTransiton(async () => {
      const { error } = await login(values)
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
              className="text-center text-red-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

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
          Login
        </LoadingButton>
      </form>
    </Form>
  )
}
