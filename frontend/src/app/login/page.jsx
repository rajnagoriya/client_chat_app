"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import AuthForm from "../components/Auth/AuthForm";
import { useStateContext } from "../../providers/StateContext";
import {jwtDecode} from "jwt-decode";
import Cookies from "js-cookie";

export default function LoginPage() {
  const { state, setUser } = useStateContext();
  const { user } = state;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (userFormData) => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_HOST}/api/v1/user/login`, userFormData);

      if (response.data) {

        const token = response.data.data;
        Cookies.set("chatAppToken", token, { expires: 7 });
        const userData = jwtDecode(token);
        setUser(userData);

        toast.success("Login successful");
        router.push("/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-sm w-full bg-white p-6 rounded-md shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">
          {loading ? "Logging in..." : "Login"}
        </h2>
        <AuthForm type="login" onSubmit={handleLogin} loading={loading} />
      </div>
    </div>
  );
}
