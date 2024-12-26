"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FieldState {
  value: string;
  touched: boolean;
  error: string;
}

export default function SignUpPage() {
  const [fields, setFields] = useState({
    firstName: { value: "", touched: false, error: "" },
    lastName: { value: "", touched: false, error: "" },
    company: { value: "", touched: false, error: "" },
    email: { value: "", touched: false, error: "" },
    password: { value: "", touched: false, error: "" },
    confirmPassword: { value: "", touched: false, error: "" },
  });
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const validateField = (name: string, value: string): string => {
    if (!value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1').trim()} is required`;
    }
    if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
      return 'Please enter a valid email address';
    }
    if (name === 'password' && value.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (name === 'confirmPassword' && value !== fields.password.value) {
      return 'Passwords do not match';
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
    setIsSubmitting(true);

    try {
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
      if (hasErrors) {
        setIsSubmitting(false);
        return;
      }

      // Create user account
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: fields.firstName.value,
          lastName: fields.lastName.value,
          company: fields.company.value,
          email: fields.email.value,
          password: fields.password.value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Sign in after successful sign up
      const signInResult = await signIn("credentials", {
        email: fields.email.value,
        password: fields.password.value,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error("Failed to sign in after account creation. Please try signing in manually.");
      }

      router.push("/track/new");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong during signup";
      console.error("Signup error:", errorMessage);
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-[40px] font-medium text-[#333333] mb-2">
            Welcome to Reputool
          </h1>
          <h2 className="text-[20px] text-[#666666]">
            Create an account
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="firstName" 
              className="block text-sm font-medium text-[#333333] mb-1"
            >
              First name
            </label>
            <input
              id="firstName"
              type="text"
              value={fields.firstName.value}
              onChange={(e) => handleChange("firstName", e.target.value)}
              onBlur={() => handleBlur("firstName")}
              className={`w-full px-3 py-2 border rounded-md text-[#333333] ${
                fields.firstName.touched && fields.firstName.error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-[#2FBAA9] focus:ring-[#2FBAA9]'
              } focus:outline-none focus:ring-1`}
              placeholder="Liam"
              disabled={isSubmitting}
            />
            {fields.firstName.touched && fields.firstName.error && (
              <p className="mt-1 text-sm text-red-500">{fields.firstName.error}</p>
            )}
          </div>
          <div>
            <label 
              htmlFor="lastName" 
              className="block text-sm font-medium text-[#333333] mb-1"
            >
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              value={fields.lastName.value}
              onChange={(e) => handleChange("lastName", e.target.value)}
              onBlur={() => handleBlur("lastName")}
              className={`w-full px-3 py-2 border rounded-md text-[#333333] ${
                fields.lastName.touched && fields.lastName.error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-[#2FBAA9] focus:ring-[#2FBAA9]'
              } focus:outline-none focus:ring-1`}
              placeholder="Campbell"
              disabled={isSubmitting}
            />
            {fields.lastName.touched && fields.lastName.error && (
              <p className="mt-1 text-sm text-red-500">{fields.lastName.error}</p>
            )}
          </div>
          <div>
            <label 
              htmlFor="company" 
              className="block text-sm font-medium text-[#333333] mb-1"
            >
              Company
            </label>
            <input
              id="company"
              type="text"
              value={fields.company.value}
              onChange={(e) => handleChange("company", e.target.value)}
              onBlur={() => handleBlur("company")}
              className={`w-full px-3 py-2 border rounded-md text-[#333333] ${
                fields.company.touched && fields.company.error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-[#2FBAA9] focus:ring-[#2FBAA9]'
              } focus:outline-none focus:ring-1`}
              placeholder="Fynch"
              disabled={isSubmitting}
            />
            {fields.company.touched && fields.company.error && (
              <p className="mt-1 text-sm text-red-500">{fields.company.error}</p>
            )}
          </div>
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
              className={`w-full px-3 py-2 border rounded-md text-[#333333] ${
                fields.email.touched && fields.email.error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-[#2FBAA9] focus:ring-[#2FBAA9]'
              } focus:outline-none focus:ring-1`}
              placeholder="liam@fyn.ch"
              disabled={isSubmitting}
            />
            {fields.email.touched && fields.email.error && (
              <p className="mt-1 text-sm text-red-500">{fields.email.error}</p>
            )}
          </div>
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-[#333333] mb-1"
            >
              Choose a password
            </label>
            <input
              id="password"
              type="password"
              value={fields.password.value}
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              className={`w-full px-3 py-2 border rounded-md text-[#333333] ${
                fields.password.touched && fields.password.error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-[#2FBAA9] focus:ring-[#2FBAA9]'
              } focus:outline-none focus:ring-1`}
              placeholder="••••••••••••"
              disabled={isSubmitting}
            />
            {fields.password.touched && fields.password.error && (
              <p className="mt-1 text-sm text-red-500">{fields.password.error}</p>
            )}
          </div>
          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-[#333333] mb-1"
            >
              Re-enter password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={fields.confirmPassword.value}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              className={`w-full px-3 py-2 border rounded-md text-[#333333] ${
                fields.confirmPassword.touched && fields.confirmPassword.error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-[#2FBAA9] focus:ring-[#2FBAA9]'
              } focus:outline-none focus:ring-1`}
              placeholder="••••••••••••"
              disabled={isSubmitting}
            />
            {fields.confirmPassword.touched && fields.confirmPassword.error && (
              <p className="mt-1 text-sm text-red-500">{fields.confirmPassword.error}</p>
            )}
          </div>
          {submitError && (
            <div className="text-red-500 text-sm text-center">{submitError}</div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded-md text-white text-sm font-medium bg-gradient-to-r from-[#2FBAA9] to-[#288176] hover:from-[#2aa697] hover:to-[#236e64] transition-all duration-200 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
} 