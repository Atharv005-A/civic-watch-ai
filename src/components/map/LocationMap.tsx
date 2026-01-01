import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

const createCustomIcon = (type: 'civic' | 'anonymous') => {
  const color = type === 'civic' ? '#14b8a6' : '#8b5cf6';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
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

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add existing markers
    markers.forEach(marker => {
      const icon = createCustomIcon(marker.type);
      L.marker(marker.position, { icon })
        .bindPopup(`
          <div style="min-width: 150px;">
            <strong>${marker.title}</strong>
            <br/>
            <span style="
              display: inline-block;
              padding: 2px 8px;
              border-radius: 10px;
              font-size: 11px;
              background: ${marker.status === 'resolved' ? '#22c55e' : marker.status === 'pending' ? '#f59e0b' : '#3b82f6'};
              color: white;
              margin-top: 4px;
            ">${marker.status}</span>
          </div>
        `)
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

        // Add new marker
        const icon = createCustomIcon('civic');
        markerRef.current = L.marker([lat, lng], { icon }).addTo(map);

        // Reverse geocode to get address (using Nominatim)
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
    <div 
      ref={mapRef} 
      className={`w-full h-[400px] rounded-xl overflow-hidden shadow-lg ${className}`}
    />
  );
}
