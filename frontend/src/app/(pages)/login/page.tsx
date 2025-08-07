'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'

export default function LoginPage() {

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8fc] flex items-center justify-center">
      <div className="max-w-6xl w-full h-[70vh] bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row">

        {/* Left Section */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Create your <br /> <span className="text-[#1E2D70]">workplace</span></h2>
          {/* <p className="text-sm text-muted-foreground">
            If you don’t have an account <Link href="/register" className="text-[#1E2D70] underline">register here</Link>
          </p> */}


          {error && (
            <div className="text-red-600 text-sm bg-red-100 p-2 rounded">
              {error}
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              className="bg-gray-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              placeholder="Password"
              className="bg-gray-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full bg-gradient-to-r from-[#7B61FF] to-[#9A63F8] text-white">
              Sign In
            </Button>
          </form>

          {/* <div className="flex items-center justify-between gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <Separator className="flex-1" />
          </div> */}

          {/* <div className="flex space-x-4">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
              Google
            </Button>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Image src="/facebook-icon.svg" alt="Facebook" width={20} height={20} />
              Facebook
            </Button>
          </div> */}
        </div>

        {/* Right Section (Image) */}
        <div className="w-full md:w-1/2 bg-[#f5f8fc] p-6 flex items-center justify-center">
          <Image
            src="/02.webp"
            alt="Illustration"
            width={500}
            height={1000}
            className="rounded-xl"
          />
        </div>
      </div>
    </div>
  )
}
