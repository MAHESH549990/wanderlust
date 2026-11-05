import React, { useEffect, useRef } from "react";

export default function MapView({ listing, token }) {
  const mapElement = useRef(null);

  useEffect(() => {
    const mapbox = window.mapboxgl;
    const coordinates = listing.geometry?.coordinates;
    if (!mapElement.current || !mapbox || !token || !coordinates?.length) return;
    mapbox.accessToken = token;
    const map = new mapbox.Map({
      container: mapElement.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: coordinates,
      zoom: 10,
    });
    new mapbox.Marker({ color: "#e45d45" }).setLngLat(coordinates).addTo(map);
    return () => map.remove();
  }, [listing, token]);

  return <div className="mapbox-container" ref={mapElement}>{(!token || !listing.geometry?.coordinates?.length) && <p>Map is unavailable for this stay.</p>}</div>;
}
