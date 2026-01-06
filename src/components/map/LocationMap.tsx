import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Locate, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    title: string;
    type: 'civic' | 'anonymous';
    status: string;
  }>;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  interactive?: boolean;
  className?: string;
}

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (type: 'civic' | 'anonymous', status?: string) => {
  const color = type === 'civic' ? '#14b8a6' : '#8b5cf6';
  const statusColor = status === 'resolved' ? '#22c55e' : status === 'pending' ? '#f59e0b' : color;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${statusColor};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const createSelectedIcon = () => {
  return L.divIcon({
    className: 'selected-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
        border: 4px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse-marker 2s ease-in-out infinite;
      ">
        <div style="
          width: 14px;
          height: 14px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

export function LocationMap({ 
  center = [28.6139, 77.2090], // Delhi coordinates
  zoom = 12,
  markers = [],
  onLocationSelect,
  interactive = false,
  className = ''
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateMe = () => {
    if (!mapInstanceRef.current) return;
    
    setIsLocating(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const map = mapInstanceRef.current!;
          
          map.flyTo([latitude, longitude], 15, {
            duration: 1.5
          });

          if (interactive && onLocationSelect) {
            // Remove existing marker
            if (markerRef.current) {
              map.removeLayer(markerRef.current);
            }

            // Add new marker
            const icon = createSelectedIcon();
            markerRef.current = L.marker([latitude, longitude], { icon }).addTo(map);

            // Reverse geocode
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();
              const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              onLocationSelect(latitude, longitude, address);
            } catch {
              onLocationSelect(latitude, longitude, `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          }
          
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map with better styling
    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false, // We'll add custom controls
      attributionControl: true,
    });

    // Use CartoDB tiles for a more modern look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add existing markers
    markers.forEach(marker => {
      const icon = createCustomIcon(marker.type, marker.status);
      L.marker(marker.position, { icon })
        .bindPopup(`
          <div style="min-width: 180px; padding: 8px;">
            <strong style="font-size: 14px; color: #1a1a2e;">${marker.title}</strong>
            <br/>
            <div style="margin-top: 8px; display: flex; gap: 8px; align-items: center;">
              <span style="
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 600;
                text-transform: capitalize;
                background: ${marker.status === 'resolved' ? '#dcfce7' : marker.status === 'pending' ? '#fef3c7' : '#dbeafe'};
                color: ${marker.status === 'resolved' ? '#166534' : marker.status === 'pending' ? '#92400e' : '#1e40af'};
              ">${marker.status}</span>
              <span style="
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 600;
                background: ${marker.type === 'civic' ? '#ccfbf1' : '#ede9fe'};
                color: ${marker.type === 'civic' ? '#0d9488' : '#7c3aed'};
              ">${marker.type}</span>
            </div>
          </div>
        `, {
          className: 'custom-popup'
        })
        .addTo(map);
    });

    // Interactive mode - allow clicking to set location
    if (interactive && onLocationSelect) {
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        
        // Remove existing marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Add new marker with selected style
        const icon = createSelectedIcon();
        markerRef.current = L.marker([lat, lng], { icon }).addTo(map);

        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          onLocationSelect(lat, lng, address);
        } catch {
          onLocationSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-[400px] rounded-xl overflow-hidden shadow-lg ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Custom Controls */}
      {interactive && (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="bg-card shadow-lg hover:bg-card/90"
          >
            <Locate className={`w-4 h-4 ${isLocating ? 'animate-pulse' : ''}`} />
          </Button>
        </div>
      )}

      {/* Instructions for interactive mode */}
      {interactive && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <div className="bg-card/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-border/50">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <MapPin className="w-3 h-3 text-accent" />
              Click on the map to select location, or use the locate button
            </p>
          </div>
        </div>
      )}

      {/* Map loading styles */}
      <style>{`
        @keyframes pulse-marker {
          0%, 100% {
            box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
          }
          50% {
            box-shadow: 0 6px 30px rgba(20, 184, 166, 0.6);
          }
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .custom-popup .leaflet-popup-tip {
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        
        .leaflet-control-zoom a {
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          border: none !important;
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
        }
        
        .leaflet-control-zoom a:hover {
          background: hsl(var(--muted)) !important;
        }
      `}</style>
    </div>
  );
}
