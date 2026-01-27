"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { getRouteFromOSRM } from "@/lib/routing";

interface RouteLayerProps {
  start: [number, number] | null; // [lat, lng] - user location
  end: [number, number] | null;   // [lat, lng] - destination
  onRouteError?: (error: string) => void;
}

export default function RouteLayer({ start, end, onRouteError }: RouteLayerProps) {
  const map = useMap();
  const routeGroupRef = useRef<L.LayerGroup | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const shadowRouteRef = useRef<L.Polyline | null>(null);
  const loadingRef = useRef<boolean>(false);

  // Helper function to clear all routes - more aggressive approach
  const clearRoutes = useCallback(() => {
    console.log("Clearing routes...", { 
      hasRouteGroup: !!routeGroupRef.current,
      hasRoute: !!routeRef.current,
      hasShadow: !!shadowRouteRef.current
    });
    
    // Remove route group if exists
    if (routeGroupRef.current) {
      try {
        // First, remove all layers from the group individually
        routeGroupRef.current.eachLayer((layer) => {
          try {
            if (map.hasLayer(layer)) {
              map.removeLayer(layer);
            }
          } catch (error) {
            console.error("Error removing layer from group:", error);
          }
        });
        // Clear the group
        routeGroupRef.current.clearLayers();
        // Then remove the group itself
        if (map.hasLayer(routeGroupRef.current)) {
          map.removeLayer(routeGroupRef.current);
          console.log("Route group removed");
        }
      } catch (error) {
        console.error("Error removing route group:", error);
      }
      routeGroupRef.current = null;
    }
    
    // Also remove individual routes if they exist (backup cleanup)
    if (routeRef.current) {
      try {
        if (map.hasLayer(routeRef.current)) {
          map.removeLayer(routeRef.current);
          console.log("Main route removed individually");
        }
      } catch (error) {
        console.error("Error removing main route:", error);
      }
      routeRef.current = null;
    }
    
    if (shadowRouteRef.current) {
      try {
        if (map.hasLayer(shadowRouteRef.current)) {
          map.removeLayer(shadowRouteRef.current);
          console.log("Shadow route removed individually");
        }
      } catch (error) {
        console.error("Error removing shadow route:", error);
      }
      shadowRouteRef.current = null;
    }
    
    // Aggressive cleanup: remove all polylines marked as route layers
    try {
      map.eachLayer((layer) => {
        if (layer instanceof L.Polyline && (layer as any)._isRouteLayer) {
          console.log("Removing route polyline found via eachLayer:", (layer as any)._routeType);
          try {
            if (map.hasLayer(layer)) {
              map.removeLayer(layer);
            }
          } catch (error) {
            console.error("Error removing layer in aggressive cleanup:", error);
          }
        }
      });
    } catch (error) {
      console.error("Error in aggressive cleanup:", error);
    }
    
    console.log("Routes cleared");
  }, [map]);

  useEffect(() => {
    // Clear existing route when start or end changes
    clearRoutes();

    // Don't create route if start or end is missing
    if (!start || !end) {
      return;
    }

    // Prevent multiple simultaneous requests
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;

    // Convert [lat, lng] to [lng, lat] for OSRM
    const startCoords: [number, number] = [start[1], start[0]];
    const endCoords: [number, number] = [end[1], end[0]];

    // Fetch route from OSRM
    getRouteFromOSRM(startCoords, endCoords)
      .then((coordinates) => {
        loadingRef.current = false;

        if (!coordinates || coordinates.length === 0) {
          if (onRouteError) {
            onRouteError("Tidak dapat menemukan rute ke tujuan");
          }
          return;
        }

        // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
        const latLngs = coordinates.map((coord) => [coord[1], coord[0]] as [number, number]);

        // Create a layer group to hold both routes
        const routeGroup = L.layerGroup();

        // Create shadow/outline effect first (so it appears behind main route)
        const shadowRoute = L.polyline(latLngs, {
          color: "#1a73e8", // Darker blue for shadow
          weight: 7,
          opacity: 0.3,
          lineCap: "round",
          lineJoin: "round",
        });
        // Mark this as our route layer
        (shadowRoute as any)._isRouteLayer = true;
        (shadowRoute as any)._routeType = 'shadow';
        routeGroup.addLayer(shadowRoute);
        shadowRouteRef.current = shadowRoute;

        // Create polyline with Google Maps style (blue route)
        const route = L.polyline(latLngs, {
          color: "#4285f4", // Google Maps blue
          weight: 5,
          opacity: 0.8,
          lineCap: "round",
          lineJoin: "round",
        });
        // Mark this as our route layer
        (route as any)._isRouteLayer = true;
        (route as any)._routeType = 'main';
        routeGroup.addLayer(route);
        routeRef.current = route;

        // Add the group to map
        routeGroup.addTo(map);

        // Store reference to the group
        routeGroupRef.current = routeGroup;

        // Fit map to show entire route with both start and end points
        const allPoints = [...latLngs, start, end];
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 16,
        });
      })
      .catch((error) => {
        loadingRef.current = false;
        console.error("Error fetching route:", error);
        if (onRouteError) {
          onRouteError("Gagal memuat rute. Pastikan koneksi internet tersedia.");
        }
      });

    return () => {
      loadingRef.current = false;
      clearRoutes();
    };
  }, [start, end, map, onRouteError, clearRoutes]);

  // Cleanup on unmount - this ensures routes are cleared when component unmounts
  useEffect(() => {
    return () => {
      clearRoutes();
    };
  }, [clearRoutes]);

  return null;
}
