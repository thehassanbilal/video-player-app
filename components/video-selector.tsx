"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, Tv } from "lucide-react"
import type { Event } from "../types/epg"

interface VideoSelectorProps {
  events: Event[]
  currentEvent: Event | null
  onSelectVideo: (event: Event) => void
  onClose: () => void
  visible: boolean
}

const getStatusStyles = (status: "live" | "ended" | "upcoming") => {
  switch (status) {
    case "live":
      return {
        badge: "bg-red-600 border-red-500 text-white",
        border: "border-red-500",
      }
    case "upcoming":
      return {
        badge: "bg-blue-600 border-blue-500 text-white",
        border: "border-blue-500",
      }
    case "ended":
      return {
        badge: "bg-gray-600 border-gray-500 text-white",
        border: "border-gray-500",
      }
    default:
      return {
        badge: "bg-gray-700 border-gray-600 text-white",
        border: "border-gray-600",
      }
  }
}

export function VideoSelector({ events, currentEvent, onSelectVideo, onClose, visible }: VideoSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleCardClick = (event: Event, index: number) => {
    if (index === selectedIndex) {
      if (event.status !== "upcoming") {
        onSelectVideo(event)
      }
    } else {
      setSelectedIndex(index)
    }
  }

  // Set initial selected index when component becomes visible
  useEffect(() => {
    if (visible && currentEvent) {
      const index = events.findIndex((event) => event.id === currentEvent.id)
      if (index !== -1) {
        setSelectedIndex(index)
      }
    }
  }, [visible, currentEvent, events])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!visible) return

    e.preventDefault()
    switch (e.key) {
      case "ArrowLeft":
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : events.length - 1))
        break
      case "ArrowRight":
        setSelectedIndex((prev) => (prev < events.length - 1 ? prev + 1 : 0))
        break
      case "Enter": {
        const selectedEvent = events[selectedIndex]
        if (selectedEvent && selectedEvent.status !== "upcoming") {
          onSelectVideo(selectedEvent)
        }
        break
      }
      case "Escape":
      case "ArrowDown":
        onClose()
        break
    }
  }, [visible, selectedIndex, events, onSelectVideo, onClose])

  // Add/remove keydown listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  // Auto-hide after a period of inactivity
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onClose, 8000) // Close after 8 seconds of inactivity
    return () => clearTimeout(timer)
  }, [visible, selectedIndex, onClose])

  // Center the selected item in the view
  useEffect(() => {
    if (visible && containerRef.current) {
      const selectedCard = containerRef.current.children[selectedIndex] as HTMLElement
      if (selectedCard) {
        const containerWidth = containerRef.current.offsetWidth
        const cardLeft = selectedCard.offsetLeft
        const cardWidth = selectedCard.offsetWidth
        const scrollLeft = cardLeft - (containerWidth - cardWidth) / 2
        containerRef.current.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        })
      }
    }
  }, [visible, selectedIndex])

  if (!visible) return null

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })

  return (
    <div
      className="absolute inset-0 bg-black/50 z-20 flex items-end pb-16 transition-opacity duration-300"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <div
        ref={containerRef}
        className="flex items-center gap-6 overflow-hidden px-12"
        style={{
          width: "100%",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {events.map((event, idx) => {
          const isSelected = idx === selectedIndex
          const statusStyles = getStatusStyles(event.status)
          const imageUrl = event.images.find(img => img.type === "16_9")?.url || event.images[0]?.url || "/placeholder.svg"

          return (
            <div
              key={event.id}
              onClick={() => handleCardClick(event, idx)}
              className={`relative flex-shrink-0 cursor-pointer transition-all duration-300 ease-in-out ${isSelected ? "w-80 h-56" : "w-72 h-48 opacity-60"
                }`}
              style={{ transform: isSelected ? "scale(1)" : "scale(1)" }}
            >
              <div
                className={`w-full h-full rounded-xl overflow-hidden bg-gray-800 border-2 shadow-lg transition-all duration-300 ${isSelected ? "border-white shadow-white/20" : statusStyles.border
                  }`}
              >
                <div className="w-full h-full relative">
                  <Image
                    src={imageUrl}
                    alt={event.title}
                    width={320}
                    height={224}
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient overlay for text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-lg font-bold truncate">{event.title}</h3>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <div className="flex items-center gap-1 text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(event.tsStart)}</span>
                      </div>
                      <Badge variant="default" className={`text-xs uppercase ${statusStyles.badge}`}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Upcoming Overlay */}
                  {event.status === "upcoming" && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                      <Tv className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-lg font-semibold text-gray-300">Coming Soon</span>
                    </div>
                  )}

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                      <Play className="w-4 h-4 text-black fill-black" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
