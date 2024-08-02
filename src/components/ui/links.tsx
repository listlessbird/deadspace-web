import Link from "next/link"
import { PropsWithChildren } from "react"
import { LinkIt, LinkItUrl } from "react-linkify-it"

export function Linkify({ children }: PropsWithChildren) {
  // catches multiple types
  return (
    <UserMentionLink>
      <HashTagLink>
        <UrlLinks>{children}</UrlLinks>
      </HashTagLink>
    </UserMentionLink>
  )
}

function UserMentionLink({ children }: PropsWithChildren) {
  return (
    <LinkIt
      regex={/(@[a-zA-Z0-9_-]+)/}
      component={(match, key) => (
        <Link
          className="text-primary hover:underline"
          key={key}
          href={`/user/${match.slice(1)}`}
        >
          {match}
        </Link>
      )}
    >
      {children}
    </LinkIt>
  )
}

function HashTagLink({ children }: PropsWithChildren) {
  return (
    <LinkIt
      regex={/(#[a-zA-z0-0]+)/}
      component={(match, key) => (
        <Link
          className="text-primary hover:underline"
          key={key}
          href={`/tags/${match.slice(1)}`}
        >
          {match}
        </Link>
      )}
    >
      {children}
    </LinkIt>
  )
}

function UrlLinks({ children }: PropsWithChildren) {
  return (
    <LinkItUrl className="text-primary hover:underline">{children}</LinkItUrl>
  )
}
