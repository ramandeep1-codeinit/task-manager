'use client'

import Image from 'next/image'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import { Eye, EyeOff } from "lucide-react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // ✅ Validation for required fields
    if (!email || !password) {
      toast.error("Please fill all required fields.")
      setLoading(false)
      return
    }

    // ✅ Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email.")
      setLoading(false)
      return
    }

    try {
      await login(email, password)
      toast.success('Login successful!')
    } catch (err: any) {
      const backendMessage = err.response?.data?.message

      if (backendMessage === "User does not exist") {
        toast.error("Email is incorrect")
      } else if (backendMessage === "Invalid credentials") {
        toast.error("Password is incorrect")
      } else {
        toast.error(backendMessage || "Invalid email or password")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] flex items-center justify-center">
      <div className="max-w-6xl w-full h-[70vh] bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row">

        {/* Left Section */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Create your <br /> 
            <span className="text-[#1E2D70]">workplace</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            {/* Email Input */}
            <Input
              type="text"
              name="username"
              placeholder="Email"
              autoComplete="username"
              className="bg-gray-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password Input */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="current-password"
                placeholder="Password"
                autoComplete="new-password" 
                className="bg-gray-100 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#7B61FF] to-[#9A63F8] text-white hover:to-[#7d3ff1] transition-colors duration-300"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </div>

        {/* Right Section (Image) */}
        <div className="w-full md:w-1/2 bg-[#f5f8fc] p-6 flex items-center justify-center">
          <div className="relative w-full h-64 md:h-full">
            <Image
              src="/02.webp"
              alt="Illustration"
              fill
              className="rounded-xl object-contain md:object-cover"
              priority
            />
          </div>
        </div>

      </div>
    </div>
  )
}
