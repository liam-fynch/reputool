"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FieldState {
  value: string;
  touched: boolean;
  error: string;
}

const LOCATIONS = ["San Francisco", "New York", "Chicago"];

export default function NewTrackingPage() {
  const [fields, setFields] = useState({
    searchPhrase: { value: "", touched: false, error: "" },
    location: { value: LOCATIONS[0], touched: false, error: "" },
    url: { value: "", touched: false, error: "" },
  });
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateField = (name: string, value: string): string => {
    if (!value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1').trim()} is required`;
    }
    if (name === 'url') {
      try {
        new URL(value);
      } catch {
        return 'Please enter a valid URL (e.g., https://example.com)';
      }
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
    setIsLoading(true);

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
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/tracked-urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchPhrase: fields.searchPhrase.value,
          location: fields.location.value,
          url: fields.url.value,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(
          `/dashboard?` + 
          `searchPhrase=${encodeURIComponent(data.searchPhrase)}` +
          `&location=${encodeURIComponent(data.location)}` +
          `&url=${encodeURIComponent(data.url)}` +
          `&rankPosition=${data.rankPosition || ''}`
        );
      } else {
        const data = await res.json();
        setSubmitError(data.error || "Something went wrong");
        setIsLoading(false);
      }
    } catch (err) {
      setSubmitError("Something went wrong");
      setIsLoading(false);
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
      {isLoading ? (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#2FBAA9] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#666666]">Checking URL ranking...</p>
        </div>
      ) : (
        <div className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-[40px] font-medium text-[#333333] mb-2">
              Track a new URL
            </h1>
            <h2 className="text-[20px] text-[#666666]">
              Monitor your online presence
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="searchPhrase" 
                className="block text-sm font-medium text-[#333333] mb-1"
              >
                Search phrase
              </label>
              <input
                id="searchPhrase"
                type="text"
                value={fields.searchPhrase.value}
                onChange={(e) => handleChange("searchPhrase", e.target.value)}
                onBlur={() => handleBlur("searchPhrase")}
                className={getInputClassName(fields.searchPhrase)}
                placeholder="NY Taxi"
              />
              {fields.searchPhrase.touched && fields.searchPhrase.error && (
                <p className="mt-1 text-sm text-red-500">{fields.searchPhrase.error}</p>
              )}
            </div>
            <div>
              <label 
                htmlFor="location" 
                className="block text-sm font-medium text-[#333333] mb-1"
              >
                Location
              </label>
              <select
                id="location"
                value={fields.location.value}
                onChange={(e) => handleChange("location", e.target.value)}
                onBlur={() => handleBlur("location")}
                className={getInputClassName(fields.location)}
              >
                {LOCATIONS.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              {fields.location.touched && fields.location.error && (
                <p className="mt-1 text-sm text-red-500">{fields.location.error}</p>
              )}
            </div>
            <div>
              <label 
                htmlFor="url" 
                className="block text-sm font-medium text-[#333333] mb-1"
              >
                URL to track
              </label>
              <input
                id="url"
                type="url"
                value={fields.url.value}
                onChange={(e) => handleChange("url", e.target.value)}
                onBlur={() => handleBlur("url")}
                className={getInputClassName(fields.url)}
                placeholder="https://example.com"
              />
              {fields.url.touched && fields.url.error && (
                <p className="mt-1 text-sm text-red-500">{fields.url.error}</p>
              )}
            </div>
            {submitError && (
              <div className="text-red-500 text-sm text-center">{submitError}</div>
            )}
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-md text-white text-sm font-medium bg-gradient-to-r from-[#2FBAA9] to-[#288176] hover:from-[#2aa697] hover:to-[#236e64] transition-all duration-200"
            >
              Start tracking
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 