"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import ChatDashboard from "@/components/admin/ChatDashboard";
import { useChat } from "@/contexts/ChatContext";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function AdminChatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const { fetchConversations } = useChat();
  
  useEffect(() => {
    // Auth protection
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/");
      }
    }
  }, [status, session, router]);

  // Reload conversations when userId filter changes
  useEffect(() => {
    fetchConversations();
  }, [userId, fetchConversations]);
  
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <Link 
              href={userId ? `/admin/users/${userId}` : "/admin"} 
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">
              {userId ? "User Conversations" : "Customer Support"}
            </h1>
          </div>
          <p className="text-gray-600 mt-1">
            {userId 
              ? "View and manage conversations with this customer" 
              : "Manage support conversations and respond to customer inquiries"}
          </p>
        </div>
      </div>
      
      <ChatDashboard isStandalone={true} />
    </div>
  );
} 