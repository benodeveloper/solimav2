# Solima Public API Documentation

The Solima Public API allows developers to fetch configured channels and their streaming sources for integration into external players or services.

## Base URL

`https://your-domain.com/api/v1`

## Authentication

All requests must be authenticated using a Public API Key passed in the `X-API-KEY` header.

### Generating a Key
You can generate a new API key using the CLI:
```bash
npm run generate-api-key -- "Client Name"
```

---

## Endpoints

### 1. Get Channels
Returns a paginated list of all active channels with their associated media and streaming sources.

**Endpoint:** `GET /channels`

**Query Parameters:**
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | The page number to retrieve. |
| `limit` | `number` | `20` | Items per page (max 100). |
| `search` | `string` | `""` | Search term to filter channels by name. |

**Headers:**
```http
X-API-KEY: your_api_key_here
```

**Example Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "HBO HD",
      "num": 101,
      "is_adult": false,
      "status": "active",
      "logo_url": "https://your-domain.com/uploads/1741443191-hbo-logo.png",
      "media": [...],
      "sources": [
        {
          "label": "Main Source",
          "lang": "English",
          "quality": "1080p",
          "extension": "m3u8",
          "stream_id": "12345",
          "url": "http://stream-server.com/live/user/pass/12345.m3u8"
        }
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1,
  "expired_at": "2026-03-10T15:00:00.000Z"
}
```

---

## Response Objects

### Root Object
| Field | Type | Description |
| :--- | :--- | :--- |
| `items` | `array` | List of channel objects. |
| `total` | `number` | Total number of items. |
| `page` | `number` | Current page. |
| `limit` | `number` | Items per page. |
| `totalPages` | `number` | Total number of pages. |
| `expired_at` | `string` | ISO 8601 date when the current streaming credentials expire. |

### Channel Object
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | Internal channel ID. |
| `name` | `string` | Name of the channel. |
| `num` | `number` | Channel number. |
| `logo_url` | `string` | Absolute URL to the channel logo. |
| `sources` | `array` | List of available streaming sources. |

### Source Object
| Field | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | Source label (e.g., "Server 1"). |
| `lang` | `string` | Audio language of the stream. |
| `quality` | `string` | Video quality (e.g., "4K", "1080p"). |
| `url` | `string` | The final authenticated M3U8/TS URL ready for playback. |

---

## Error Handling

| Code | Message | Description |
| :--- | :--- | :--- |
| `401` | `Unauthorized` | API Key is missing, invalid, or inactive. |
| `500` | `Internal Error` | Server-side issue or missing streaming configuration. |

---

**Author:** benodeveloper  
**Website:** [https://www.benodeveloper.com](https://www.benodeveloper.com)
