"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { InputTags } from "@/components/ui/input-tags"
import { LoadingButton } from "@/components/ui/loading-button"
import { AgentConfigInput, agentConfigSchema } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { error } from "console"
import { AnimatePresence, motion } from "framer-motion"
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
  useTransition,
} from "react"
import { useForm } from "react-hook-form"
import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza"
import { createAgentAction } from "@/app/(main)/agents/actions"
import { toast, useToast } from "@/components/ui/use-toast"
import { AgentList } from "@/app/(main)/agents/agent-list"
export function Agents() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <Credenza open={showModal} onOpenChange={setShowModal}>
        <CredenzaTrigger asChild>
          <Button>Create a new agent</Button>
        </CredenzaTrigger>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>Create a new agent</CredenzaTitle>
            <CredenzaDescription>
              Fill in the form below to create a new agent
            </CredenzaDescription>
          </CredenzaHeader>
          <CredenzaBody>
            <AgentConfigForm onClose={setShowModal} />
          </CredenzaBody>
        </CredenzaContent>
      </Credenza>
      {/* <AgentConfigForm /> */}
      <AgentList />
    </div>
  )
}

function AgentConfigForm({
  onClose,
}: {
  onClose?: Dispatch<SetStateAction<boolean>>
}) {
  const { toast } = useToast()

  const form = useForm<AgentConfigInput>({
    resolver: zodResolver(agentConfigSchema),
    defaultValues: {
      name: "",
      description: "",
      behaviouralTraits: [],
    },
  })

  const [isPending, startTransition] = useTransition()

  const [error, setError] = useState<string>()
  const onSubmit = useCallback(
    async (values: AgentConfigInput) => {
      const created = await createAgentAction(values)
      if ("error" in created) {
        setError(created?.error)
      } else if (created.id) {
        setError(undefined)
        toast({
          variant: "default",
          description: "Agent created successfully",
          title: "Agent created",
        })
        onClose?.(false)
      }
    },
    [toast, onClose],
  )
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent name</FormLabel>
              <FormControl>
                <Input placeholder="your agent's name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="your agent's description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="behaviouralTraits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Behavioural traits</FormLabel>
              <FormControl>
                <InputTags
                  placeholder="behaviour you want the agent to have"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton loading={isPending} type="submit" className="w-full">
          Create agent
        </LoadingButton>
      </form>
    </Form>
  )
}
