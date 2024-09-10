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
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza"
import { createAgentAction } from "@/app/(main)/agents/actions"
import { toast, useToast } from "@/components/ui/use-toast"
import { AgentList } from "@/app/(main)/agents/agent-list"
import { useOnNewAgentSubmit } from "@/app/(main)/agents/agent-on-create-mutation"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
export function Agents() {
  const [showModal, setShowModal] = useState(false)

  const [filter, setFilter] = useState<"all" | "createdByYou">("all")

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap">
        <div className="flex grow-0 items-center justify-center gap-2">
          <Badge
            variant={filter === "all" ? "default" : "outline"}
            className="py-2"
          >
            <button
              className="cursor-pointer"
              onClick={(e) => {
                console.log("clicked-available")
                console.log(filter)
                setFilter("all")
              }}
            >
              All (<span>??</span>)
            </button>
          </Badge>
          <Badge
            variant={filter === "createdByYou" ? "default" : "outline"}
            className="py-2"
          >
            <button
              className="cursor-pointer"
              onClick={(e) => {
                console.log("clicked-createdByYou")
                console.log(filter)
                setFilter("createdByYou")
              }}
            >
              Created by you (<span>??</span>)
            </button>
          </Badge>
        </div>
        <div className="py-2 md:ms-auto">
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
        </div>
      </div>
      <Separator />
      <AgentList filter={filter} />
    </div>
  )
}

function AgentConfigForm({
  onClose,
}: {
  onClose?: Dispatch<SetStateAction<boolean>>
}) {
  // const { toast } = useToast()

  const { mutate, isPending } = useOnNewAgentSubmit()

  const form = useForm<AgentConfigInput>({
    resolver: zodResolver(agentConfigSchema),
    defaultValues: {
      name: "",
      description: "",
      behaviouralTraits: [],
    },
  })

  const [error, setError] = useState<string>()
  const onSubmit = useCallback(
    async (values: AgentConfigInput) => {
      mutate(values, {
        onSuccess: () => {
          onClose?.(false)
        },
      })
    },
    [onClose, mutate],
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
