
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from "@/components/ui/use-toast";

interface LocationMapProps {
  coordinates: [number, number];
  onLocationChange: (lat: number, lng: number) => void;
}

const LocationMap = ({ coordinates, onLocationChange }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [currentCoords, setCurrentCoords] = useState(coordinates);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Asegurarse de que las coordenadas son válidas
    if (!coordinates[0] && !coordinates[1]) {
      console.log('Esperando coordenadas GPS válidas...');
      return;
    }

    console.log('Inicializando mapa con coordenadas:', coordinates);
    setCurrentCoords(coordinates);

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: coordinates,
      zoom: 15
    });

    marker.current = new mapboxgl.Marker({
      draggable: true,
      color: '#FF0000'
    })
      .setLngLat(coordinates)
      .addTo(map.current);

    marker.current.on('dragend', () => {
      if (marker.current) {
        const lngLat = marker.current.getLngLat();
        console.log('Nueva posición del marcador:', lngLat);
        const newCoords: [number, number] = [lngLat.lng, lngLat.lat];
        setCurrentCoords(newCoords);
        onLocationChange(lngLat.lat, lngLat.lng);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [coordinates]); // Dependemos de coordinates para la inicialización inicial

  return (
    <div className="space-y-2">
      <div ref={mapContainer} className="w-full h-[300px] rounded-lg" />
      <div className="bg-gray-800 p-3 rounded-lg text-white text-sm">
        <p className="font-mono">
          Latitud: {currentCoords[1].toFixed(6)}, Longitud: {currentCoords[0].toFixed(6)}
        </p>
      </div>
    </div>
  );
};

export default LocationMap;
