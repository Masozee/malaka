"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu11Icon } from "@hugeicons/core-free-icons"

export default function ContactPage() {
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
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-[#09f] transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-[#09f] bg-gray-50"
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
              src="/simon-kadula--gkndM1GvSA-unsplash.jpg"
              alt="Contact Malaka ERP"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 42vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
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

            {/* Contact Content */}
            <div className="flex-1">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-8"
              >
                {/* Head Office */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-black">Head Office</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Address</p>
                      <p className="text-lg text-gray-900">
                        Jl. Jend. Sudirman No. 123, Kav. 45<br />
                        Senayan, Kebayoran Baru<br />
                        Jakarta Selatan 12190<br />
                        Indonesia
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="text-lg text-gray-900">+62 21 555 0100</p>
                    <p className="text-lg text-gray-900">+62 21 555 0101</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Fax</p>
                    <p className="text-lg text-gray-900">+62 21 555 0199</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-lg text-gray-900">info@malaka.co.id</p>
                    <p className="text-lg text-gray-900">support@malaka.co.id</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Working Hours</p>
                    <p className="text-lg text-gray-900">Monday - Friday</p>
                    <p className="text-lg text-gray-900">08:00 - 17:00 WIB</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="mt-auto">
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
                  <Link href="/about" className="text-gray-500 hover:text-[#09f] transition-colors">About</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
