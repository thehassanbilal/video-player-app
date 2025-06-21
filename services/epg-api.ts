import type { Event, Channel } from "../types/epg"

// Updated static EPG data from the provided sports data
const STATIC_EPG_DATA = {
  "status": true,
  "runtime": "93ms",
  "total": 81,
  "data": [
    {
      "adsCountryRights": [],
      "assetTypes": [
        "SVOD"
      ],
      "category": "favourites",
      "config": null,
      "contentOwnership": [
        "starz"
      ],
      "description": "STARZPLAY Sports – The destination for world class sports leagues and events. Watch the Dutch football League, EuroLeague & EuroCup basketball competitions, All Elite Wrestling, World Championship Boxing, Extreme E Electric of road racing, Tennis, Beach Volleyball, fight sports and much more.",
      "events": [
        [
          {
            "id": "8daa7d22d13a9",
            "videoUri": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "subtitleUri": "https://thepaciellogroup.github.io/AT-browser-tests/video/subtitles-en.vtt",
            "rank": 1,
            "rankUpDown": "+40",
            "title": "On the Bridge",
            "fullTitle": "On the Bridge",
            "year": 2015,
            "releaseDate": "5 Jun 2015",
            "image_16_9": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/16_9-400/on-the-bridge.jpg",
            "image_2_3": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/2_3-300/on-the-bridge.jpg",
            "runtimeMins": 137,
            "runtimeStr": "137 mins",
            "plot": "A documentary film exploring the struggles and resilience of veterans and their families on the Golden Gate Bridge.",
            "contentRating": "PG-13",
            "rating": 2.5,
            "ratingCount": 64000,
            "metaCriticRating": 34,
            "genres": "Action, Horror",
            "directors": "Ethan Parker",
            "stars": "Jackson Brown",
            "status": "ended"

          },
          {
            "id": "6f251d94cc5c2",
            "videoUri": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "subtitleUri": "https://thepaciellogroup.github.io/AT-browser-tests/video/subtitles-en.vtt",
            "rank": 3,
            "rankUpDown": "+23",
            "title": "Inventor",
            "fullTitle": "Inventor",
            "year": 1995,
            "releaseDate": "4 Apr 1995",
            "image_16_9": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/16_9-400/inventor.jpg",
            "image_2_3": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/2_3-300/inventor.jpg",
            "runtimeMins": 118,
            "runtimeStr": "118 mins",
            "plot": "A biographical drama about the life of a brilliant inventor and their groundbreaking inventions.",
            "contentRating": "PG",
            "rating": 8.4,
            "ratingCount": 88622,
            "metaCriticRating": 93,
            "genres": "Action, Horror",
            "directors": "Ava Reynolds, Sophia Martinez",
            "stars": "Sophia Adams, Noah Harris",
            "status": "ended"
          },
          {
            "id": "b168b710fcbea",
            "videoUri": "https://live-hw-stream.starzplayarabia.com/STCTVDrama/hls/clean/index.m3u8",
            "subtitleUri": "https://thepaciellogroup.github.io/AT-browser-tests/video/subtitles-en.vtt",
            "rank": 4,
            "rankUpDown": "+22",
            "title": "Cybernet",
            "fullTitle": "Cybernet",
            "year": 1989,
            "releaseDate": "11 Jan 1989",
            "image_16_9": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/16_9-400/cyber-net.jpg",
            "image_2_3": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/2_3-300/cyber-net.jpg",
            "runtimeMins": 60,
            "runtimeStr": "113 mins",
            "plot": "A thrilling sci-fi movie about a group of hackers trying to take down a powerful artificial intelligence.",
            "contentRating": "PG-13",
            "rating": 8,
            "ratingCount": 77207,
            "metaCriticRating": 95,
            "genres": "Action",
            "directors": "Mason Scott, Lucas Nguyen",
            "stars": "Jackson Brown",
            "status": "live"
          },
          {
            "id": "51df9ee9a5c29",
            "videoUri": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "subtitleUri": "https://thepaciellogroup.github.io/AT-browser-tests/video/subtitles-en.vtt",
            "rank": 5,
            "rankUpDown": "+27",
            "title": "The Good Lawyer",
            "fullTitle": "The Good Lawyer",
            "year": 2001,
            "releaseDate": "26 Oct 2001",
            "image_16_9": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/16_9-400/the-good-laywer.jpg",
            "image_2_3": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/2_3-300/the-good-laywer.jpg",
            "runtimeMins": 102,
            "runtimeStr": "102 mins",
            "plot": "A legal drama about a principled attorney fighting for justice in a corrupt system.",
            "contentRating": "PG-13",
            "rating": 7.1,
            "ratingCount": 11554,
            "metaCriticRating": 66,
            "genres": "Adventure",
            "directors": "Amelia Lee, Jackson Davis",
            "stars": "Olivia Carter",
            "status": "upcoming"
          },
          {
            "id": "66f35ba9d671d",
            "videoUri": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "subtitleUri": "https://thepaciellogroup.github.io/AT-browser-tests/video/subtitles-en.vtt",
            "rank": 13,
            "rankUpDown": "+16",
            "title": "Immortal Rider",
            "fullTitle": "Immortal Rider",
            "year": 1987,
            "releaseDate": "10 Jul 1987",
            "image_16_9": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/16_9-400/immortal-rider.jpg",
            "image_2_3": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/2_3-300/immortal-rider.jpg",
            "runtimeMins": 109,
            "runtimeStr": "109 mins",
            "plot": "A thrilling fantasy movie about a powerful immortal warrior who rides his horse into battle against evil forces.",
            "contentRating": "R",
            "rating": 8.4,
            "ratingCount": 36645,
            "metaCriticRating": 62,
            "genres": "Adventure",
            "directors": "Emma Williams, Logan King, Jackson Davis",
            "stars": "Sophia Adams, Ava Green",
            "status": "upcoming"
          },
          {
            "id": "2cf93763fab89",
            "videoUri": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "subtitleUri": "https://thepaciellogroup.github.io/AT-browser-tests/video/subtitles-en.vtt",
            "rank": 14,
            "rankUpDown": "+26",
            "title": "Mr Potato",
            "fullTitle": "Mr Potato",
            "year": 1986,
            "releaseDate": "23 Jan 1986",
            "image_16_9": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/16_9-400/mr-potato.jpg",
            "image_2_3": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/2_3-300/mr-potato.jpg",
            "runtimeMins": 142,
            "runtimeStr": "142 mins",
            "plot": "A hilarious comedy about a talking potato who becomes a successful businessman.",
            "contentRating": "PG",
            "rating": 1.4,
            "ratingCount": 79924,
            "metaCriticRating": 48,
            "genres": "Adventure",
            "directors": "Aiden Carter, Olivia Thompson",
            "stars": "Noah Harris",
            "status": "upcoming"
          },
          {
            "id": "523d5cdae88f7",
            "videoUri": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "subtitleUri": "https://thepaciellogroup.github.io/AT-browser-tests/video/subtitles-en.vtt",
            "rank": 15,
            "rankUpDown": "+17",
            "title": "Tomato",
            "fullTitle": "Tomato",
            "year": 1998,
            "releaseDate": "24 Apr 1998",
            "image_16_9": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/16_9-400/tomato.jpg",
            "image_2_3": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/2_3-300/tomato.jpg",
            "runtimeMins": 136,
            "runtimeStr": "136 mins",
            "plot": "A thrilling action-adventure film about a rogue tomato seeking revenge on the farmers who wronged it.",
            "contentRating": "PG-13",
            "rating": 9.6,
            "ratingCount": 59042,
            "metaCriticRating": 92,
            "genres": "Comedy, Fantasy, Adventure",
            "directors": "Ethan Parker, Aiden Carter",
            "stars": "Jackson Brown, Sophia Adams",
            "status": "upcoming"
          },
          {
            "id": "e267a161bb286",
            "videoUri": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "subtitleUri": "https://thepaciellogroup.github.io/AT-browser-tests/video/subtitles-en.vtt",
            "rank": 16,
            "rankUpDown": "+43",
            "title": "Idiot",
            "fullTitle": "Idiot",
            "year": 1987,
            "releaseDate": "21 Dec 1987",
            "image_16_9": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/16_9-400/idiot.jpg",
            "image_2_3": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/2_3-300/idiot.jpg",
            "runtimeMins": 109,
            "runtimeStr": "109 mins",
            "plot": "A comedy-drama film about a naive and clumsy man who falls in love with a woman above his social status.",
            "contentRating": "G",
            "rating": 9.1,
            "ratingCount": 70735,
            "metaCriticRating": 92,
            "genres": "Documentary",
            "directors": "Olivia Thompson",
            "stars": "Ava Green, Lucas Foster, Noah Harris",
            "status": "upcoming"
          },
          {
            "id": "c10133062b2aa",
            "videoUri": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "subtitleUri": "https://thepaciellogroup.github.io/AT-browser-tests/video/subtitles-en.vtt",
            "rank": 18,
            "rankUpDown": "+33",
            "title": "Monkey Man",
            "fullTitle": "Monkey Man",
            "year": 2010,
            "releaseDate": "5 May 2010",
            "image_16_9": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/16_9-400/monkey-man.jpg",
            "image_2_3": "https://storage.googleapis.com/androiddevelopers/samples/media/posters/2_3-300/monkey-man.jpg",
            "runtimeMins": 121,
            "runtimeStr": "121 mins",
            "plot": "A thriller about a former convict seeking revenge against those who wronged him.",
            "contentRating": "G",
            "rating": 9.3,
            "ratingCount": 15816,
            "metaCriticRating": 26,
            "genres": "Thriller, Romance, Documentary",
            "directors": "Lucas Nguyen, Emma Williams",
            "stars": "Noah Harris, Liam Davis, Jackson Brown",
            "status": "upcoming"
          },

        ]
      ],
      "genres": [
        "Sports",
        "Arabic"
      ],
      "id": 311102504197,
      "images": [
        {
          "url": "https://starzplay-img-prod-ssl.akamaized.net/prd-peg-data/default/images/logos/live/v2/starzplaysports-active.svg",
          "type": "logo-svg"
        },
        {
          "url": "https://starzplay-img-prod-ssl.akamaized.net/prd-peg-data/default/images/logos/live/v2/starzplaysports-active.png",
          "type": "logo-png"
        },
        {
          "url": "http://mena-img-cdn-lb.aws.playco.com/seriea/STARZPLAYSPORTSY2022M/STARZPLAYSPORTSY2022M-landscape-poster-v1.jpg",
          "type": "landscape_poster_v1"
        },
        {
          "url": "https://starzplay-img-prod-ssl.akamaized.net/prd-peg-data/default/images/logos/live/v2/starzplaysports-inactive.svg",
          "type": "dark-logo-svg"
        },
        {
          "url": "https://starzplay-img-prod-ssl.akamaized.net/prd-peg-data/default/images/logos/live/v2/starzplaysports-inactive.png",
          "type": "dark-logo-png"
        }
      ],
      "order": 0,
      "paid": true,
      "parentalControl": 7,
      "slug": "starzplaysport1",
      "subscription": [
        "starzplaysports"
      ],
      "subscriptionPerCountry": null,
      "title": "STARZPLAY Sports",
      "type": "linear"
    }
  ]
}

// Helper function to convert raw event data to Event interface
function convertRawEventToEvent(rawEvent: any, index: number): Event {
  // Use a fixed base time to avoid hydration mismatches
  const baseTime = 1704067200000 + (index * 2 * 60 * 60 * 1000) // Fixed base: Jan 1, 2024 + 2 hours per event
  const duration = (rawEvent.runtimeMins || 120) * 60 * 1000 // Convert minutes to milliseconds

  // Use the status from the raw event data instead of hardcoded logic
  const status: "live" | "ended" | "upcoming" = rawEvent.status || "ended"

  return {
    id: rawEvent.id,
    guid: rawEvent.id,
    title: rawEvent.title,
    description: rawEvent.plot || rawEvent.title,
    duration: duration,
    status: status,
    tsStart: baseTime,
    tsEnd: baseTime + duration,
    slug: rawEvent.id,
    images: [
      {
        url: rawEvent.image_16_9 || "",
        type: "16_9"
      },
      {
        url: rawEvent.image_2_3 || "",
        type: "2_3"
      }
    ],
    streamingUrl: [
      {
        url: rawEvent.videoUri,
        pid: rawEvent.id,
        format: "MP4",
        assetTypes: ["SVOD"]
      }
    ],
    genres: rawEvent.genres ? rawEvent.genres.split(", ") : [],
    contentOwnership: ["starz"]
  }
}

export class EPGService {
  static async getChannelPrograms(): Promise<{
    status: boolean
    runtime: string
    total: number
    data: Channel[]
  }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      status: STATIC_EPG_DATA.status,
      runtime: STATIC_EPG_DATA.runtime,
      total: STATIC_EPG_DATA.total,
      data: STATIC_EPG_DATA.data.map((channel) => ({
        id: channel.id,
        title: channel.title,
        description: channel.description,
        images: channel.images,
        events: channel.events[0].map((rawEvent: any, index: number) =>
          convertRawEventToEvent(rawEvent, index)
        ),
        genres: channel.genres,
        subscription: channel.subscription,
        type: channel.type,
      })),
    }
  }

  static getCurrentLiveEvent(events: Event[]) {
    return events.find((event) => event.status === "live")
  }

  static getUpcomingEvents(events: Event[]) {
    return events.filter((event) => event.status === "upcoming").sort((a, b) => a.tsStart - b.tsStart)
  }

  static getPastEvents(events: Event[]) {
    return events.filter((event) => event.status === "ended").sort((a, b) => b.tsStart - a.tsStart)
  }

  static getBestStreamingUrl(streamingUrls: any[]) {
    // Return null if no streaming URLs available
    if (!streamingUrls || streamingUrls.length === 0) {
      return null
    }

    // Prefer MPEG-DASH for Shaka Player
    const dashUrl = streamingUrls.find((url) => url.format === "MPEG-DASH")
    if (dashUrl) return dashUrl

    // Fallback to HLS
    const hlsUrl = streamingUrls.find((url) => url.format === "M3U")
    if (hlsUrl) return hlsUrl

    // Return first available
    return streamingUrls[0]
  }
}
