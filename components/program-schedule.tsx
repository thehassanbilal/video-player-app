"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Play, Calendar } from "lucide-react"
import type { Event } from "../types/epg"

interface ProgramScheduleProps {
  events: Event[]
  currentEvent: Event | null
  onEventSelect: (event: Event) => void
}

export function ProgramSchedule({ events, currentEvent, onEventSelect }: ProgramScheduleProps) {
  const [filter, setFilter] = useState<"all" | "live" | "upcoming" | "ended">("all")

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500 text-white"
      case "upcoming":
        return "bg-blue-500 text-white"
      case "ended":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true
    return event.status === filter
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Program Schedule
        </CardTitle>
        <div className="flex gap-2 flex-wrap">
          {(["all", "live", "upcoming", "ended"] as const).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterType)}
              className="capitalize"
            >
              {filterType}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${currentEvent?.id === event.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
              onClick={() => onEventSelect(event)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusColor(event.status)}>{event.status.toUpperCase()}</Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {formatDate(event.tsStart)} • {formatTime(event.tsStart)} - {formatTime(event.tsEnd)}
                    </div>
                  </div>

                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{event.title}</h3>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">{event.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Duration: {getDuration(event.duration)}</span>
                      {event.genres.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {event.genres[0]}
                        </Badge>
                      )}
                    </div>

                    {event.status === "live" && (
                      <Button size="sm" className="h-7">
                        <Play className="w-3 h-3 mr-1" />
                        Watch Live
                      </Button>
                    )}
                  </div>
                </div>

                {event.images.length > 0 && (
                  <Image
                    src={event.images[0].url || "/placeholder.svg"}
                    alt={event.title}
                    width={64}
                    height={48}
                    className="w-16 h-12 object-cover rounded flex-shrink-0"
                  />
                )}
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500">No programs found for the selected filter.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
