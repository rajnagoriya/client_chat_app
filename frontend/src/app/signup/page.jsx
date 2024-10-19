"use client";

import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import AuthForm from "../components/Auth/AuthForm";
import { useStateContext } from "@/providers/StateContext";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";



export default function SignupPage() {
  const { state, setUser } = useStateContext();
  const { user } = state;
  const router = useRouter();
 
  const [loading, setLoading] = useState(false);

  const handleSignup = async (user) => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_HOST}/api/v1/user/register`, user);
      if (response) {
        Cookies.set("chatAppToken", response.data.data, { expires: 7 });
        const userData = jwtDecode(response.data.data);
        setUser(userData);
        toast.success(response.data.message ||"Signup successful");
        router.push("/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-sm w-full bg-white p-6 rounded-md shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">
          {loading ? "Processing..." : "Create an Account"}
        </h2>
        <AuthForm type="signup" onSubmit={handleSignup} loading={loading} />
      </div>
    </div>
  );
}
