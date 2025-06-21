"use client"

import Image from "next/image"

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-[#111828]/60 dark:border-gray-800 dark:bg-gray-950/95 dark:supports-[backdrop-filter]:bg-gray-950/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Brand Logo */}
                    <div className="flex items-center">
                        <Image
                            src="https://starzplay-img-prod-ssl.akamaized.net/prd-peg-data/default/images/logos/live/v2/starzplaysports-active.svg"
                            alt="StarzPlay Sports"
                            width={140}
                            height={32}
                            className="h-20 w-auto"
                            priority
                        />
                    </div>
                </div>
            </div>
        </nav>
    )
} 