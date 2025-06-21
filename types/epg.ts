export interface StreamingUrl {
  url: string
  pid: string
  format: string
  assetTypes: string[]
}

export interface EventImage {
  url: string
  type: string
}

export interface Event {
  description: string
  duration: number
  guid: string
  id: string
  images: EventImage[]
  slug: string
  status: "live" | "ended" | "upcoming"
  streamingUrl: StreamingUrl[]
  title: string
  tsEnd: number
  tsStart: number
  genres: string[]
  contentOwnership: string[]
}

export interface ChannelImage {
  url: string
  type: string
}

export interface Channel {
  id: number
  title: string
  description: string
  images: ChannelImage[]
  events: Event[]
  genres: string[]
  subscription: string[]
  type: string
}

export interface EPGResponse {
  status: boolean
  runtime: string
  total: number
  data: Channel[]
}
