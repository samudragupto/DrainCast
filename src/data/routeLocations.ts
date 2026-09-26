import type { RouteLocation } from '../types'

/**
 * Suggested origin/destination points for the flood-safe route finder.
 * Every point sits on (or within a few metres of) the demo road network.
 */
export const routeLocations: RouteLocation[] = [
  {
    id: 'phoenix',
    name: 'Phoenix Marketcity',
    area: 'Velachery Main Road (East)',
    position: [12.9921, 80.2175],
    category: 'Transit Hub',
  },
  {
    id: 'mrts',
    name: 'Velachery MRTS Station',
    area: 'Taramani Link Road',
    position: [12.9936, 80.2213],
    category: 'Transit Hub',
  },
  {
    id: 'checkpost',
    name: 'Velachery Checkpost',
    area: '100 Feet Road',
    position: [12.9872, 80.2085],
    category: 'Junction',
  },
  {
    id: 'gnc',
    name: 'Guru Nanak College',
    area: 'Baby Nagar',
    position: [12.9868, 80.2239],
    category: 'Campus',
  },
  {
    id: 'vijayanagar',
    name: 'Vijayanagar Bus Terminus',
    area: 'Vijayanagar',
    position: [12.9842, 80.2135],
    category: 'Transit Hub',
  },
  {
    id: 'dhandeeswaram',
    name: 'Dhandeeswaram Bus Stop',
    area: 'Dhandeeswaram',
    position: [12.9738, 80.2222],
    category: 'Neighbourhood',
  },
  {
    id: 'marsh',
    name: 'Pallikaranai Marsh Viewpoint',
    area: 'Pallikaranai Connector',
    position: [12.9675, 80.2252],
    category: 'Neighbourhood',
  },
  {
    id: 'suryanagar',
    name: 'Surya Nagar Park',
    area: 'Surya Nagar',
    position: [12.9757, 80.2246],
    category: 'Neighbourhood',
  },
  {
    id: 'tansinagar',
    name: 'Tansi Nagar',
    area: 'Tansi Nagar',
    position: [12.9906, 80.2106],
    category: 'Neighbourhood',
  },
  {
    id: 'ramnagar',
    name: 'Ram Nagar Market',
    area: 'Ram Nagar',
    position: [12.9676, 80.2172],
    category: 'Market',
  },
  {
    id: 'cms',
    name: 'CMS Colony Junction',
    area: 'CMS Colony',
    position: [12.9782, 80.2198],
    category: 'Junction',
  },
  {
    id: 'lakeview',
    name: 'Velachery Lake View Point',
    area: 'Velachery Lakefront',
    position: [12.9786, 80.2055],
    category: 'Neighbourhood',
  },
]
