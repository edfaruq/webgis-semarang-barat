"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface UserLocationMarkerProps {
  position: [number, number] | null;
  accuracy?: number;
}

export default function UserLocationMarker({ position, accuracy }: UserLocationMarkerProps) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const pulseRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!position) {
      // Remove markers if position is null
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
        circleRef.current = null;
      }
      if (pulseRef.current) {
        map.removeLayer(pulseRef.current);
        pulseRef.current = null;
      }
      return;
    }

    // Create custom blue dot icon (Google Maps style)
    const blueDotIcon = L.divIcon({
      className: "user-location-marker",
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background-color: #4285f4;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    // Create accuracy circle
    if (accuracy && accuracy > 0) {
      if (!circleRef.current) {
        circleRef.current = L.circle(position, {
          radius: accuracy,
          fillColor: "#4285f4",
          fillOpacity: 0.15,
          color: "#4285f4",
          weight: 1,
          opacity: 0.3,
        }).addTo(map);
      } else {
        circleRef.current.setLatLng(position);
        circleRef.current.setRadius(accuracy);
      }
    }

    // Create pulsing circle effect
    if (!pulseRef.current) {
      pulseRef.current = L.circle(position, {
        radius: 30,
        fillColor: "#4285f4",
        fillOpacity: 0.2,
        color: "#4285f4",
        weight: 2,
        opacity: 0.4,
      }).addTo(map);

      // Animate pulsing using interval
      let radius = 30;
      let growing = true;
      const pulseInterval = setInterval(() => {
        if (!pulseRef.current) {
          clearInterval(pulseInterval);
          return;
        }
        
        if (growing) {
          radius += 1.5;
          if (radius >= 50) growing = false;
        } else {
          radius -= 1.5;
          if (radius <= 30) growing = true;
        }
        
        pulseRef.current.setRadius(radius);
      }, 50);

      // Store interval ID for cleanup
      (pulseRef.current as any).pulseInterval = pulseInterval;
    } else {
      pulseRef.current.setLatLng(position);
    }

    // Create or update marker
    if (!markerRef.current) {
      markerRef.current = L.marker(position, { icon: blueDotIcon, zIndexOffset: 1000 }).addTo(map);
    } else {
      markerRef.current.setLatLng(position);
    }

    return () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
        circleRef.current = null;
      }
      if (pulseRef.current) {
        const interval = (pulseRef.current as any).pulseInterval;
        if (interval) clearInterval(interval);
        map.removeLayer(pulseRef.current);
        pulseRef.current = null;
      }
    };
  }, [position, accuracy, map]);

  return null;
}
