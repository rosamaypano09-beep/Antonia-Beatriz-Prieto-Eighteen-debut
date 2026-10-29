"use client"

import { useEffect, useMemo, useState } from "react"
import { Playfair_Display } from "next/font/google"
import { cinzel } from "@/lib/fonts"
import { Check, Copy, ExternalLink, Link2, Mail, Pencil, Phone, RotateCcw, Share2, X } from "lucide-react"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"
import { useSiteConfig } from "@/hooks/use-site-config"
import { celebrantName } from "@/lib/celebrant"
import { ShareSheet, copyTextNow } from "@/components/share-platforms"

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"] })

const FIELD =
  "w-full rounded-xl border border-dash-border bg-dash-bg px-3 py-2.5 outline-none transition-colors focus:border-dash-focus focus:bg-white focus:ring-2 focus:ring-dash-focus/40"

/** The guest a share starts from — omitted when sharing the invitation in general. */
export type ShareInvitationGuest = {
  name: string
  email?: string
  contact?: string
  allowedGuests?: number
}

type ShareInvitationModalProps = {
  open: boolean
  onClose: () => void
  guest?: ShareInvitationGuest | null
}

/** Share the main invitation page: guest name, editable message preview, then pick an app. */
export function ShareInvitationModal({ open, onClose, guest }: ShareInvitationModalProps) {
  const siteConfig = useSiteConfig()
  const [name, setName] = useState("")
  const [customMessage, setCustomMessage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showShareSheet, setShowShareSheet] = useState(false)
  const [copied, setCopied] = useState<"message" | "link" | null>(null)

  useBodyScrollLock(open)

  // Start fresh each time the window opens (prefilled from the guest row, if any)
  useEffect(() => {
    if (!open) return
    setName(guest?.name ?? "")
    setCustomMessage(null)
    setIsEditing(false)
    setShowShareSheet(false)
    setCopied(null)
  }, [open, guest])

  // Escape closes the share panel first, then this window
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (showShareSheet) setShowShareSheet(false)
      else onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, showShareSheet, onClose])

  const url = typeof window !== "undefined" ? `${window.location.origin}/` : "/"
  const celebrant = celebrantName(siteConfig)

  const defaultMessage = useMemo(() => {
    const trimmed = name.trim()
    const date = siteConfig.wedding.date
    const day = siteConfig.ceremony.day ?? "Saturday"
    const time = siteConfig.ceremony.time ?? siteConfig.wedding.time
    const venue = siteConfig.ceremony.location
    const deadline = siteConfig.details.rsvp.deadline
    const pax = guest && guest.name === trimmed ? guest.allowedGuests ?? 1 : 1

    const lines = [
      trimmed ? `Dear ${trimmed},` : "Hello,",
      "",
      `You are warmly invited to ${celebrant}'s Debut!`,
      "",
      `${date} | ${day} | ${time}`,
      venue,
      "",
      "Please open the invitation for all the details, then tap RSVP, search your name and let us know if you can come.",
    ]
    if (pax > 1) lines.push(`This invitation is good for ${pax} persons.`)
    if (deadline) lines.push(`Kindly reply by ${deadline}.`)
    lines.push("", "Open your invitation:", url, "", "With love,", celebrant)
    return lines.join("\n")
  }, [name, guest, siteConfig, celebrant, url])

  // Edits stick until reset, but the link always stays in the message
  const message = customMessage ?? defaultMessage
  const isCustom = customMessage !== null && customMessage !== defaultMessage
  const missingLink = !message.includes(url)
  const finalMessage = missingLink ? `${message.trimEnd()}\n\n${url}` : message

  if (!open) return null

  const trimmedName = name.trim()
  const contactLine = [guest?.contact, guest?.email].filter(Boolean)
  const sameGuest = guest && guest.name === trimmedName

  const flashCopied = (what: "message" | "link") => {
    copyTextNow(what === "message" ? finalMessage : url)
    setCopied(what)
    window.setTimeout(() => setCopied((c) => (c === what ? null : c)), 2500)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-invitation-title"
          onClick={(e) => e.stopPropagation()}
          className="dash-sheet relative flex max-h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
        >
          {/* Header */}
          <div className="relative shrink-0 border-b border-dash-border bg-dash-bg px-4 pb-4 pt-3 sm:px-6 sm:py-5">
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-dash-border sm:hidden" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-dash-border bg-white text-gray-500 shadow-sm transition-colors hover:text-dash-ink sm:right-5 sm:top-5"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="px-10 text-center sm:px-0 sm:pr-14 sm:text-left">
              <p className={`${cinzel.className} text-[10px] font-semibold uppercase tracking-[0.28em] text-dash-accent`}>
                Share Invitation
              </p>
              <h2
                id="share-invitation-title"
                className={`${playfair.className} mt-1 text-[1.45rem] font-semibold leading-tight text-dash-ink sm:text-2xl`}
              >
                {trimmedName || `${celebrant}'s Debut`}
              </h2>
              <p className="mx-auto mt-1.5 max-w-xs text-[11px] leading-relaxed text-gray-500 sm:mx-0 sm:max-w-none sm:text-xs">
                Send the invitation page — guests RSVP by searching their name.
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
            <div className="space-y-1">
              <label htmlFor="share-guest-name" className="flex items-center justify-between gap-2 text-[13px] font-medium text-dash-ink">
                <span>Guest name</span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Optional</span>
              </label>
              <input
                id="share-guest-name"
                type="text"
                autoComplete="off"
                placeholder="e.g., Maria Clara Santos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={FIELD}
              />
              <p className="text-[11px] text-gray-500">
                {trimmedName ? (
                  <>
                    The message starts with <span className="font-semibold text-dash-primary">&ldquo;Dear {trimmedName},&rdquo;</span>
                  </>
                ) : (
                  <>Leave it empty to send one message to anyone or post it in a group chat.</>
                )}
              </p>
              {sameGuest && contactLine.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {guest?.contact && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-dash-tint px-2.5 py-1 text-[11px] font-medium text-dash-primary">
                      <Phone className="h-3 w-3" />
                      {guest.contact}
                    </span>
                  )}
                  {guest?.email && (
                    <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-dash-tint px-2.5 py-1 text-[11px] font-medium text-dash-primary">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{guest.email}</span>
                    </span>
                  )}
                  <span className="self-center text-[10.5px] text-gray-500">
                    WhatsApp, Email &amp; Message open straight to them
                  </span>
                </div>
              )}
            </div>

            {/* Message preview — tap Edit to change it */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-dash-ink">Message preview</p>
                <div className="flex items-center gap-1">
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomMessage(null)
                        setIsEditing(false)
                      }}
                      className="flex h-8 items-center gap-1 rounded-full px-2.5 text-[12px] font-medium text-gray-500 transition-colors hover:bg-dash-surface hover:text-dash-ink"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isEditing && customMessage === null) setCustomMessage(defaultMessage)
                      setIsEditing((v) => !v)
                    }}
                    className={`flex h-8 items-center gap-1 rounded-full px-3 text-[12px] font-semibold transition-colors ${
                      isEditing ? "bg-dash-primary text-white" : "bg-dash-tint text-dash-primary hover:brightness-95"
                    }`}
                  >
                    {isEditing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    {isEditing ? "Done" : "Edit"}
                  </button>
                </div>
              </div>

              {isEditing ? (
                <textarea
                  value={message}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={12}
                  autoFocus
                  className={`${FIELD} resize-y text-[14px] leading-relaxed sm:text-[13px]`}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (customMessage === null) setCustomMessage(defaultMessage)
                    setIsEditing(true)
                  }}
                  className="block w-full rounded-2xl rounded-tl-md border border-dash-border bg-dash-surface p-3.5 text-left transition-colors hover:border-dash-accent/50"
                  aria-label="Edit message"
                >
                  <p className="max-h-60 overflow-y-auto whitespace-pre-wrap text-[13px] leading-relaxed text-dash-ink [overflow-wrap:anywhere]">
                    {finalMessage}
                  </p>
                </button>
              )}
              {missingLink && (
                <p className="text-[11px] text-amber-700">The invitation link was removed, so it&apos;s added back at the end.</p>
              )}
              {sameGuest === false && guest && (
                <p className="text-[11px] text-gray-500">Name changed — WhatsApp, Email &amp; Message won&apos;t pick a contact for you.</p>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-dash-border bg-dash-bg py-1.5 pl-3 pr-1.5">
              <Link2 className="h-4 w-4 shrink-0 text-dash-accent" />
              <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-gray-500">{url}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open invitation"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-white hover:text-dash-primary"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={() => flashCopied("link")}
                className={`flex h-8 shrink-0 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
                  copied === "link" ? "bg-dash-accent text-white" : "bg-white text-dash-primary ring-1 ring-dash-border hover:bg-dash-surface"
                }`}
              >
                {copied === "link" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === "link" ? "Copied" : "Link"}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 flex-col gap-2 border-t border-dash-border bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false)
                setShowShareSheet(true)
              }}
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-dash-primary px-6 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_color-mix(in_srgb,var(--color-dash-ink)_70%,transparent)] transition-all hover:brightness-110 active:scale-[0.99] sm:order-2"
            >
              <Share2 className="h-4 w-4" />
              Share Invite
            </button>
            <button
              type="button"
              onClick={() => flashCopied("message")}
              className={`flex h-11 items-center justify-center gap-2 rounded-full border px-6 text-sm font-semibold transition-all active:scale-[0.99] sm:order-1 ${
                copied === "message"
                  ? "border-dash-accent bg-dash-accent text-white"
                  : "border-dash-border bg-white text-dash-ink hover:bg-dash-surface"
              }`}
            >
              {copied === "message" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied === "message" ? "Message copied!" : "Copy Message"}
            </button>
          </div>
        </div>
      </div>

      <ShareSheet
        open={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        guestName={trimmedName}
        roleTitle={`${celebrant}'s Debut invitation`}
        canNativeShare={typeof navigator !== "undefined" && typeof navigator.share === "function"}
        payload={{
          text: finalMessage,
          url,
          subject: trimmedName
            ? `${celebrant}'s Debut — You're invited, ${trimmedName}!`
            : `You're invited to ${celebrant}'s Debut!`,
          email: sameGuest ? guest?.email : undefined,
          phone: sameGuest ? guest?.contact : undefined,
        }}
      />
    </>
  )
}
