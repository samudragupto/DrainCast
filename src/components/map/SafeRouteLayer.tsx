import { useEffect, useRef } from 'react'
import { Marker, Pane, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-routing-machine'
import type { ComputedRoute } from '../../types'

const START_PIN = L.divIcon({
  className: '',
  html: '<div class="route-pin"><span class="route-pin-label">START</span></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

const DEST_PIN = L.divIcon({
  className: '',
  html: '<div class="route-pin dest"><span class="route-pin-label">DEST</span></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

type RouteCallback = (error: unknown, routes?: unknown[]) => void

/**
 * Renders the flood-aware route through Leaflet Routing Machine using a custom
 * offline router: LRM handles waypoints + route-line rendering, while the
 * geometry comes from our risk-weighted Dijkstra over the demo road graph.
 * The conventional (shortest) route is drawn underneath for comparison.
 *
 * NB: LRM invokes `router.route(waypoints, callback, context)` and its
 * callback body depends on `this === control`, so the context must be
 * forwarded through, and the response must resolve asynchronously (after
 * addTo() finishes wiring the itinerary containers).
 */
export function SafeRouteLayer({ route }: { route: ComputedRoute | null }) {
  const map = useMap()
  const routeRef = useRef(route)
  routeRef.current = route
  const controlRef = useRef<L.Routing.Control | null>(null)
  const fittedRef = useRef('')

  useEffect(() => {
    const current = routeRef.current
    if (!current?.feasible) {
      controlRef.current?.remove()
      controlRef.current = null
      return
    }

    const router = {
      route(_waypoints: unknown, callback: RouteCallback, context?: unknown) {
        window.setTimeout(() => {
          const done = callback as (this: unknown, error: unknown, routes?: unknown[]) => void
          const r = routeRef.current
          try {
            if (!r?.feasible) {
              done.call(context ?? undefined, { status: -1, message: 'Route unavailable' })
              return
            }
            done.call(context ?? undefined, null, [
              {
                name: r.viaRoadNames.join(' · ') || 'Flood-aware route',
                coordinates: r.coords.map((c) => L.latLng(c[0], c[1])),
                summary: { totalDistance: r.distanceM, totalTime: r.durationMin * 60 },
                instructions: [],
                inputWaypoints: [
                  L.Routing.waypoint(
                    L.latLng(r.start.position[0], r.start.position[1]),
                    r.start.name,
                  ),
                  L.Routing.waypoint(
                    L.latLng(r.destination.position[0], r.destination.position[1]),
                    r.destination.name,
                  ),
                ],
              },
            ])
          } catch (err) {
            console.warn('[DrainCast] route renderer skipped:', err)
          }
        }, 0)
      },
    }

    const control = L.Routing.control({
      plan: L.Routing.plan(
        [
          L.latLng(current.start.position[0], current.start.position[1]),
          L.latLng(current.destination.position[0], current.destination.position[1]),
        ],
        {
          addWaypoints: false,
          draggableWaypoints: false,
          createMarker: () => undefined as unknown as L.Marker,
        },
      ),
      router: router as unknown as L.Routing.IRouter,
      lineOptions: {
        styles: [
          { color: '#050B1B', weight: 9, opacity: 0.65 },
          { color: '#22D3EE', weight: 4.5, opacity: 0.95, className: 'route-safe-line' },
        ],
        addWaypoints: false,
      },
      addWaypoints: false,
      routeWhileDragging: false,
      show: false,
      fitSelectedRoutes: false,
      showAlternatives: false,
    } as unknown as L.Routing.RoutingControlOptions)

    control.addTo(map)
    controlRef.current = control

    return () => {
      try {
        control.remove()
      } catch {
        /* control already detached */
      }
      controlRef.current = null
    }
  }, [route?.start.id, route?.destination.id, route?.feasible, map])

  // Re-route in place when the live risk map changes (slider / horizon),
  // without recreating the control.
  useEffect(() => {
    const control = controlRef.current as unknown as { route?: (options?: unknown) => void } | null
    if (!control) return
    try {
      control.route?.({})
    } catch {
      /* routing refresh failed — keep the last drawn line */
    }
  }, [route])

  // Frame the route once per query, leaving room for the floating panels.
  useEffect(() => {
    if (!route?.feasible) return
    const key = `${route.start.id}->${route.destination.id}`
    if (fittedRef.current === key) return
    fittedRef.current = key

    const bounds = L.latLngBounds(route.coords.map(([lat, lng]) => L.latLng(lat, lng)))
    const wide = map.getSize().x >= 1280
    const pad: L.PointExpression = wide ? [360, 96] : [30, 30]
    window.setTimeout(() => {
      map.fitBounds(bounds, {
        paddingTopLeft: pad,
        paddingBottomRight: pad,
        animate: true,
        maxZoom: 16.5,
      })
    }, 140)
  }, [route?.feasible, route?.start.id, route?.destination.id, route, map])

  const showConventional = Boolean(route?.feasible && route.conventional && !route.sameAsConventional)

  return (
    <>
      <Pane name="conventional-route" style={{ zIndex: 396 }}>
        {showConventional && route?.conventional && (
          <Polyline
            positions={route.conventional.coords}
            interactive={false}
            className="conventional-line"
            pathOptions={{
              color: '#F87171',
              weight: 3,
              opacity: 0.7,
              dashArray: '2 9',
            }}
          />
        )}
      </Pane>

      {route?.feasible && (
        <>
          <Marker position={route.start.position} icon={START_PIN} />
          <Marker position={route.destination.position} icon={DEST_PIN} />
        </>
      )}
    </>
  )
}
