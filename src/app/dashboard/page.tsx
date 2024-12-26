"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDeleting, setIsDeleting] = useState(false);

  const searchPhrase = searchParams.get("searchPhrase") || "NY Taxi";
  const location = searchParams.get("location") || "San Francisco, CA";
  const url = searchParams.get("url") || "www.badthing.com";
  const rankPosition = searchParams.get("rankPosition");
  const urlId = searchParams.get("id");

  const handleDelete = async () => {
    if (!urlId) {
      console.error('No URL ID provided');
      return;
    }

    if (!confirm("Are you sure you want to delete this tracked URL?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tracked-urls/${urlId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/target-urls');
      } else {
        console.error('Failed to delete URL');
      }
    } catch (error) {
      console.error('Error deleting URL:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#2FBAA9] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#666666]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-[#333333]">Home</h1>
        </div>

        {/* Search Parameters Section */}
        <div className="mb-6">
          <div className="flex items-center gap-6">
            <div>
              <label className="block text-sm text-[#666666] mb-2">
                SEARCH PHRASE
              </label>
              <select 
                className="w-[300px] p-2 bg-[#F8F9FA] border border-gray-200 rounded-md text-[#333333] appearance-none cursor-pointer hover:border-gray-300 transition-colors"
                value={searchPhrase}
                onChange={() => {}}
              >
                <option value={searchPhrase}>{searchPhrase}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#666666] mb-2">
                LOCATION
              </label>
              <select 
                className="w-[300px] p-2 bg-[#F8F9FA] border border-gray-200 rounded-md text-[#333333] appearance-none cursor-pointer hover:border-gray-300 transition-colors"
                value={location}
                onChange={() => {}}
              >
                <option value={location}>{location}</option>
              </select>
            </div>
            <button 
              className="flex items-center text-[#666666] hover:text-[#FF4D4D] transition-colors mt-8"
              onClick={handleDelete}
              disabled={isDeleting || !urlId}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#666666] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete this keyphrase
                </>
              )}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-b border-gray-200 mb-8"></div>

        {/* Main Content */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-[#666666] mb-1">
              URL
            </label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md bg-white"
              value={url}
              onChange={() => {}}
            >
              <option value={url}>{url}</option>
            </select>
          </div>

          {/* Visibility Section */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-medium text-[#333333] mb-4">
              Visibility for this negative over time
            </h2>
            <div className="flex items-center space-x-8 mb-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFE5E5] text-[#FF4D4D] text-xl font-medium">
                  {rankPosition ? parseInt(rankPosition).toString() : "-"}
                </div>
                <div className="mt-2 text-sm text-[#666666]">
                  Visibility Score
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFF3E5] text-[#FF9933] text-xl font-medium">
                  {rankPosition ? parseInt(rankPosition).toString() : "-"}
                </div>
                <div className="mt-2 text-sm text-[#666666]">
                  Position of negative
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E5FFE5] text-[#33CC33] text-xl font-medium">
                  -
                </div>
                <div className="mt-2 text-sm text-[#666666]">
                  Change since last scan
                </div>
              </div>
            </div>

            {/* Graph Placeholder */}
            <div className="h-64 bg-gray-50 rounded-lg"></div>

            <div className="mt-4 text-right text-sm text-[#666666]">
              Last update: {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-[#333333]">Summary</h2>
              <button className="text-sm text-[#666666]">Mark as read</button>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#FFE5E5] flex items-center justify-center">
                  ⚠️
                </div>
              </div>
              <div>
                <h3 className="text-base font-medium text-[#333333] mb-2">
                  Your visibility score has increased
                </h3>
                <p className="text-sm text-[#666666]">
                  Your top negative {url} is {rankPosition ? `in position ${rankPosition}` : "being tracked"} for a Google search from {location} as of {new Date().toLocaleDateString()}. 
                  {rankPosition && <span> The visibility score has increased (bad) since the last scan.</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 