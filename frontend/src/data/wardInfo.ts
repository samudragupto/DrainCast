import type { WardInfo } from '../types'

export const wardInfo: WardInfo = {
  wardName: 'Velachery — GCC Ward 175 (Velachery) & Ward 181 (Velachery West), Zones 13–14',
  city: 'Chennai',
  state: 'Tamil Nadu',
  center: [12.975, 80.221],
  catchmentAreaKm2: 7.4,
  selectionReason:
    'Velachery concentrates every failure mode the problem statement describes: low-lying tank-bed and marsh-fringe topography, a stormwater network that surcharges at ordinary monsoon intensities, and corridors that have flooded repeatedly — 2015, 2021 and 2023 — despite successive upgrades. A coupling demo that holds up here is a demo that convinces.',
  residents: 118000,
  populationNote:
    '≈1.2 lakh residents across the demo catchment (GCC ward base, 2026 projection). Daytime floating population adds heavily via Phoenix Marketcity, the MRTS terminus and the wholesale bazaar.',
  drainageContext:
    'Stormwater from the whole demo catchment converges on the Dhandeeswaram trunk (JN-VEL-09 → MH-VEL-10) before discharging to the Pallikaranai marsh — a single-outfall system, which makes rainfall–drainage coupling unusually visible street by street.',
  floodHistory: [
    {
      year: 2015,
      event: 'December NE monsoon deluge',
      impact:
        'Velachery was among the worst-hit localities in Chennai; Main Road corridors stayed inundated for days and boat rescue was widely reported.',
    },
    {
      year: 2021,
      event: 'November–December NE monsoon',
      impact:
        'Repeat inundation across Dhandeeswaram, Surya Nagar and Ram Nagar; GCC deployed mobile pumps for several consecutive nights.',
    },
    {
      year: 2023,
      event: 'Cyclone Michaung (Dec 4–5)',
      impact:
        'Two-day deluge submerged Velachery for the third time in a decade; ground floors and basements along the Main Road corridor went under.',
    },
    {
      year: 2024,
      event: 'October–December NE monsoon',
      impact:
        'Multiple inundation spells across south Chennai; marsh-fringe roads toward Pallikaranai were cut off repeatedly.',
    },
  ],
  floodHotspots: [
    'Velachery Main Road — Checkpost sag',
    'Dhandeeswaram junction pocket',
    'Surya Nagar first cross',
    'Ram Nagar market stretch',
    'MRTS underpass approach',
  ],
}
