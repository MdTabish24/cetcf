import { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, Building, Navigation } from 'lucide-react';

// India TopoJSON from CDN
const INDIA_TOPO = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface Center {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  email: string;
  coordinates: [number, number]; // [longitude, latitude]
}

const CENTERS: Center[] = [
  {
    id: 'delhi-1',
    name: 'CETCF North Hub',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Block C, Connaught Place, New Delhi',
    phone: '+91 11-4567-8900',
    email: 'delhi@cetcf.org',
    coordinates: [77.2090, 28.6139],
  },
  {
    id: 'mumbai-1',
    name: 'CETCF West HQ',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Andheri East, Near Metro Station',
    phone: '+91 22-8765-4321',
    email: 'mumbai@cetcf.org',
    coordinates: [72.8777, 19.0760],
  },
  {
    id: 'bangalore-1',
    name: 'CETCF Tech Center',
    city: 'Bangalore',
    state: 'Karnataka',
    address: 'Koramangala 4th Block, Bengaluru',
    phone: '+91 80-2345-6789',
    email: 'blr@cetcf.org',
    coordinates: [77.5946, 12.9716],
  },
  {
    id: 'kolkata-1',
    name: 'CETCF East Hub',
    city: 'Kolkata',
    state: 'West Bengal',
    address: 'Park Street Area, Kolkata',
    phone: '+91 33-5678-9012',
    email: 'kolkata@cetcf.org',
    coordinates: [88.3639, 22.5726],
  },
  {
    id: 'hyderabad-1',
    name: 'CETCF South Hub',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'HITEC City, Madhapur',
    phone: '+91 40-3456-7890',
    email: 'hyd@cetcf.org',
    coordinates: [78.4867, 17.3850],
  }
];

export default function IndiaMap() {
  const [activeCenter, setActiveCenter] = useState<Center | null>(CENTERS[1]);

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Map Container */}
      <motion.div 
        style={{ 
          position: 'relative',
          background: 'rgba(255,255,255,0.6)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 650,
            center: [82, 22],
          }}
          style={{ width: '100%', height: 'auto' }}
          width={400}
          height={380}
        >
          <Geographies geography={INDIA_TOPO}>
            {({ geographies }) =>
              geographies
                .filter((geo) => geo.properties.name === 'India')
                .map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="rgba(13, 27, 62, 0.08)"
                    stroke="var(--navy)"
                    strokeWidth={1}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: 'rgba(13, 27, 62, 0.12)', outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
            }
          </Geographies>
          
          {/* City markers */}
          {CENTERS.map((center) => {
            const isActive = activeCenter?.id === center.id;
            return (
              <Marker key={center.id} coordinates={center.coordinates}>
                <g style={{ cursor: 'pointer' }} onClick={() => setActiveCenter(center)}>
                  {/* Pulse ring */}
                  {isActive && (
                    <circle r="12" fill="none" stroke="#B8860B" strokeWidth="1" opacity="0.4">
                      <animate attributeName="r" from="6" to="18" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    r={isActive ? 6 : 4}
                    fill={isActive ? '#B8860B' : '#C2185B'}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                  <text
                    y={-10}
                    textAnchor="middle"
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      fill: isActive ? '#B8860B' : '#0D1B3E',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {center.city}
                  </text>
                </g>
              </Marker>
            );
          })}
        </ComposableMap>
      </motion.div>

      {/* Info Card */}
      <AnimatePresence mode="wait">
        {activeCenter && (
          <motion.div
            key={activeCenter.id}
            style={{ 
              padding: '16px', 
              background: 'var(--surface)', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '8px', 
                background: 'rgba(184, 134, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--gold)', border: '1px solid rgba(184, 134, 11, 0.2)'
              }}>
                <Building size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{activeCenter.name}</h3>
                <p style={{ color: 'var(--gold)', margin: 0, fontSize: '11px', fontWeight: 600 }}>{activeCenter.city}, {activeCenter.state}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                <Navigation size={12} style={{ color: 'var(--muted)' }} />
                {activeCenter.address}
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                  <Phone size={12} style={{ color: 'var(--muted)' }} />
                  {activeCenter.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                  <Mail size={12} style={{ color: 'var(--muted)' }} />
                  {activeCenter.email}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
