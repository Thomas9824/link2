"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"

interface CountryData {
  country: string
  clicks: number
  links: number
}

interface RotatingEarthProps {
  width?: number
  height?: number
  className?: string
  countryData?: CountryData[]
}

export default function RotatingEarth({ width = 800, height = 600, className = "", countryData = [] }: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Fonction pour mettre à jour les dimensions
  const updateDimensions = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDimensions({
        width: rect.width,
        height: rect.height
      })
    }
  }

  // Observer les changements de taille
  useEffect(() => {
    updateDimensions()

    const resizeObserver = new ResizeObserver(updateDimensions)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    window.addEventListener('resize', updateDimensions)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    // Utiliser les dimensions du conteneur
    const containerWidth = dimensions.width
    const containerHeight = dimensions.height
    const radius = Math.min(containerWidth, containerHeight) / 2.2 // Légèrement plus grand pour remplir

    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    context.scale(dpr, dpr)

    // Create projection and path generator for Canvas
    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90)

    const path = d3.geoPath().projection(projection).context(context)

    // Mapping des codes ISO pays vers leurs coordonnées (centres approximatifs)
    const countryCoordinates: { [key: string]: [number, number] } = {
      // Europe
      'FR': [2.3522, 46.6030],     // France
      'DE': [10.4515, 51.1657],    // Germany
      'GB': [-3.4360, 55.3781],    // United Kingdom
      'UK': [-3.4360, 55.3781],    // United Kingdom (alias)
      'ES': [-3.7492, 40.4637],    // Spain
      'IT': [12.5674, 41.8719],    // Italy
      'NL': [5.2913, 52.1326],     // Netherlands
      'BE': [4.4699, 50.5039],     // Belgium
      'CH': [8.2275, 46.8182],     // Switzerland
      'AT': [14.5501, 47.5162],    // Austria
      'PL': [19.1343, 51.9194],    // Poland
      'SE': [18.6435, 60.1282],    // Sweden
      'NO': [9.5018, 60.4720],     // Norway
      'DK': [9.5018, 56.2639],     // Denmark
      'FI': [24.9384, 61.9241],    // Finland
      'PT': [-8.2245, 39.3999],    // Portugal
      'IE': [-8.2439, 53.4129],    // Ireland
      'GR': [21.8243, 39.0742],    // Greece
      'CZ': [15.4730, 49.8175],    // Czech Republic
      'HU': [19.5033, 47.1625],    // Hungary
      'RO': [24.9668, 45.9432],    // Romania
      'BG': [25.4858, 42.7339],    // Bulgaria
      'HR': [15.2000, 45.1000],    // Croatia
      'SI': [14.9955, 46.1512],    // Slovenia
      'SK': [19.6990, 48.6690],    // Slovakia
      'LT': [23.8813, 55.1694],    // Lithuania
      'LV': [24.6032, 56.8796],    // Latvia
      'EE': [25.0136, 58.5953],    // Estonia

      // Americas
      'US': [-95.7129, 37.0902],   // United States
      'CA': [-106.3468, 56.1304],  // Canada
      'MX': [-102.5528, 23.6345],  // Mexico
      'BR': [-51.9253, -14.2350],  // Brazil
      'AR': [-63.6167, -38.4161],  // Argentina
      'CL': [-71.5430, -35.6751],  // Chile
      'CO': [-74.2973, 4.5709],    // Colombia
      'PE': [-75.0152, -9.1900],   // Peru
      'VE': [-66.5897, 6.4238],    // Venezuela
      'UY': [-55.7658, -32.5228],  // Uruguay
      'PY': [-58.4438, -23.4425],  // Paraguay
      'BO': [-63.5887, -16.2902],  // Bolivia
      'EC': [-78.1834, -1.8312],   // Ecuador
      'GY': [-58.9302, 4.8604],    // Guyana
      'SR': [-56.0278, 3.9193],    // Suriname
      'GF': [-53.1258, 3.9339],    // French Guiana

      // Asia
      'CN': [104.1954, 35.8617],   // China
      'JP': [138.2529, 36.2048],   // Japan
      'IN': [78.9629, 20.5937],    // India
      'KR': [127.7669, 35.9078],   // South Korea
      'SG': [103.8198, 1.3521],    // Singapore
      'TH': [100.9925, 15.8700],   // Thailand
      'VN': [108.2772, 14.0583],   // Vietnam
      'ID': [113.9213, -0.7893],   // Indonesia
      'MY': [101.9758, 4.2105],    // Malaysia
      'PH': [121.7740, 12.8797],   // Philippines
      'TW': [120.9605, 23.6978],   // Taiwan
      'HK': [114.1694, 22.3193],   // Hong Kong
      'KH': [104.9910, 12.5657],   // Cambodia
      'LA': [102.4955, 19.8563],   // Laos
      'MM': [95.9560, 21.9162],    // Myanmar
      'BD': [90.3563, 23.6850],    // Bangladesh
      'PK': [69.3451, 30.3753],    // Pakistan
      'LK': [80.7718, 7.8731],     // Sri Lanka
      'NP': [84.1240, 28.3949],    // Nepal
      'BT': [90.4336, 27.5142],    // Bhutan
      'MN': [103.8467, 46.8625],   // Mongolia
      'KZ': [66.9237, 48.0196],    // Kazakhstan
      'UZ': [64.5853, 41.3775],    // Uzbekistan
      'KG': [74.7661, 41.2044],    // Kyrgyzstan
      'TJ': [71.2761, 38.8610],    // Tajikistan
      'TM': [59.5563, 38.9697],    // Turkmenistan
      'AF': [67.7090, 33.9391],    // Afghanistan

      // Africa
      'ZA': [22.9375, -30.5595],   // South Africa
      'EG': [30.8025, 26.8206],    // Egypt
      'NG': [8.6753, 9.0820],      // Nigeria
      'MA': [-7.0926, 31.7917],    // Morocco
      'KE': [37.9062, -0.0236],    // Kenya
      'ET': [40.4897, 9.1450],     // Ethiopia
      'GH': [-1.0232, 7.9465],     // Ghana
      'TZ': [34.8888, -6.3690],    // Tanzania
      'UG': [32.2903, 1.3733],     // Uganda
      'MZ': [35.5296, -18.6657],   // Mozambique
      'MG': [46.8691, -18.7669],   // Madagascar
      'AO': [17.8739, -11.2027],   // Angola
      'ZM': [27.8546, -13.1339],   // Zambia
      'ZW': [29.1549, -19.0154],   // Zimbabwe
      'BW': [24.6849, -22.3285],   // Botswana
      'NA': [18.4241, -22.9576],   // Namibia
      'LY': [17.2283, 26.3351],    // Libya
      'TN': [9.5375, 33.8869],     // Tunisia
      'DZ': [1.6596, 28.0339],     // Algeria
      'SD': [30.2176, 12.8628],    // Sudan
      'TD': [18.7322, 15.4542],    // Chad
      'NE': [8.0817, 17.6078],     // Niger
      'ML': [-3.9962, 17.5707],    // Mali
      'BF': [-2.1830, 12.2383],    // Burkina Faso
      'SN': [-14.4524, 14.4974],   // Senegal
      'GN': [-9.6966, 9.9456],     // Guinea
      'SL': [-11.7799, 8.4606],    // Sierra Leone
      'LR': [-9.4295, 6.4281],     // Liberia
      'CI': [-5.5471, 7.5400],     // Côte d'Ivoire
      'TG': [0.8248, 8.6195],      // Togo
      'BJ': [2.3158, 9.3077],      // Benin

      // Oceania
      'AU': [133.7751, -25.2744],  // Australia
      'NZ': [174.8860, -40.9006],  // New Zealand
      'FJ': [179.4144, -16.5780],  // Fiji
      'PG': [143.9555, -6.3149],   // Papua New Guinea
      'NC': [165.6189, -20.9043],  // New Caledonia
      'VU': [166.9592, -15.3767],  // Vanuatu
      'SB': [160.1562, -9.6457],   // Solomon Islands
      'WS': [-172.1046, -13.7590], // Samoa
      'TO': [-175.1982, -21.1789], // Tonga
      'KI': [-157.3630, 1.8709],   // Kiribati
      'TV': [177.6493, -7.1095],   // Tuvalu
      'NR': [166.9315, -0.5228],   // Nauru
      'PW': [134.5825, 7.5150],    // Palau
      'FM': [150.5508, 7.4256],    // Micronesia
      'MH': [171.1845, 7.1315],    // Marshall Islands

      // Middle East
      'IL': [34.8516, 32.4279],    // Israel
      'AE': [53.8478, 23.4241],    // UAE
      'SA': [45.0792, 23.8859],    // Saudi Arabia
      'TR': [35.2433, 38.9637],    // Turkey
      'IR': [53.6880, 32.4279],    // Iran
      'IQ': [43.6793, 33.2232],    // Iraq
      'SY': [38.9968, 34.8021],    // Syria
      'LB': [35.8623, 33.8547],    // Lebanon
      'JO': [36.2384, 30.5852],    // Jordan
      'KW': [47.4818, 29.3117],    // Kuwait
      'QA': [51.1839, 25.3548],    // Qatar
      'BH': [50.6344, 26.0667],    // Bahrain
      'OM': [55.9754, 21.4735],    // Oman
      'YE': [48.5164, 15.5527],    // Yemen

      // Special cases
      'Local': [0, 0],             // Local development
      'Unknown': [0, 0],           // Unknown countries

      // Full names as fallback (pour compatibilité)
      'France': [2.3522, 46.6030],
      'Germany': [10.4515, 51.1657],
      'United Kingdom': [-3.4360, 55.3781],
      'Spain': [-3.7492, 40.4637],
      'Italy': [12.5674, 41.8719],
      'Ireland': [-8.2439, 53.4129],
      'United States': [-95.7129, 37.0902],
      'Canada': [-106.3468, 56.1304],
      'Brazil': [-51.9253, -14.2350],
      'China': [104.1954, 35.8617],
      'Japan': [138.2529, 36.2048],
      'India': [78.9629, 20.5937],
      'Australia': [133.7751, -25.2744]
    }

    // Utiliser UNIQUEMENT les vraies données de la base de données
    console.log('[RotatingEarth] Processing ONLY real data from database:', countryData)

    const countryPoints: Array<{
      country: string
      clicks: number
      links: number
      coordinates: [number, number]
      pointSize: number
    }> = []

    // Traiter chaque pays de la base de données
    if (countryData && countryData.length > 0) {
      console.log('[RotatingEarth] Found real database data, processing:', countryData)

      countryData.forEach((dbCountry, index) => {
        console.log(`[RotatingEarth] Processing DB country ${index}:`, dbCountry)

        // Essayer de trouver les coordonnées pour ce pays
        let foundCoords = null
        const countryName = dbCountry.country || 'Unknown'

        // Recherche dans notre mapping avec toutes les variations possibles
        foundCoords = countryCoordinates[countryName] ||
                     countryCoordinates[countryName.toUpperCase()] ||
                     countryCoordinates[countryName.toLowerCase()] ||
                     countryCoordinates[countryName.trim()]

        if (foundCoords) {
          const realPoint = {
            country: countryName,
            clicks: Number(dbCountry.clicks) || 0,
            links: Number(dbCountry.links) || 0,
            coordinates: foundCoords as [number, number],
            pointSize: Math.max(5, Math.min(15, Math.log((Number(dbCountry.clicks) || 0) + 1) * 3))
          }
          countryPoints.push(realPoint)
          console.log(`[RotatingEarth] ✅ Added real point for ${countryName}:`, realPoint)
        } else {
          console.warn(`[RotatingEarth] ❌ No coordinates found for "${countryName}"`)
          console.warn(`[RotatingEarth] Available keys:`, Object.keys(countryCoordinates).filter(k =>
            k.toLowerCase().includes(countryName.toLowerCase()) ||
            countryName.toLowerCase().includes(k.toLowerCase())
          ))
        }
      })
    } else {
      console.log('[RotatingEarth] No real data from database found')
    }

    console.log('[RotatingEarth] Final points to display (REAL DATA ONLY):')
    countryPoints.forEach((point, i) => {
      console.log(`  ${i}: ${point.country} - ${point.clicks} clicks at [${point.coordinates[0]}, ${point.coordinates[1]}]`)
    })

    if (countryPoints.length === 0) {
      console.warn('[RotatingEarth] ⚠️ No country points to display! Check if database has country data.')
    }

    console.log('[RotatingEarth] Final processed country points:', countryPoints)

    const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
      const [x, y] = point
      let inside = false

      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i]
        const [xj, yj] = polygon[j]

        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside
        }
      }

      return inside
    }

    const pointInFeature = (point: [number, number], feature: any): boolean => {
      const geometry = feature.geometry

      if (geometry.type === "Polygon") {
        const coordinates = geometry.coordinates
        // Check if point is in outer ring
        if (!pointInPolygon(point, coordinates[0])) {
          return false
        }
        // Check if point is in any hole (inner rings)
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) {
            return false // Point is in a hole
          }
        }
        return true
      } else if (geometry.type === "MultiPolygon") {
        // Check each polygon in the MultiPolygon
        for (const polygon of geometry.coordinates) {
          // Check if point is in outer ring
          if (pointInPolygon(point, polygon[0])) {
            // Check if point is in any hole
            let inHole = false
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) {
                inHole = true
                break
              }
            }
            if (!inHole) {
              return true
            }
          }
        }
        return false
      }

      return false
    }

    const generateDotsInPolygon = (feature: any, dotSpacing = 16) => {
      const dots: [number, number][] = []
      const bounds = d3.geoBounds(feature)
      const [[minLng, minLat], [maxLng, maxLat]] = bounds

      const stepSize = dotSpacing * 0.08
      let pointsGenerated = 0

      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const point: [number, number] = [lng, lat]
          if (pointInFeature(point, feature)) {
            dots.push(point)
            pointsGenerated++
          }
        }
      }

      console.log(
        `[v0] Generated ${pointsGenerated} points for land feature:`,
        feature.properties?.featurecla || "Land",
      )
      return dots
    }

    interface DotData {
      lng: number
      lat: number
      visible: boolean
    }

    const allDots: DotData[] = []
    let landFeatures: any

    const render = () => {
      // Clear canvas
      context.clearRect(0, 0, containerWidth, containerHeight)

      const currentScale = projection.scale()
      const scaleFactor = currentScale / radius

      // Draw ocean (globe background)
      context.beginPath()
      context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
      context.fillStyle = "#000000"
      context.fill()
      context.strokeStyle = "#ffffff"
      context.lineWidth = 2 * scaleFactor
      context.stroke()

      if (landFeatures) {
        // Draw graticule
        const graticule = d3.geoGraticule()
        context.beginPath()
        path(graticule())
        context.strokeStyle = "#ffffff"
        context.lineWidth = 1 * scaleFactor
        context.globalAlpha = 0.25
        context.stroke()
        context.globalAlpha = 1

        // Draw land outlines
        context.beginPath()
        landFeatures.features.forEach((feature: any) => {
          path(feature)
        })
        context.strokeStyle = "#ffffff"
        context.lineWidth = 1 * scaleFactor
        context.stroke()

        // Draw halftone dots
        allDots.forEach((dot) => {
          const projected = projection([dot.lng, dot.lat])
          if (
            projected &&
            projected[0] >= 0 &&
            projected[0] <= containerWidth &&
            projected[1] >= 0 &&
            projected[1] <= containerHeight
          ) {
            context.beginPath()
            context.arc(projected[0], projected[1], 1.2 * scaleFactor, 0, 2 * Math.PI)
            context.fillStyle = "#999999"
            context.fill()
          }
        })

        // Draw country activity points
        console.log('[RotatingEarth] About to draw', countryPoints.length, 'country points:', countryPoints.map(p => p.country))
        countryPoints.forEach((countryPoint, index) => {
          console.log(`[RotatingEarth] Processing point ${index} (${countryPoint.country}):`, countryPoint)
          const projected = projection(countryPoint.coordinates)
          console.log(`[RotatingEarth] Projected coordinates:`, projected)

          if (projected) {
            const [x, y] = projected

            // Vérifier si le point est visible (sur la face visible du globe)
            const center = projection.invert!([containerWidth / 2, containerHeight / 2]) || [0, 0]
            const distance = d3.geoDistance(countryPoint.coordinates, center)
            const isVisible = distance < Math.PI / 2

            console.log(`[RotatingEarth] Point ${index} - x:${x}, y:${y}, distance:${distance}, isVisible:${isVisible}, bounds: 0-${containerWidth} x 0-${containerHeight}`)

            if (isVisible && x >= 0 && x <= containerWidth && y >= 0 && y <= containerHeight) {
              console.log(`[RotatingEarth] Drawing point ${index} at (${x}, ${y})`)

              // Forcer un rayon minimum plus visible
              const pointRadius = Math.max(5, countryPoint.pointSize * scaleFactor)

              // Effet de pulsation basé sur l'activité
              const time = Date.now() / 1000
              const pulse = Math.sin(time * 2 + countryPoint.clicks * 0.1) * 0.3 + 1

              console.log(`[RotatingEarth] Drawing point with radius: ${pointRadius}, pulse: ${pulse}`)

              // Point principal (glow effect) - Violet
              context.beginPath()
              context.arc(x, y, pointRadius * pulse * 2, 0, 2 * Math.PI)
              context.fillStyle = "#a855f7" // Violet principal
              context.globalAlpha = 0.3
              context.fill()

              // Point central - Violet plus foncé
              context.beginPath()
              context.arc(x, y, pointRadius * pulse, 0, 2 * Math.PI)
              context.fillStyle = "#7c3aed" // Violet foncé
              context.globalAlpha = 0.8
              context.fill()

              // Point intérieur - Blanc pour contraste
              context.beginPath()
              context.arc(x, y, pointRadius * pulse * 0.3, 0, 2 * Math.PI)
              context.fillStyle = "#ffffff"
              context.globalAlpha = 1
              context.fill()

              // Label avec nombre de clics (si assez de place et point assez grand)
              if (pointRadius > 4 * scaleFactor) {
                context.font = `${Math.max(8, 10 * scaleFactor)}px Arial`
                context.fillStyle = "#ffffff"
                context.textAlign = "center"
                context.fillText(
                  countryPoint.clicks.toString(),
                  x,
                  y - (pointRadius * pulse * 1.8)
                )
                context.fillText(
                  countryPoint.country,
                  x,
                  y - (pointRadius * pulse * 2.5)
                )
              }

              // Reset alpha
              context.globalAlpha = 1
              console.log(`[RotatingEarth] Point ${index} drawn successfully`)
            } else {
              console.log(`[RotatingEarth] Point ${index} not drawn - visibility/bounds check failed`)
            }
          } else {
            console.log(`[RotatingEarth] Point ${index} not drawn - projection failed`)
          }
        })
        console.log('[RotatingEarth] Finished drawing country points')
      }
    }

    const loadWorldData = async () => {
      try {
        console.log("[RotatingEarth] Starting to load world data...")
        setIsLoading(true)

        const url = "/api/geojson"
        console.log("[RotatingEarth] Fetching from API route:", url)

        const response = await fetch(url)
        console.log("[RotatingEarth] Fetch response status:", response.status, response.statusText)
        console.log("[RotatingEarth] Response ok:", response.ok)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        console.log("[RotatingEarth] Parsing JSON response...")
        landFeatures = await response.json()
        console.log("[RotatingEarth] Land features loaded:", {
          type: landFeatures.type,
          featuresCount: landFeatures.features?.length,
          firstFeature: landFeatures.features?.[0]
        })

        if (!landFeatures.features || landFeatures.features.length === 0) {
          throw new Error("No land features found in the data")
        }

        // Generate dots for all land features
        console.log("[RotatingEarth] Starting dot generation...")
        let totalDots = 0
        landFeatures.features.forEach((feature: any, index: number) => {
          console.log(`[RotatingEarth] Processing feature ${index + 1}/${landFeatures.features.length}:`, feature.properties?.featurecla || "Unknown")
          const dots = generateDotsInPolygon(feature, 16)
          dots.forEach(([lng, lat]) => {
            allDots.push({ lng, lat, visible: true })
            totalDots++
          })
        })

        console.log(`[RotatingEarth] ✅ Total dots generated: ${totalDots} across ${landFeatures.features.length} land features`)
        console.log("[RotatingEarth] Starting initial render...")

        render()
        setIsLoading(false)
        console.log("[RotatingEarth] ✅ Component loaded successfully!")
      } catch (err) {
        console.error("[RotatingEarth] ❌ Error loading world data:", err)
        console.error("[RotatingEarth] Error details:", {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        })
        setError(`Failed to load land map data: ${err instanceof Error ? err.message : String(err)}`)
        setIsLoading(false)
      }
    }

    // Set up rotation and interaction
    const rotation: [number, number] = [0, 0]
    let autoRotate = true
    const rotationSpeed = 0.3

    const rotate = () => {
      if (autoRotate) {
        rotation[0] += rotationSpeed
        projection.rotate(rotation)
        render()
      }
    }

    // Auto-rotation timer
    const rotationTimer = d3.timer(rotate)

    const handleMouseDown = (event: MouseEvent) => {
      autoRotate = false
      const startX = event.clientX
      const startY = event.clientY
      const startRotation: [number, number] = [...rotation]

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const sensitivity = 0.5
        const dx = moveEvent.clientX - startX
        const dy = moveEvent.clientY - startY

        rotation[0] = startRotation[0] + dx * sensitivity
        rotation[1] = startRotation[1] - dy * sensitivity
        rotation[1] = Math.max(-90, Math.min(90, rotation[1]))

        projection.rotate(rotation)
        render()
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)

        setTimeout(() => {
          autoRotate = true
        }, 10)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1
      const newRadius = Math.max(radius * 0.5, Math.min(radius * 3, projection.scale() * scaleFactor))
      projection.scale(newRadius)
      render()
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("wheel", handleWheel)

    // Load the world data
    loadWorldData()

    // Cleanup
    return () => {
      rotationTimer.stop()
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("wheel", handleWheel)
    }
  }, [dimensions.width, dimensions.height, countryData])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-800 rounded-2xl p-8 ${className}`}>
        <div className="text-center">
          <p className="text-red-400 font-semibold mb-2">Error loading Earth visualization</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-2xl"
        style={{ display: 'block', backgroundColor: '#646464' }}
      />
      <div className="absolute bottom-4 left-4 text-xs text-gray-400 px-2 py-1 rounded-md bg-black/50">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  )
}