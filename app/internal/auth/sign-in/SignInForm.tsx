"use client";

import { useActionState } from "react";

type SignInState = { error?: string };
type SignInAction = (
  prev: SignInState | null,
  formData: FormData
) => Promise<SignInState>;

export default function SignInForm({
  signInAction,
}: {
  signInAction: SignInAction;
}) {
  const [state, formAction] = useActionState(signInAction, null);

  return (
    <form action={formAction} className="p-8 space-y-5">
      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent"
          placeholder="admin@example.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-slate-800 text-white py-3 rounded-lg font-medium hover:bg-slate-700 transition"
      >
        Masuk
      </button>
    </form>
  );
}
