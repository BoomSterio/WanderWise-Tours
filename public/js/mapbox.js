/* eslint-disable no-undef */

export const renderMap = (locations) => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiZXRvemhla3N5biIsImEiOiJjbHN6N211MjMwa3hnMmlsb2Z2N2dhZDNmIn0.Ats3CbrisTuACTNWW4R6tA'
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/etozheksyn/clsz8b9zq00ey01pigybqfsi1',
    scrollZoom: false,
  })

  const bounds = new mapboxgl.LngLatBounds()

  locations.forEach((l) => {
    // Create marker
    const element = document.createElement('div')
    element.className = 'marker'

    // Add marker
    new mapboxgl.Marker({
      element,
      anchor: 'bottom',
    })
      .setLngLat(l.coordinates)
      .addTo(map)

    // Add popup
    new mapboxgl.Popup({ offset: 32, focusAfterOpen: false })
      .setLngLat(l.coordinates)
      .setHTML(`<p>Day ${l.day}: ${l.description}</p>`)
      .addTo(map)

    // Extend the map bounds to include the locations
    bounds.extend(l.coordinates)
  })

  map.fitBounds(bounds, {
    padding: {
      top: 150,
      bottom: 125,
      left: 100,
      right: 100,
    },
  })

  const nav = new mapboxgl.NavigationControl()
  map.addControl(nav, 'bottom-left')
}
