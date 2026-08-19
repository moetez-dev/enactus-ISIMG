"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "@/lib/validators";
import { apiFetch, ApiError } from "@/lib/client-api";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/use-toast";
import type { z } from "zod";

type ContactInput = z.infer<typeof contactSchema>;

export function ContactForm() {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  async function onSubmit(values: ContactInput) {
    try {
      await apiFetch<{ id: string }>("/api/contact", {
        method: "POST",
        body: JSON.stringify(values),
      });
      toast.success("Message sent! We'll get back to you soon.");
      reset();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not send message.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="label">
            Full Name *
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            className="input"
            placeholder="Your name"
            {...register("name")}
          />
          {errors.name ? (
            <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
              {errors.name.message}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="contact-email" className="label">
            Email *
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email ? (
            <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="label">
          Subject
        </label>
        <input
          id="contact-subject"
          type="text"
          className="input"
          placeholder="How can we help?"
          {...register("subject")}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="label">
          Message *
        </label>
        <textarea
          id="contact-message"
          className="input h-32 resize-none"
          placeholder="Your message…"
          {...register("message")}
        />
        {errors.message ? (
          <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
            {errors.message.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full py-4" loading={isSubmitting}>
        {isSubmitting ? "Sending" : "Send Message"}
      </Button>
    </form>
  );
}