"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeftIcon, PhotoIcon } from "@heroicons/react/24/outline";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  preferences: {
    newsletter: boolean;
    marketing: boolean;
    productUpdates: boolean;
  };
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // Initialize form data
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    preferences: {
      newsletter: true,
      marketing: false,
      productUpdates: true
    }
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      // Initialize form with user data
      if (session.user) {
        const names = (session.user.name || "").split(" ");
        setFormData({
          firstName: names[0] || "",
          lastName: names.slice(1).join(" ") || "",
          email: session.user.email || "",
          phone: "",
          bio: "",
          preferences: {
            newsletter: true,
            marketing: false,
            productUpdates: true
          }
        });
      }
      setLoading(false);
    }
  }, [status, session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: checked
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      // In a real app, this would update the user profile through an API
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     name: `${formData.firstName} ${formData.lastName}`.trim(),
      //     phone: formData.phone,
      //     bio: formData.bio,
      //     preferences: formData.preferences
      //   }),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to update profile');
      // }

      // Update the session (to reflect name changes, etc.)
      await update({
        ...session,
        user: {
          ...session?.user,
          name: `${formData.firstName} ${formData.lastName}`.trim()
        }
      });
      
      // Show success message
      setMessage("Profile updated successfully");
      
      // Simulate API delay
      setTimeout(() => {
        setIsSaving(false);
      }, 800);
    } catch (err) {
      setError("An error occurred while updating your profile");
      console.error(err);
      setIsSaving(false);
    }
  };

  if (loading) {
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
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Link 
            href="/account?tab=dashboard"
            className="flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Back to Account
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
          
          {message && (
            <div className="bg-green-50 text-green-800 rounded-lg px-4 py-3 mb-6">
              {message}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 text-red-800 rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className="relative">
              {session?.user?.image ? (
                <div className="relative h-24 w-24 rounded-full overflow-hidden">
                  <Image 
                    src={session.user.image} 
                    alt={session.user.name || "Profile"} 
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <PhotoIcon className="h-12 w-12 text-primary/60" />
                </div>
              )}
              
              <button 
                type="button"
                className="mt-2 text-primary text-sm font-medium hover:underline"
              >
                Change Photo
              </button>
            </div>
            
            <div className="flex-grow">
              <h3 className="text-lg font-bold">{session?.user?.name || "User"}</h3>
              <p className="text-gray-500">{session?.user?.email}</p>
              <p className="text-gray-500 mt-2">Member since {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full border border-gray-300 bg-gray-50 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(555) 555-5555"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                placeholder="Tell us a little about yourself..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-3">Communication Preferences</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newsletter"
                    name="newsletter"
                    checked={formData.preferences.newsletter}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
                    Subscribe to newsletter
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="marketing"
                    name="marketing"
                    checked={formData.preferences.marketing}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="marketing" className="ml-2 block text-sm text-gray-700">
                    Receive marketing communications
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="productUpdates"
                    name="productUpdates"
                    checked={formData.preferences.productUpdates}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="productUpdates" className="ml-2 block text-sm text-gray-700">
                    Receive product updates and offers
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Link 
                href="/account?tab=dashboard"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold mb-4">Password & Security</h2>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <p className="text-gray-700">Change your password and update security settings</p>
              <p className="text-gray-500 text-sm mt-1">Last updated: 3 months ago</p>
            </div>
            <Link
              href="/account/password"
              className="px-4 py-2 mt-4 md:mt-0 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors inline-block"
            >
              Change Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 