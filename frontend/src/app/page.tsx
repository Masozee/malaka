"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu11Icon } from "@hugeicons/core-free-icons"

// Feature showcase data
const features = [
  {
    id: "inventory",
    title: "Inventory Management",
    subtitle: "Real-time Stock Control",
    description: "Track inventory across multiple warehouses with automated reordering, barcode scanning, and real-time stock level monitoring. Never run out of critical materials again.",
    image: "/towfiqu-barbhuiya-HNPrWOH2Z8U-unsplash.jpg"
  },
  {
    id: "sales",
    title: "Sales & Orders",
    subtitle: "Complete Order Lifecycle",
    description: "Manage the entire sales process from quotation to delivery. Integrated POS system, order tracking, and customer relationship management in one seamless platform.",
    image: "/simon-kadula--gkndM1GvSA-unsplash.jpg"
  },
  {
    id: "hr",
    title: "HR & Payroll",
    subtitle: "Employee Management",
    description: "Comprehensive human resources management including attendance tracking, leave management, performance reviews, and automated payroll processing with tax compliance.",
    image: "/towfiqu-barbhuiya-HNPrWOH2Z8U-unsplash.jpg"
  },
  {
    id: "production",
    title: "Production",
    subtitle: "Manufacturing Excellence",
    description: "Streamline your manufacturing with work order management, quality control checkpoints, material planning, and production scheduling for maximum efficiency.",
    image: "/simon-kadula--gkndM1GvSA-unsplash.jpg"
  },
  {
    id: "accounting",
    title: "Accounting",
    subtitle: "Financial Control",
    description: "Double-entry bookkeeping, journal management, trial balance, accounts payable/receivable, and comprehensive financial reporting with real-time insights.",
    image: "/towfiqu-barbhuiya-HNPrWOH2Z8U-unsplash.jpg"
  },
  {
    id: "procurement",
    title: "Procurement",
    subtitle: "Supplier Management",
    description: "End-to-end procurement workflow including supplier management, RFQ processing, purchase orders, contract management, and vendor performance tracking.",
    image: "/simon-kadula--gkndM1GvSA-unsplash.jpg"
  }
]

export default function LandingPage() {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const imageRefs = React.useRef<Map<number, HTMLDivElement>>(new Map())

  // Set ref for each image
  const setImageRef = React.useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) {
      imageRefs.current.set(index, el)
    } else {
      imageRefs.current.delete(index)
    }
  }, [])

  // Track which image is in view
  React.useEffect(() => {
    const observers: IntersectionObserver[] = []

    imageRefs.current.forEach((element, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveIndex(index)
            }
          })
        },
        {
          root: null,
          rootMargin: "-45% 0px -45% 0px",
          threshold: 0
        }
      )
      observer.observe(element)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [])

  const activeFeature = features[activeIndex]

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hamburger Menu - Top Right */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-6 right-6 z-50 w-12 h-12 flex items-center justify-center bg-white border border-gray-200 hover:border-[#00979D] transition-colors"
      >
        <HugeiconsIcon icon={Menu11Icon} className="w-6 h-6 text-black" />
      </button>

      {/* Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/20"
            />
            {/* Menu Panel */}
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
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-[#00979D] transition-colors"
                >
                  Overview
                </Link>
                <Link
                  href="/guidelines"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-[#00979D] transition-colors"
                >
                  Guidelines
                </Link>
                <div className="border-t border-gray-100 my-1" />
                <Link
                  href="/about"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-[#00979D] transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-[#00979D] transition-colors"
                >
                  Contact
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row">

        {/* Left Side - Scrollable Images (5/12) */}
        <div className="w-full lg:w-5/12 order-2 lg:order-1" ref={containerRef}>
          {features.map((feature, index) => (
            <div
              key={feature.id}
              ref={(el) => setImageRef(index, el)}
              className="relative h-screen overflow-hidden"
            >
              {/* Image */}
              <Image
                src={feature.image}
                alt={feature.title}
                fill
                className={`object-cover transition-all duration-700 ${
                  index === activeIndex ? "opacity-100 scale-100" : "opacity-50 scale-105"
                }`}
                sizes="(max-width: 1024px) 100vw, 42vw"
                priority={index === 0}
              />

              {/* Light overlay for inactive */}
              <div className={`absolute inset-0 bg-white transition-opacity duration-500 ${
                index === activeIndex ? "opacity-0" : "opacity-40"
              }`} />

              {/* Mobile text overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:hidden bg-gradient-to-t from-white via-white/90 to-transparent">
                <h3 className="text-2xl font-bold text-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {feature.description}
                </p>
              </div>

              {/* Index badge */}
              <div className="absolute top-6 left-6 px-3 py-1.5 bg-white/90 border border-gray-200">
                <span className="text-xs font-medium text-black">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side - Sticky Text (7/12) */}
        <div className="w-full lg:w-7/12 order-1 lg:order-2">
          <div className="lg:sticky lg:top-0 lg:h-screen flex flex-col justify-center p-6 lg:p-16 lg:pl-12 bg-white">

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
                    Malaka<span className="text-[#00979D]">ERP</span>
                  </h1>
                  <p className="text-sm text-gray-500">Enterprise Resource Planning</p>
                </div>
              </Link>
            </div>

            {/* Active Feature Content */}
            <div className="space-y-6 flex-1 flex flex-col justify-center">

              {/* Title */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`title-${activeIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm text-gray-500 mb-2">{activeFeature.subtitle}</p>
                  <h2 className="text-3xl lg:text-4xl font-bold text-black leading-tight">
                    {activeFeature.title}
                  </h2>
                </motion.div>
              </AnimatePresence>

              {/* Description */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={`desc-${activeIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-lg"
                >
                  {activeFeature.description}
                </motion.p>
              </AnimatePresence>

            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 my-8" />

            {/* Bottom Links */}
            <div className="flex items-center justify-between text-sm">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00979D] text-white font-medium hover:bg-[#007F84] transition-colors"
              >
                Get Started
              </Link>
              <div className="flex items-center gap-6">
                <Link href="/about" className="text-gray-500 hover:text-[#00979D] transition-colors">About</Link>
                <Link href="/contact" className="text-gray-500 hover:text-[#00979D] transition-colors">Contact</Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
