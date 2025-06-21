"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Tv, Wifi } from "lucide-react"
import { EPGService } from "../services/epg-api"
import { ProgramSchedule } from "./program-schedule"
import { VideoSelector } from "./video-selector"
import type { Event, Channel } from "../types/epg"

// Shaka Player loader function (SSR safe)
const loadShakaPlayer = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window not available"))
      return
    }

    if (window.shaka) {
      resolve(window.shaka)
      return
    }

    // Try to load from local public directory first
    const script = document.createElement("script")
    script.src = "/shaka-player.compiled.js"
    script.async = true

    script.onload = () => {
      console.log("Shaka Player loaded from local installation")
      resolve(window.shaka)
    }

    script.onerror = () => {
      console.log("Local Shaka Player failed, trying CDN...")
      // Fallback to CDN
      const cdnScript = document.createElement("script")
      cdnScript.src = "https://ajax.googleapis.com/ajax/libs/shaka-player/4.7.0/shaka-player.compiled.js"
      cdnScript.async = true

      cdnScript.onload = () => {
        console.log("Shaka Player loaded from CDN")
        resolve(window.shaka)
      }

      cdnScript.onerror = () => {
        reject(new Error("Failed to load Shaka Player from both local and CDN"))
      }

      document.head.appendChild(cdnScript)
    }

    document.head.appendChild(script)
  })
}

// Declare global types for Shaka Player
declare global {
  interface Window {
    shaka: any
  }
}

// Fallback stream URL for when primary streams fail
const FALLBACK_STREAM_URL = "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd"

export default function LiveTVPlayer() {
  const [isClient, setIsClient] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [showVideoSelector, setShowVideoSelector] = useState(false)

  // EPG Data
  const [channel, setChannel] = useState<Channel | null>(null)
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [isLive, setIsLive] = useState(false)

  const [seekableRange, setSeekableRange] = useState({ start: 0, end: 0 })
  const [isSwitchingVideo, setIsSwitchingVideo] = useState(false)
  const [isSeeking, setIsSeeking] = useState(false)
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load EPG data
  useEffect(() => {
    if (!isClient) return

    const loadEPGData = async () => {
      try {
        setIsLoading(true)
        const response = await EPGService.getChannelPrograms()

        if (response.data && response.data.length > 0) {
          const channelData = response.data[0]
          setChannel(channelData)
          setEvents(channelData.events)

          // Find current live event
          const liveEvent = EPGService.getCurrentLiveEvent(channelData.events)
          if (liveEvent) {
            setCurrentEvent(liveEvent)
            setIsLive(true)
          } else {
            // If no live event, show the first ended event for demo
            const endedEvents = EPGService.getPastEvents(channelData.events)
            if (endedEvents.length > 0) {
              setCurrentEvent(endedEvents[0])
              setIsLive(false)
            }
          }
        }
      } catch (err: any) {
        setError(`Failed to load program data: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadEPGData()
  }, [isClient])

  // Initialize Shaka Player when current event changes
  useEffect(() => {
    if (!currentEvent) return

    let cleanupFunctions: (() => void)[] = []

    const initPlayer = async () => {
      if (!videoRef.current) return

      try {
        // Always clean up previous player state first
        console.log(`Initializing player for: ${currentEvent.title}`)

        // Destroy Shaka Player if it exists
        if (playerRef.current) {
          console.log("Destroying previous Shaka Player")
          await playerRef.current.destroy()
          playerRef.current = null
        }

        // Reset video element state
        if (videoRef.current) {
          videoRef.current.pause()
          videoRef.current.removeAttribute('src')
          videoRef.current.load()
          setCurrentTime(0)
          setDuration(0)
          setIsPlaying(false)
        }

        // Get the best streaming URL from the event
        const bestStreamingUrl = EPGService.getBestStreamingUrl(currentEvent.streamingUrl)
        let streamUrl = ""

        if (bestStreamingUrl) {
          streamUrl = bestStreamingUrl.url
          console.log(`Using stream URL for: ${currentEvent.title} - ${streamUrl}`)
        } else {
          // Fallback to demo stream if no streaming URL available
          streamUrl = FALLBACK_STREAM_URL
          console.log(`No streaming URL available, using fallback for: ${currentEvent.title}`)
        }

        // Check if the URL is a direct video file (MP4, WebM, etc.)
        const isDirectVideo = /\.(mp4|webm|ogg|mov)$/i.test(streamUrl) ||
          (streamUrl.includes('commondatastorage.googleapis.com') && !streamUrl.includes('.m3u8'))

        // Check if it's a streaming format (HLS, DASH)
        const isStreamingFormat = /\.(m3u8|mpd)$/i.test(streamUrl) || streamUrl.includes('.m3u8')

        if (isDirectVideo && !isStreamingFormat) {
          // For direct video files, use native HTML5 video
          console.log(`Using native HTML5 video for: ${currentEvent.title}`)

          // Set up error handling for native video
          const handleVideoError = (error: any) => {
            console.warn(`Native video error for ${currentEvent.title}:`, error)
            setError(`Failed to load video: ${error.message || 'Unknown error'}`)
          }

          const handleVideoLoad = () => {
            console.log(`Native video loaded successfully: ${currentEvent.title}`)
            setError(null)
          }

          // Add event listeners
          videoRef.current.addEventListener('error', handleVideoError)
          videoRef.current.addEventListener('loadeddata', handleVideoLoad)

          // Store cleanup functions
          cleanupFunctions.push(() => {
            if (videoRef.current) {
              videoRef.current.removeEventListener('error', handleVideoError)
              videoRef.current.removeEventListener('loadeddata', handleVideoLoad)
            }
          })

          // Set the video source directly
          videoRef.current.src = streamUrl
          videoRef.current.load()

          // Auto-play based on status
          if (currentEvent.status === "live") {
            try {
              await videoRef.current.play()
              console.log(`Auto-playing live content: ${currentEvent.title}`)
            } catch (playError) {
              console.warn("Auto-play failed for live content:", playError)
            }
          } else if (currentEvent.status === "ended") {
            // For ended content, wait for video to be ready then play
            const playWhenReady = () => {
              if (videoRef.current && videoRef.current.readyState >= 3) {
                videoRef.current
                  .play()
                  .then(() => {
                    console.log(`Auto-playing ended content: ${currentEvent.title}`)
                  })
                  .catch((error) => {
                    console.warn("Auto-play failed for ended content:", error)
                  })
              } else {
                setTimeout(playWhenReady, 100)
              }
            }
            playWhenReady()
          }
        } else {
          // For streaming formats (HLS, DASH), use Shaka Player
          console.log(`Using Shaka Player for streaming: ${currentEvent.title}`)

          try {
            await loadShakaPlayer()
            initShakaPlayer()
          } catch (error) {
            console.error("Failed to load Shaka Player:", error)
            setError("Failed to load video player")
          }
        }
      } catch (err: any) {
        console.error("Failed to load video player:", err)
        setError("Failed to load video player")
      }
    }

    const initShakaPlayer = async () => {
      if (!window.shaka || !videoRef.current || !currentEvent) return

      try {
        // Install polyfills
        window.shaka.polyfill.installAll()

        // Check browser support
        if (!window.shaka.Player.isBrowserSupported()) {
          setError("Browser not supported")
          return
        }

        // Create player
        const player = new window.shaka.Player(videoRef.current)
        playerRef.current = player

        // Configure player for live streaming
        player.configure({
          streaming: {
            bufferingGoal: 30,
            rebufferingGoal: 15,
          },
          manifest: {
            defaultPresentationDelay: 10,
          },
        })

        // Error handling
        player.addEventListener("error", (event: any) => {
          console.warn(`Playback error for ${currentEvent.title}:`, event.detail)

          // For network errors (7000 series), try fallback immediately
          if (event.detail.code >= 7000 && event.detail.code < 8000) {
            console.log("Network error detected, trying fallback stream")
            player
              .load(FALLBACK_STREAM_URL)
              .then(() => {
                console.log("Fallback stream loaded successfully")
                setError(null)
                // Auto-play the fallback
                if (videoRef.current) {
                  videoRef.current.play().catch(console.warn)
                }
              })
              .catch((fallbackError: any) => {
                console.error("Fallback also failed:", fallbackError)
                setError(`Failed to load stream: Network error ${event.detail.code}`)
              })
          } else {
            setError(`Playback error: ${event.detail.message}`)
          }
        })

        // Get the best streaming URL from the event
        const bestStreamingUrl = EPGService.getBestStreamingUrl(currentEvent.streamingUrl)
        let streamUrl = ""

        if (bestStreamingUrl) {
          streamUrl = bestStreamingUrl.url
          console.log(`Using stream URL for: ${currentEvent.title} - ${streamUrl}`)
        } else {
          // Fallback to demo stream if no streaming URL available
          streamUrl = FALLBACK_STREAM_URL
          console.log(`No streaming URL available, using fallback for: ${currentEvent.title}`)
        }

        try {
          // Load the stream
          await player.load(streamUrl)
          setError(null)
          console.log(`Successfully loaded stream for: ${currentEvent.title}`)
        } catch (primaryError: any) {
          console.warn(`Primary stream failed for ${currentEvent.title}:`, primaryError.message)

          // Try fallback stream
          try {
            console.log("Falling back to demo stream:", FALLBACK_STREAM_URL)
            await player.load(FALLBACK_STREAM_URL)
            setError(null)
            console.log(`Successfully loaded fallback stream for: ${currentEvent.title}`)
          } catch (fallbackError: any) {
            console.error(`Fallback stream also failed:`, fallbackError.message)
            setError(`Failed to load any stream: ${fallbackError.message}`)
            return
          }
        }

        // Auto-play for live content, or prepare ended content for playback
        if (currentEvent.status === "live") {
          try {
            await videoRef.current.play()
            console.log(`Auto-playing live content: ${currentEvent.title}`)
          } catch (playError) {
            console.warn("Auto-play failed for live content:", playError)
          }
        } else if (currentEvent.status === "ended") {
          // For ended content, load and auto-play immediately
          videoRef.current.load()
          console.log(`Ended content loaded and ready: ${currentEvent.title}`)

          // Wait for video to be ready then play
          const playWhenReady = () => {
            if (videoRef.current && videoRef.current.readyState >= 3) {
              videoRef.current
                .play()
                .then(() => {
                  console.log(`Auto-playing ended content: ${currentEvent.title}`)
                })
                .catch((error) => {
                  console.warn("Auto-play failed for ended content:", error)
                })
            } else {
              setTimeout(playWhenReady, 100)
            }
          }
          playWhenReady()
        }
      } catch (err: any) {
        console.error(`Failed to initialize player: ${err.message}`)
        setError(`Failed to initialize player: ${err.message}`)
      }
    }

    initPlayer()

    return () => {
      // Clean up all event listeners
      cleanupFunctions.forEach(cleanup => cleanup())
      cleanupFunctions = []

      // Destroy Shaka Player
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [currentEvent])

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let timeUpdateThrottle: NodeJS.Timeout | null = null
    let lastTimeUpdate = 0

    const updateTime = () => {
      const now = Date.now()
      // Throttle time updates to every 100ms to reduce UI lag
      if (now - lastTimeUpdate > 100) {
        setCurrentTime(video.currentTime)
        lastTimeUpdate = now
      }
    }

    const updateDuration = () => setDuration(video.duration)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleLoadedData = () => {
      console.log(`Video loaded: ${currentEvent?.title}, Duration: ${video.duration}`)
    }
    const handleCanPlay = () => {
      console.log(`Video can play: ${currentEvent?.title}`)
    }

    const handleEnded = () => {
      if (!currentEvent || isLive || isSwitchingVideo) return

      // Auto-switch to next video when current video ends
      const currentIndex = events.findIndex((event) => event.id === currentEvent.id)
      if (currentIndex < events.length - 1) {
        const nextEvent = events[currentIndex + 1]
        if (nextEvent && nextEvent.status !== "upcoming") {
          console.log(`Auto-switching to next video after end: ${nextEvent.title}`)
          setIsSwitchingVideo(true)
          setCurrentEvent(nextEvent)
          setIsLive(nextEvent.status === "live")
          setTimeout(() => setIsSwitchingVideo(false), 1000)
        }
      }
    }

    // Throttled time update handler
    const throttledTimeUpdate = () => {
      if (timeUpdateThrottle || isSeeking) return

      timeUpdateThrottle = setTimeout(() => {
        updateTime()
        // Update seekable range for live videos (less frequently)
        if (isLive && video.seekable.length > 0) {
          setSeekableRange({
            start: video.seekable.start(0),
            end: video.seekable.end(0),
          })
        }
        timeUpdateThrottle = null
      }, 50) // Reduced from 100ms to 50ms for smoother progress updates
    }

    video.addEventListener("timeupdate", throttledTimeUpdate)
    video.addEventListener("loadedmetadata", updateDuration)
    video.addEventListener("loadeddata", handleLoadedData)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("ended", handleEnded)

    return () => {
      if (timeUpdateThrottle) {
        clearTimeout(timeUpdateThrottle)
      }
      video.removeEventListener("timeupdate", throttledTimeUpdate)
      video.removeEventListener("loadedmetadata", updateDuration)
      video.removeEventListener("loadeddata", handleLoadedData)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("ended", handleEnded)
    }
  }, [isLive, currentEvent, events, isSwitchingVideo, isSeeking])

  // Keyboard event listener for up arrow key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        event.preventDefault()
        setShowVideoSelector(true)
      } else if (event.key === "ArrowLeft" && !showVideoSelector) {
        // Previous video
        event.preventDefault()
        if (currentEvent) {
          const currentIndex = events.findIndex((e) => e.id === currentEvent.id)
          console.log(`Current index: ${currentIndex}, trying to go to previous`)

          if (currentIndex > 0) {
            const previousEvent = events[currentIndex - 1]
            console.log(`Previous event:`, previousEvent?.title, previousEvent?.status)

            if (previousEvent && previousEvent.status !== "upcoming") {
              console.log(`Switching to previous video: ${previousEvent.title}`)
              setCurrentEvent(previousEvent)
              setIsLive(previousEvent.status === "live")
            } else {
              console.log(`Cannot switch to previous - status is ${previousEvent?.status}`)
            }
          } else {
            console.log(`Already at first video`)
          }
        }
      } else if (event.key === "ArrowRight" && !showVideoSelector) {
        // Next video
        event.preventDefault()
        if (currentEvent) {
          const currentIndex = events.findIndex((e) => e.id === currentEvent.id)
          console.log(`Current index: ${currentIndex}, trying to go to next`)

          if (currentIndex < events.length - 1) {
            const nextEvent = events[currentIndex + 1]
            console.log(`Next event:`, nextEvent?.title, nextEvent?.status)

            if (nextEvent && nextEvent.status !== "upcoming") {
              console.log(`Switching to next video: ${nextEvent.title}`)
              setCurrentEvent(nextEvent)
              setIsLive(nextEvent.status === "live")
            } else {
              console.log(`Cannot switch to next - status is ${nextEvent?.status}`)
            }
          } else {
            console.log(`Already at last video`)
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [showVideoSelector, currentEvent, events])

  const handleVideoSelect = (event: Event) => {
    if (event.status === "upcoming") return // Don't allow playing upcoming videos
    setCurrentEvent(event)
    setIsLive(event.status === "live")
    setShowVideoSelector(false)
  }

  const togglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch((error) => {
        console.warn("Play failed:", error)
        setError("Failed to play video. Please try again.")
      })
    }
  }

  const handleSeek = (value: number[]) => {
    if (!videoRef.current || !currentEvent || isSwitchingVideo) return

    const seekTime = value[0]
    const threshold = 2 // Increased threshold to 2 seconds for easier detection

    // IMMEDIATE VISUAL FEEDBACK - Update UI instantly
    setCurrentTime(seekTime)

    // Clear any existing seek timeout
    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current)
    }

    // Set seeking flag to prevent conflicting time updates from video events
    setIsSeeking(true)

    // Debounce only the actual video seeking operation (reduced to 10ms for faster response)
    seekTimeoutRef.current = setTimeout(() => {
      if (isLive) {
        // For live videos, allow seeking within the seekable range
        if (seekTime >= seekableRange.start && seekTime <= seekableRange.end) {
          videoRef.current!.currentTime = seekTime
        }
      } else {
        // For on-demand videos, check for automatic switching
        const currentIndex = events.findIndex((event) => event.id === currentEvent.id)

        console.log(`Seeking to: ${seekTime}s, Duration: ${duration}s, Current Index: ${currentIndex}`)

        // Check if seeking to the very beginning (switch to previous video)
        if (seekTime <= threshold && currentIndex > 0) {
          const previousEvent = events[currentIndex - 1]
          console.log(`Checking previous event:`, previousEvent?.title, previousEvent?.status)

          if (previousEvent && previousEvent.status !== "upcoming") {
            console.log(`Auto-switching to previous video: ${previousEvent.title}`)
            setIsSwitchingVideo(true)
            setCurrentEvent(previousEvent)
            setIsLive(previousEvent.status === "live")
            setTimeout(() => setIsSwitchingVideo(false), 1000)
            setIsSeeking(false)
            return
          } else {
            console.log(`Cannot switch to previous - either doesn't exist or is upcoming`)
          }
        }

        // Check if seeking to the very end (switch to next video)
        if (seekTime >= duration - threshold && currentIndex < events.length - 1) {
          const nextEvent = events[currentIndex + 1]
          console.log(`Checking next event:`, nextEvent?.title, nextEvent?.status)

          if (nextEvent && nextEvent.status !== "upcoming") {
            console.log(`Auto-switching to next video: ${nextEvent.title}`)
            setIsSwitchingVideo(true)
            setCurrentEvent(nextEvent)
            setIsLive(nextEvent.status === "live")

            // The new video will start from the beginning automatically
            setTimeout(() => {
              setIsSwitchingVideo(false)
              if (videoRef.current && !isLive) {
                videoRef.current.currentTime = 0
              }
            }, 1000)
            setIsSeeking(false)
            return
          } else {
            console.log(`Cannot switch to next - either doesn't exist or is upcoming`)
          }
        }

        // Normal seeking within the current video
        videoRef.current!.currentTime = seekTime
      }

      // Reset seeking flag with minimal delay
      setTimeout(() => setIsSeeking(false), 50)
    }, 10) // Reduced from 50ms to 10ms for much faster response
  }

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return
    const newVolume = value[0]
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (!videoRef.current) return

    if (isMuted) {
      videoRef.current.volume = volume
      setIsMuted(false)
    } else {
      videoRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleEventSelect = (event: Event) => {
    if (event.status === "live" || event.status === "ended") {
      setCurrentEvent(event)
      setIsLive(event.status === "live")
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Cleanup seek timeout on unmount
  useEffect(() => {
    return () => {
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current)
      }
    }
  }, [])

  // Don't render until client is ready to prevent hydration mismatches
  if (!isClient) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="bg-black rounded-lg overflow-hidden relative">
          <div className="relative aspect-video bg-black flex items-center justify-center">
            <div className="text-white text-lg">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Video Player */}
      <div className="bg-black rounded-lg overflow-hidden relative group">
        <div
          className="relative aspect-video bg-black"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
          tabIndex={0}
          style={{ outline: "none" }}
        >
          <video
            key={currentEvent?.id || 'default'}
            ref={videoRef}
            className="w-full h-full"
            onClick={togglePlay}
          />

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-lg">Loading channel...</div>
            </div>
          )}

          {/* Error Overlay */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-red-400 text-center">
                <div className="text-lg font-semibold mb-2">Error</div>
                <div className="text-sm">{error}</div>
                <Button onClick={() => setError(null)} className="mt-2 bg-red-500 hover:bg-red-600" size="sm">
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {/* Video Selector */}
          <VideoSelector
            events={events}
            currentEvent={currentEvent}
            onSelectVideo={handleVideoSelect}
            onClose={() => setShowVideoSelector(false)}
            visible={showVideoSelector}
          />

          {/* Channel Info Overlay */}
          <div
            className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${showControls && !showVideoSelector ? "opacity-100" : "opacity-0"
              }`}
          >
            <div className="flex items-center gap-3">
              {channel?.images.find((img) => img.type === "logo-png") && (
                <Image
                  src={channel.images.find((img) => img.type === "logo-png")?.url || "/placeholder.svg"}
                  alt={channel.title}
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
              )}
              <div>
                <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                  {channel?.title}
                  {isLive && (
                    <Badge className="bg-red-500 text-white text-xs">
                      <Wifi className="w-3 h-3 mr-1" />
                      LIVE
                    </Badge>
                  )}
                  {!isLive && currentEvent?.status === "ended" && (
                    <Badge className="bg-gray-500 text-white text-xs">REPLAY</Badge>
                  )}
                </h2>
                {currentEvent && <p className="text-white/80 text-sm">{currentEvent.title}</p>}
              </div>
            </div>
          </div>

          {/* Controls Overlay */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${showControls && !showVideoSelector ? "opacity-100" : "opacity-0"
              }`}
          >
            {/* Progress Bar - Only show for non-live (on-demand) videos */}
            {!isLive && (
              <div className="px-4 pb-2">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full progress-slider"
                />
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex items-center justify-between px-4 pb-4">
              <div className="flex items-center gap-2">
                {/* Play/Pause */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20 w-10 h-10"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>

                {/* Volume Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20 w-8 h-8"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <div className="w-20">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.1}
                      onValueChange={handleVolumeChange}
                      className="volume-slider"
                    />
                  </div>
                </div>

                {/* Time Display */}
                <div className="text-white text-sm font-mono">
                  {isLive ? (
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">LIVE</span>
                      {currentEvent && (
                        <>
                          <span className="text-white/50">•</span>
                          <span>{currentEvent.title}</span>
                        </>
                      )}
                    </div>
                  ) : (
                    `${formatTime(currentTime)} / ${formatTime(duration)}`
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Live Indicator */}
                {isLive && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    LIVE
                  </div>
                )}

                {/* Replay Indicator */}
                {!isLive && currentEvent?.status === "ended" && (
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    REPLAY
                  </div>
                )}

                {/* Settings */}
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 w-8 h-8">
                  <Settings className="w-4 h-4" />
                </Button>

                {/* Fullscreen */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20 w-8 h-8"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Streaming URL Info */}
      {currentEvent && (
        <div className="bg-gray-900 text-white rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            Streaming Information
          </h3>
          <div className="space-y-3">
            <div>
              <div className="text-gray-400 text-sm mb-1">Current Video:</div>
              <div className="font-medium">{currentEvent.title}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Status:</div>
              <div className="flex items-center gap-2">
                <Badge className={currentEvent.status === "live" ? "bg-red-500" : currentEvent.status === "upcoming" ? "bg-blue-500" : "bg-gray-500"}>
                  {currentEvent.status.toUpperCase()}
                </Badge>
              </div>
            </div>
            {currentEvent.streamingUrl && currentEvent.streamingUrl.length > 0 && (
              <div>
                <div className="text-gray-400 text-sm mb-1">Streaming URL:</div>
                <div className="bg-gray-800 p-3 rounded text-sm font-mono break-all">
                  {currentEvent.streamingUrl[0]?.url || "No streaming URL available"}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  Format: {currentEvent.streamingUrl[0]?.format || "Unknown"}
                </div>
              </div>
            )}
            {!currentEvent.streamingUrl || currentEvent.streamingUrl.length === 0 && (
              <div className="text-yellow-400 text-sm">
                ⚠️ No streaming URL available for this content
              </div>
            )}
          </div>
        </div>
      )}

      {/* Program Schedule */}
      {events.length > 0 && (
        <ProgramSchedule events={events} currentEvent={currentEvent} onEventSelect={handleEventSelect} />
      )}

      {/* Channel Info */}
      {channel && (
        <div className="p-4 bg-gray-900 text-white rounded-lg">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Tv className="w-5 h-5" />
            {channel.title}
          </h3>
          <p className="text-gray-300 text-sm mb-4">{channel.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Status</div>
              <div className="flex items-center gap-1">
                {isLive ? (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Live
                  </>
                ) : currentEvent?.status === "ended" ? (
                  <>
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    Replay
                  </>
                ) : (
                  "On Demand"
                )}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Current Program</div>
              <div>{currentEvent?.title || "No program"}</div>
            </div>
            <div>
              <div className="text-gray-400">Genre</div>
              <div>{channel.genres.join(", ")}</div>
            </div>
            <div>
              <div className="text-gray-400">Total Programs</div>
              <div>{events.length}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
