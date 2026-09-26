import { useMap } from 'react-leaflet'
import { Crosshair, Minus, Plus } from 'lucide-react'
import { VELACHERY_CENTER } from '../../data/velacheryRoads'

const DEFAULT_ZOOM = 14.6

/** Zoom in / out / recenter cluster rendered inside the map container. */
export function MapControls() {
  const map = useMap()

  const btn =
    'flex h-8 w-8 items-center justify-center text-ink-2 transition-colors duration-150 hover:text-accent'

  return (
    <div className="leaflet-control-container !absolute">
      <div className="!absolute right-3 top-1/2 z-[640] flex -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-line bg-surface/95 shadow-panel backdrop-blur-md">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => map.zoomIn()}
          className={`${btn} border-b border-line/60`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => map.zoomOut()}
          className={`${btn} border-b border-line/60`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Recenter on Velachery"
          onClick={() => map.setView(VELACHERY_CENTER, DEFAULT_ZOOM, { animate: true })}
          className={btn}
        >
          <Crosshair className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
