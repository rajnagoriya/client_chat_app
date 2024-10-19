"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthForm({ type, onSubmit, loading }) {
  const router = useRouter();
  const [user, setUserState] = useState({ email: "", password: "", username: "" });
  const [isDisabled, setIsDisabled] = useState(true);
  const [variant, setVariant] = useState(type);

  const toggleVariant = () =>{
    if(variant === 'signup'){
        router.push("/login");
    }else {
        router.push("/signup");
    }
};

  useEffect(() => {
    if (variant === "signup") {
      setIsDisabled(!user.email || !user.password || !user.username);
    } else {
      setIsDisabled(!user.email || !user.password);
    }
  }, [user, variant]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserState({ ...user, [name]: value });
  };

  const handleSubmit = () => {
    if (!isDisabled) {
      onSubmit(user);
    }
  };

  return (
    <div className="space-y-4">
      {variant === "signup" && (
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={user.username}
          onChange={handleInputChange}
          className="input input-bordered w-full"
        />
      )}
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={user.email}
        onChange={handleInputChange}
        className="input input-bordered w-full"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={user.password}
        onChange={handleInputChange}
        className="input input-bordered w-full"
      />
      <button
        onClick={handleSubmit}
        disabled={isDisabled || loading}
        className={`btn w-full mt-4 ${loading ? "loading" : "bg-blue-600 text-white"}`}
      >
        {loading ? "Please wait..." : variant === "signup" ? "Sign Up" : "Login"}
      </button>
      <div className="
                    flex
                    gap-2
                    justify-center
                    text-sm
                    mt-6
                    px-2
                    text-gray-500
                ">
                    {variant === 'signup' ? 'Already have an account?': 'Do not have account?'}
                    <div onClick={toggleVariant}
                className="
                    underline 
                    cursor-pointer 
                    text-gray-900
                "
            >
                {variant === 'signup' ? 'Login' : 'Create an account'}
            </div>
                </div>
    </div>
  );
}
