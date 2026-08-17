"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="prose prose-neutral dark:prose-invert mb-12">
        <h1>Contact Us</h1>
        <p className="text-muted-foreground">
          Have a question, suggestion, or need help? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-3 mb-12">
        <div className="flex flex-col items-center rounded-xl border bg-card p-6 text-center">
          <Mail className="mb-3 size-6 text-rose-500" />
          <h3 className="mb-1 text-sm font-semibold">Email</h3>
          <a href="mailto:support@viraloKit.app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            support@viraloKit.app
          </a>
        </div>

        <div className="flex flex-col items-center rounded-xl border bg-card p-6 text-center">
          <MessageSquare className="mb-3 size-6 text-blue-500" />
          <h3 className="mb-1 text-sm font-semibold">Feedback</h3>
          <a href="mailto:feedback@viraloKit.app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            feedback@viraloKit.app
          </a>
        </div>

        <div className="flex flex-col items-center rounded-xl border bg-card p-6 text-center">
          <Send className="mb-3 size-6 text-green-500" />
          <h3 className="mb-1 text-sm font-semibold">Business</h3>
          <a href="mailto:hello@viraloKit.app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            hello@viraloKit.app
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-xl rounded-xl border bg-card p-8">
        {submitted ? (
          <div className="text-center py-8">
            <div className="mb-4 text-4xl">✅</div>
            <h3 className="mb-2 text-lg font-semibold">Message Sent!</h3>
            <p className="text-sm text-muted-foreground">
              Thank you for reaching out. We&apos;ll get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="How can we help?" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Tell us more..." rows={5} required />
            </div>
            <Button type="submit" className="w-full">
              <Send className="mr-2 size-4" />
              Send Message
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
