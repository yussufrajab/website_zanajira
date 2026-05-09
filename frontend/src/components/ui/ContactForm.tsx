"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export function ContactForm() {
  const t = useTranslations("contact");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const schema = z.object({
    full_name: z.string().min(1, t("name_required")).max(100, t("name_max")),
    email: z
      .string()
      .min(1, t("email_required"))
      .email(t("email_invalid")),
    subject: z
      .string()
      .min(1, t("subject_required"))
      .max(200, t("subject_max")),
    message: z
      .string()
      .min(1, t("message_required"))
      .max(2000, t("message_max")),
    honeypot: z.string().optional(),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setResult({ success: true, message: t("success") });
        reset();
      } else {
        setResult({ success: false, message: t("error") });
      }
    } catch {
      setResult({ success: false, message: t("error") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Honeypot — hidden from real users, bots fill it */}
      <div className="hidden" aria-hidden="true">
        <input type="text" tabIndex={-1} autoComplete="off" {...register("honeypot")} />
      </div>

      {result && (
        <div
          className={`p-4 rounded-lg ${
            result.success
              ? "bg-primary-light text-success border border-primary-light"
              : "bg-red-50 text-error border border-red-200"
          }`}
        >
          {result.message}
        </div>
      )}

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium mb-1">
          {t("name")}
        </label>
        <input
          id="full_name"
          type="text"
          placeholder={t("name_placeholder")}
          {...register("full_name")}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-error">{errors.full_name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          placeholder={t("email_placeholder")}
          {...register("email")}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-error">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-1">
          {t("subject")}
        </label>
        <input
          id="subject"
          type="text"
          placeholder={t("subject_placeholder")}
          {...register("subject")}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-error">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          {t("message")}
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder={t("message_placeholder")}
          {...register("message")}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-error">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 font-medium"
      >
        {submitting ? t("sending") : t("submit")}
      </button>
    </form>
  );
}