"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface FieldState {
  value: string;
  touched: boolean;
  error: string;
}

export default function AuthPage() {
  const [fields, setFields] = useState({
    email: { value: "", touched: false, error: "" },
    password: { value: "", touched: false, error: "" },
  });
  const [submitError, setSubmitError] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push('/target-urls');
    }
  }, [session, router]);

  const validateField = (name: string, value: string): string => {
    if (!value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }
    if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleBlur = (fieldName: keyof typeof fields) => {
    const error = validateField(fieldName, fields[fieldName].value);
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched: true,
        error,
      }
    }));
  };

  const handleChange = (fieldName: keyof typeof fields, value: string) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        error: prev[fieldName].touched ? validateField(fieldName, value) : "",
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // Touch all fields and validate
    const updatedFields = Object.keys(fields).reduce((acc, fieldName) => ({
      ...acc,
      [fieldName]: {
        ...fields[fieldName as keyof typeof fields],
        touched: true,
        error: validateField(fieldName, fields[fieldName as keyof typeof fields].value)
      }
    }), fields);

    setFields(updatedFields);

    // Check if there are any errors
    const hasErrors = Object.values(updatedFields).some(field => field.error);
    if (hasErrors) return;

    const result = await signIn("credentials", {
      email: fields.email.value,
      password: fields.password.value,
      redirect: false,
    });

    if (result?.error) {
      setSubmitError("Invalid credentials");
    } else {
      router.push("/");
    }
  };

  const getInputClassName = (field: FieldState) => `
    w-full px-3 py-2 border rounded-md text-[#333333]
    ${field.touched && field.error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:border-[#2FBAA9] focus:ring-[#2FBAA9]'}
    focus:outline-none focus:ring-1
  `;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-[40px] font-medium text-[#333333] mb-2">
            Welcome to Reputool
          </h1>
          <h2 className="text-[20px] text-[#666666]">
            Log in to your account
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-[#333333] mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={fields.email.value}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              className={getInputClassName(fields.email)}
              placeholder="sam@example.com"
            />
            {fields.email.touched && fields.email.error && (
              <p className="mt-1 text-sm text-red-500">{fields.email.error}</p>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-[#333333]"
              >
                Password
              </label>
              <a 
                href="#" 
                className="text-sm text-[#666666] hover:text-[#2FBAA9]"
              >
                Forgot your password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={fields.password.value}
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              className={getInputClassName(fields.password)}
              placeholder="••••••••••••"
            />
            {fields.password.touched && fields.password.error && (
              <p className="mt-1 text-sm text-red-500">{fields.password.error}</p>
            )}
          </div>
          {submitError && (
            <div className="text-red-500 text-sm text-center">{submitError}</div>
          )}
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md text-white text-sm font-medium bg-gradient-to-r from-[#2FBAA9] to-[#288176] hover:from-[#2aa697] hover:to-[#236e64] transition-all duration-200"
          >
            Sign in
          </button>
          <div className="text-center">
            <Link
              href="/auth/signup"
              className="text-sm text-[#666666] hover:text-[#2FBAA9]"
            >
              Don&apos;t have an account? Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 