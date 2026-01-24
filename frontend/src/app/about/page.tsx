"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu11Icon } from "@hugeicons/core-free-icons"

const clients = [
  { name: "Google", logo: "/client/Google.png" },
  { name: "Amazon", logo: "/client/Amazon.png" },
  { name: "NVIDIA", logo: "/client/NVIDIA.png" },
  { name: "PayPal", logo: "/client/PayPal.png" },
  { name: "Visa", logo: "/client/Visa.png" },
]

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hamburger Menu - Top Right */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-6 right-6 z-50 w-12 h-12 flex items-center justify-center bg-white border border-gray-200 hover:border-[#09f] transition-colors"
      >
        <HugeiconsIcon icon={Menu11Icon} className="w-6 h-6 text-black" />
      </button>

      {/* Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/20"
            />
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-20 right-6 z-50 w-56 bg-white border border-gray-200 shadow-lg"
            >
              <nav className="py-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-[#09f] transition-colors"
                >
                  Overview
                </Link>
                <Link
                  href="/guidelines"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-[#09f] transition-colors"
                >
                  Guidelines
                </Link>
                <div className="border-t border-gray-100 my-1" />
                <Link
                  href="/about"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-[#09f] bg-gray-50"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-[#09f] transition-colors"
                >
                  Contact
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Image (5/12) */}
        <div className="w-full lg:w-5/12 order-2 lg:order-1 relative">
          <div className="lg:sticky lg:top-0 lg:h-screen">
            <Image
              src="/towfiqu-barbhuiya-HNPrWOH2Z8U-unsplash.jpg"
              alt="About Malaka ERP"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 42vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-white/80 text-lg">
                Empowering Indonesian businesses since 2018
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Content (7/12) */}
        <div className="w-full lg:w-7/12 order-1 lg:order-2">
          <div className="lg:h-screen flex flex-col p-6 lg:p-16 lg:pl-12 bg-white">
            {/* Logo */}
            <div className="mb-12">
              <Link href="/" className="inline-flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="Malaka ERP"
                  width={48}
                  height={48}
                  className="object-contain"
                />
                <div>
                  <h1 className="text-3xl font-bold text-black">
                    Malaka<span className="text-[#09f]">ERP</span>
                  </h1>
                  <p className="text-sm text-gray-500">Enterprise Resource Planning</p>
                </div>
              </Link>
            </div>

            {/* About Content */}
            <div className="flex-1">
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-sm text-gray-500 mb-2">About Us</p>
                <h2 className="text-3xl lg:text-4xl font-bold text-black leading-tight mb-6">
                  Building the Future of Manufacturing
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Malaka ERP is Indonesia&apos;s leading enterprise resource planning solution,
                  designed specifically for shoe manufacturing and retail businesses.
                  We combine deep industry expertise with modern technology to help
                  businesses thrive in the digital age.
                </p>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="mt-auto">
              {/* Client Carousel */}
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-4">Trusted by leading companies</p>
                <div className="relative overflow-hidden">
                  <motion.div
                    className="flex gap-8"
                    animate={{ x: [0, -50 * clients.length * 2] }}
                    transition={{
                      x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 20,
                        ease: "linear",
                      },
                    }}
                  >
                    {[...clients, ...clients, ...clients, ...clients].map((client, index) => (
                      <div
                        key={`${client.name}-${index}`}
                        className="flex-shrink-0 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all"
                      >
                        <Image
                          src={client.logo}
                          alt={client.name}
                          width={80}
                          height={40}
                          className="object-contain h-8 w-auto"
                        />
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-gray-200 my-8" />

              {/* Bottom Links */}
              <div className="flex items-center justify-between text-sm">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#09f] text-white font-medium hover:bg-[#0088e6] transition-colors"
                >
                  Get Started
                </Link>
                <div className="flex items-center gap-6">
                  <Link href="/" className="text-gray-500 hover:text-[#09f] transition-colors">Home</Link>
                  <Link href="/contact" className="text-gray-500 hover:text-[#09f] transition-colors">Contact</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
