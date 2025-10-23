"use client";

import Link from "next/link";
import React from "react";

export default function RegisterPage() {
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    setError(null);
    const fd = new FormData(e.currentTarget);
    const pwd = String(fd.get("password") || "");
    const cpw = String(fd.get("confirmPassword") || "");
    if (pwd !== cpw) {
      e.preventDefault(); // tahan submit
      setError("Konfirmasi password tidak sama");
    }
  }

  return (
    <main className="wrapper">
      <section className="card">
        <h1 className="title">Create Account</h1>
        <p className="subtitle">It’s quick and easy</p>

        <form
          ref={formRef}
          className="form"
          action="/api/auth/register"
          method="post"
          onSubmit={onSubmit}
        >
          <label className="label">
            <span>Name</span>
            <input className="input" type="text" name="name" required />
          </label>

          <label className="label">
            <span>Email</span>
            <input className="input" type="email" name="email" required />
          </label>

          <label className="label">
            <span>Phone (optional)</span>
            <input
              className="input"
              type="tel"
              name="phone"
              placeholder="62xxxxxxxxxx"
            />
          </label>

          <label className="label">
            <span>Password</span>
            <input className="input" type="password" name="password" required />
          </label>

          <label className="label">
            <span>Confirm Password</span>
            <input
              className="input"
              type="password"
              name="confirmPassword"
              required
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button className="primaryBtn" type="submit">
            Create account
          </button>
        </form>

        <p className="bottomText">
          Already have an account?{" "}
          <Link href="/login" className="link">
            Sign in
          </Link>
        </p>
      </section>

      <style jsx>{`
        .wrapper {
          min-height: 100dvh;
          display: grid;
          place-items: center;
          padding: 24px;
          background: #f7f9fc;
        }
        .card {
          width: 100%;
          max-width: 420px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
          padding: 28px;
        }
        .title {
          margin: 0 0 4px;
          font-size: 28px;
          font-weight: 700;
        }
        .subtitle {
          margin: 0 0 20px;
          color: #6b7280;
        }
        .form {
          display: grid;
          gap: 14px;
          margin-bottom: 10px;
        }
        .label {
          display: grid;
          gap: 6px;
          font-size: 14px;
          color: #374151;
        }
        .input {
          height: 44px;
          padding: 0 12px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          outline: none;
        }
        .input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .primaryBtn {
          width: 100%;
          height: 44px;
          border: 0;
          border-radius: 10px;
          background: #2563eb;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          margin-top: 6px;
        }
        .primaryBtn:hover {
          filter: brightness(1.05);
        }
        .bottomText {
          margin-top: 14px;
          text-align: center;
          color: #6b7280;
        }
        .link {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
        }
        .link:hover {
          text-decoration: underline;
        }
        .error {
          margin-top: 2px;
          color: #dc2626;
          font-size: 14px;
        }
      `}</style>
    </main>
  );
}
