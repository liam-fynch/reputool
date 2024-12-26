"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TrackedUrl {
  id: string;
  searchPhrase: string;
  location: string;
  url: string;
  createdAt: string;
}

export default function TargetUrlsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trackedUrls, setTrackedUrls] = useState<TrackedUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackedUrls = async () => {
      try {
        const response = await fetch("/api/tracked-urls");
        if (response.ok) {
          const data = await response.json();
          setTrackedUrls(data);
        }
      } catch (error) {
        console.error("Failed to fetch tracked URLs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchTrackedUrls();
    }
  }, [status]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tracked URL?")) {
      return;
    }

    setDeleteLoading(id);
    try {
      const response = await fetch(`/api/tracked-urls/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTrackedUrls(prev => prev.filter(url => url.id !== id));
      } else {
        console.error('Failed to delete URL');
      }
    } catch (error) {
      console.error('Error deleting URL:', error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleRowClick = (url: TrackedUrl) => {
    router.push(
      `/dashboard?` +
      `searchPhrase=${encodeURIComponent(url.searchPhrase)}` +
      `&location=${encodeURIComponent(url.location)}` +
      `&url=${encodeURIComponent(url.url)}` +
      `&id=${url.id}`
    );
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div>Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-medium text-[#333333]">Target URLs</h1>
              <p className="text-[#666666] mt-1">
                Welcome back, {session?.user?.firstName}
              </p>
            </div>
            <button
              onClick={() => router.push("/track/new")}
              className="px-4 py-2 rounded-md text-white text-sm font-medium bg-gradient-to-r from-[#2FBAA9] to-[#288176] hover:from-[#2aa697] hover:to-[#236e64] transition-all duration-200"
            >
              Add new URL
            </button>
          </div>

          {trackedUrls.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-[#666666]">
                No URLs tracked yet
              </h3>
              <p className="text-[#888888] mt-2">
                Start by adding a URL to track
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Search Phrase
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trackedUrls.map((url) => (
                    <tr 
                      key={url.id}
                      className="hover:bg-gray-50"
                    >
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                        onClick={() => handleRowClick(url)}
                      >
                        {url.searchPhrase}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                        onClick={() => handleRowClick(url)}
                      >
                        {url.location}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                        onClick={() => handleRowClick(url)}
                      >
                        {url.url}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                        onClick={() => handleRowClick(url)}
                      >
                        {new Date(url.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(url.id);
                          }}
                          className="text-[#666666] hover:text-[#FF4D4D] transition-colors"
                          disabled={deleteLoading === url.id}
                        >
                          {deleteLoading === url.id ? (
                            <div className="w-5 h-5 border-2 border-[#666666] border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg
                              className="w-5 h-5"
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
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 