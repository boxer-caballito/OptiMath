import { Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {Maximize2, Ruler, Box, Circle, Move3D, Info, RefreshCw } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, RoundedBox, Line, Grid } from '@react-three/drei';

interface AdvancedViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'cylinder' | 'box';
  dimensions: {
    radius?: number;
    height: number;
    width?: number;
    depth?: number;
  } | null;
  volume: number | null;
  surfaceArea: number | null;
}

// Escala para visualización
const SCALE_FACTOR = 0.12;

// Tipos de unidades
type UnitType = 'cm' | 'm' | '%';

// Función para convertir valores según la unidad
function convertValue(value: number, unit: UnitType, maxValue: number): string {
  switch (unit) {
    case 'm':
      return (value / 100).toFixed(4);
    case '%':
      return ((value / maxValue) * 100).toFixed(0);
    default:
      return value.toFixed(1);
  }
}

// Obtener sufijo de unidad
function getUnitSuffix(unit: UnitType): string {
  switch (unit) {
    case 'm': return 'm';
    case '%': return '%';
    default: return 'cm';
  }
}

// Componente de regla vertical con medidas
function VerticalRuler({ height, realHeight, position, unit }: { height: number; realHeight: number; position: [number, number, number]; unit: UnitType }) {
  const marks = [];
  const numMarks = 5;
  const step = height / numMarks;
  const realStep = realHeight / numMarks;
  
  for (let i = 0; i <= numMarks; i++) {
    const y = -height / 2 + i * step;
    const realValue = i * realStep;
    marks.push(
      <group key={i} position={[0, y, 0]}>
        <Line
          points={[[0, 0, 0], [-0.06, 0, 0]]}
          color="#86868b"
          lineWidth={1}
        />
        <Text
          position={[-0.1, 0, 0]}
          fontSize={0.05}
          color="#86868b"
          anchorX="right"
          anchorY="middle"
        >
          {convertValue(realValue, unit, realHeight)}
        </Text>
      </group>
    );
  }
  
  return (
    <group position={position}>
      <Line
        points={[[0, -height / 2, 0], [0, height / 2, 0]]}
        color="#86868b"
        lineWidth={1}
      />
      {marks}
      <Text
        position={[-0.2, height / 2 + 0.1, 0]}
        fontSize={0.05}
        color="#86868b"
        anchorX="center"
        anchorY="middle"
      >
        {getUnitSuffix(unit)}
      </Text>
    </group>
  );
}

// Componente de regla horizontal con medidas
function HorizontalRuler({ width, realWidth, position, unit }: { width: number; realWidth: number; position: [number, number, number]; unit: UnitType }) {
  const marks = [];
  const numMarks = 5;
  const step = width / numMarks;
  const realStep = realWidth / numMarks;
  
  for (let i = 0; i <= numMarks; i++) {
    const x = -width / 2 + i * step;
    const realValue = i * realStep;
    marks.push(
      <group key={i} position={[x, 0, 0]}>
        <Line
          points={[[0, 0, 0], [0, -0.06, 0]]}
          color="#86868b"
          lineWidth={1}
        />
        <Text
          position={[0, -0.1, 0]}
          fontSize={0.05}
          color="#86868b"
          anchorX="center"
          anchorY="top"
        >
          {convertValue(realValue, unit, realWidth)}
        </Text>
      </group>
    );
  }
  
  return (
    <group position={position}>
      <Line
        points={[[-width / 2, 0, 0], [width / 2, 0, 0]]}
        color="#86868b"
        lineWidth={1}
      />
      {marks}
      <Text
        position={[width / 2 + 0.12, 0, 0]}
        fontSize={0.05}
        color="#86868b"
        anchorX="left"
        anchorY="middle"
      >
        {getUnitSuffix(unit)}
      </Text>
    </group>
  );
}

// Modelo de cilindro avanzado
function AdvancedCylinderModel({ radius, height, realRadius, realHeight, unit }: {
  radius: number;
  height: number;
  realRadius: number;
  realHeight: number;
  unit: UnitType;
}) {
  const scaledRadius = radius * SCALE_FACTOR;
  const scaledHeight = height * SCALE_FACTOR;
  // Mover líneas de medición más lejos para evitar solapamiento
  const measureOffsetRight = scaledRadius + 0.5;
  const rulerOffsetLeft = -scaledRadius - 0.5;
  
  // Formatear valores según unidad
  const formatValue = (val: number) => {
    switch (unit) {
      case 'm': return `${(val / 100).toFixed(4)} m`;
      case '%': return `${((val / realHeight) * 100).toFixed(0)}%`;
      default: return `${val.toFixed(2)} cm`;
    }
  };
  
  const formatRadius = (val: number) => {
    switch (unit) {
      case 'm': return `${(val / 100).toFixed(4)} m`;
      case '%': return `${((val / realRadius) * 100).toFixed(0)}%`;
      default: return `${val.toFixed(2)} cm`;
    }
  };

  return (
    <group>
      {/* Cuerpo del cilindro */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[scaledRadius, scaledRadius, scaledHeight, 64]} />
        <meshPhysicalMaterial
          color="#1a1a2e"
          metalness={0.3}
          roughness={0.4}
          clearcoat={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh>
        <cylinderGeometry args={[scaledRadius + 0.001, scaledRadius + 0.001, scaledHeight, 32]} />
        <meshBasicMaterial color="#0071e3" wireframe transparent opacity={0.3} />
      </mesh>

      {/* Tapas */}
      <mesh position={[0, scaledHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[scaledRadius, 64]} />
        <meshPhysicalMaterial color="#c4c4c4" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -scaledHeight / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[scaledRadius, 64]} />
        <meshPhysicalMaterial color="#b0b0b0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Ejes de referencia - Posicionados detrás/al lado para evitar solapamiento */}
      <Line points={[[-scaledRadius * 0.3, 0, -scaledRadius * 0.5], [scaledRadius * 1.2, 0, -scaledRadius * 0.5]]} color="#ff3b30" lineWidth={2} />
      <Line points={[[-scaledRadius * 0.3, 0, -scaledRadius * 0.5], [-scaledRadius * 0.3, scaledHeight * 0.7, -scaledRadius * 0.5]]} color="#34c759" lineWidth={2} />
      <Line points={[[-scaledRadius * 0.3, 0, -scaledRadius * 0.5], [-scaledRadius * 0.3, 0, scaledRadius * 1.2]]} color="#007aff" lineWidth={2} />
      
      {/* Etiquetas de ejes - Alejadas del modelo */}
      <Text position={[scaledRadius * 1.3, 0, -scaledRadius * 0.5]} fontSize={0.08} color="#ff3b30">X</Text>
      <Text position={[-scaledRadius * 0.3, scaledHeight * 0.75, -scaledRadius * 0.5]} fontSize={0.08} color="#34c759">Y</Text>
      <Text position={[-scaledRadius * 0.3, 0, scaledRadius * 1.3]} fontSize={0.08} color="#007aff">Z</Text>

      {/* ===== LÍNEAS DE MEDICIÓN (lado derecho) ===== */}
      
      {/* Línea de altura (vertical) */}
      <Line
        points={[[measureOffsetRight, -scaledHeight / 2, 0], [measureOffsetRight, scaledHeight / 2, 0]]}
        color="#0071e3"
        lineWidth={2}
      />
      <Line
        points={[[measureOffsetRight - 0.06, -scaledHeight / 2, 0], [measureOffsetRight + 0.06, -scaledHeight / 2, 0]]}
        color="#0071e3"
        lineWidth={2}
      />
      <Line
        points={[[measureOffsetRight - 0.06, scaledHeight / 2, 0], [measureOffsetRight + 0.06, scaledHeight / 2, 0]]}
        color="#0071e3"
        lineWidth={2}
      />
      <Text
        position={[measureOffsetRight + 0.12, 0, 0]}
        fontSize={0.09}
        color="#0071e3"
        anchorX="left"
        anchorY="middle"
      >
        {`h = ${formatValue(realHeight)}`}
      </Text>

      {/* Línea de radio (arriba, centrada) */}
      <Line
        points={[[0, scaledHeight / 2 + 0.2, 0], [scaledRadius, scaledHeight / 2 + 0.2, 0]]}
        color="#34c759"
        lineWidth={2}
      />
      <Line
        points={[[0, scaledHeight / 2 + 0.15, 0], [0, scaledHeight / 2 + 0.25, 0]]}
        color="#34c759"
        lineWidth={2}
      />
      <Line
        points={[[scaledRadius, scaledHeight / 2 + 0.15, 0], [scaledRadius, scaledHeight / 2 + 0.25, 0]]}
        color="#34c759"
        lineWidth={2}
      />
      <Text
        position={[scaledRadius / 2, scaledHeight / 2 + 0.35, 0]}
        fontSize={0.08}
        color="#34c759"
        anchorX="center"
        anchorY="middle"
      >
        {`r = ${formatRadius(realRadius)}`}
      </Text>

      {/* Línea de diámetro (abajo) */}
      <Line
        points={[[-scaledRadius, -scaledHeight / 2 - 0.2, 0], [scaledRadius, -scaledHeight / 2 - 0.2, 0]]}
        color="#ff9500"
        lineWidth={2}
      />
      <Line
        points={[[-scaledRadius, -scaledHeight / 2 - 0.15, 0], [-scaledRadius, -scaledHeight / 2 - 0.25, 0]]}
        color="#ff9500"
        lineWidth={2}
      />
      <Line
        points={[[scaledRadius, -scaledHeight / 2 - 0.15, 0], [scaledRadius, -scaledHeight / 2 - 0.25, 0]]}
        color="#ff9500"
        lineWidth={2}
      />
      <Text
        position={[0, -scaledHeight / 2 - 0.35, 0]}
        fontSize={0.08}
        color="#ff9500"
        anchorX="center"
        anchorY="middle"
      >
        {`d = ${formatRadius(realRadius * 2)}`}
      </Text>

      {/* Reglas (lado izquierdo y abajo, alejadas) */}
      <VerticalRuler height={scaledHeight} realHeight={realHeight} position={[rulerOffsetLeft, 0, 0]} unit={unit} />
      <HorizontalRuler width={scaledRadius * 2} realWidth={realRadius * 2} position={[0, -scaledHeight / 2 - 0.55, 0]} unit={unit} />
    </group>
  );
}

// Modelo de caja avanzado
function AdvancedBoxModel({ width, height, depth, realWidth, realHeight, unit }: {
  width: number;
  height: number;
  depth: number;
  realWidth: number;
  realHeight: number;
  unit: UnitType;
}) {
  const cerealRatio = { width: 1, height: 1.5, depth: 0.3 };
  const baseScale = Math.cbrt(width * height * depth) * SCALE_FACTOR;
  const scaledWidth = baseScale * cerealRatio.width * 1.2;
  const scaledHeight = baseScale * cerealRatio.height * 1.2;
  const scaledDepth = baseScale * cerealRatio.depth * 1.2;
  
  // Separar bien las líneas de medición
  const measureOffsetX = scaledWidth / 2 + 0.4;
  const measureOffsetY = -scaledHeight / 2 - 0.22;
  const rulerOffsetLeft = -scaledWidth / 2 - 0.5;
  
  // Formatear valores según unidad
  const formatHeight = (val: number) => {
    switch (unit) {
      case 'm': return `${(val / 100).toFixed(4)} m`;
      case '%': return `${((val / realHeight) * 100).toFixed(0)}%`;
      default: return `${val.toFixed(2)} cm`;
    }
  };
  
  const formatWidth = (val: number) => {
    switch (unit) {
      case 'm': return `${(val / 100).toFixed(4)} m`;
      case '%': return `${((val / realWidth) * 100).toFixed(0)}%`;
      default: return `${val.toFixed(2)} cm`;
    }
  };

  return (
    <group>
      {/* Cuerpo de la caja */}
      <RoundedBox
        args={[scaledWidth, scaledHeight, scaledDepth]}
        radius={0.02}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#fafafa"
          metalness={0}
          roughness={0.3}
          transparent
          opacity={0.9}
        />
      </RoundedBox>

      {/* Wireframe overlay */}
      <mesh>
        <boxGeometry args={[scaledWidth + 0.002, scaledHeight + 0.002, scaledDepth + 0.002]} />
        <meshBasicMaterial color="#667eea" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Panel frontal */}
      <mesh position={[0, 0, scaledDepth / 2 + 0.001]}>
        <planeGeometry args={[scaledWidth * 0.92, scaledHeight * 0.92]} />
        <meshPhysicalMaterial color="#0f0f23" metalness={0} roughness={0.4} />
      </mesh>

      {/* Ejes de referencia - Movidos a la esquina trasera izquierda */}
      <Line points={[[-scaledWidth * 0.4, -scaledHeight * 0.3, -scaledDepth], [scaledWidth * 0.5, -scaledHeight * 0.3, -scaledDepth]]} color="#ff3b30" lineWidth={2} />
      <Line points={[[-scaledWidth * 0.4, -scaledHeight * 0.3, -scaledDepth], [-scaledWidth * 0.4, scaledHeight * 0.4, -scaledDepth]]} color="#34c759" lineWidth={2} />
      <Line points={[[-scaledWidth * 0.4, -scaledHeight * 0.3, -scaledDepth], [-scaledWidth * 0.4, -scaledHeight * 0.3, scaledDepth]]} color="#007aff" lineWidth={2} />
      
      {/* Etiquetas de ejes - En las puntas de los ejes */}
      <Text position={[scaledWidth * 0.55, -scaledHeight * 0.3, -scaledDepth]} fontSize={0.08} color="#ff3b30">X</Text>
      <Text position={[-scaledWidth * 0.4, scaledHeight * 0.45, -scaledDepth]} fontSize={0.08} color="#34c759">Y</Text>
      <Text position={[-scaledWidth * 0.4, -scaledHeight * 0.3, scaledDepth + 0.08]} fontSize={0.08} color="#007aff">Z</Text>

      {/* ===== LÍNEAS DE MEDICIÓN ===== */}
      
      {/* Línea de altura (lado derecho frontal) */}
      <Line
        points={[[measureOffsetX, -scaledHeight / 2, scaledDepth / 2], [measureOffsetX, scaledHeight / 2, scaledDepth / 2]]}
        color="#0071e3"
        lineWidth={2}
      />
      <Line
        points={[[measureOffsetX - 0.05, -scaledHeight / 2, scaledDepth / 2], [measureOffsetX + 0.05, -scaledHeight / 2, scaledDepth / 2]]}
        color="#0071e3"
        lineWidth={2}
      />
      <Line
        points={[[measureOffsetX - 0.05, scaledHeight / 2, scaledDepth / 2], [measureOffsetX + 0.05, scaledHeight / 2, scaledDepth / 2]]}
        color="#0071e3"
        lineWidth={2}
      />
      <Text
        position={[measureOffsetX + 0.12, 0, scaledDepth / 2]}
        fontSize={0.08}
        color="#0071e3"
        anchorX="left"
        anchorY="middle"
      >
        {`h = ${formatHeight(realHeight)}`}
      </Text>

      {/* Línea de ancho (abajo frontal) */}
      <Line
        points={[[-scaledWidth / 2, measureOffsetY, scaledDepth / 2], [scaledWidth / 2, measureOffsetY, scaledDepth / 2]]}
        color="#34c759"
        lineWidth={2}
      />
      <Line
        points={[[-scaledWidth / 2, measureOffsetY - 0.05, scaledDepth / 2], [-scaledWidth / 2, measureOffsetY + 0.05, scaledDepth / 2]]}
        color="#34c759"
        lineWidth={2}
      />
      <Line
        points={[[scaledWidth / 2, measureOffsetY - 0.05, scaledDepth / 2], [scaledWidth / 2, measureOffsetY + 0.05, scaledDepth / 2]]}
        color="#34c759"
        lineWidth={2}
      />
      <Text
        position={[0, measureOffsetY - 0.12, scaledDepth / 2]}
        fontSize={0.08}
        color="#34c759"
        anchorX="center"
        anchorY="middle"
      >
        {`x = ${formatWidth(realWidth)}`}
      </Text>

      {/* Reglas (lado izquierdo y abajo, bien separadas) */}
      <VerticalRuler height={scaledHeight} realHeight={realHeight} position={[rulerOffsetLeft, 0, scaledDepth / 2]} unit={unit} />
      <HorizontalRuler width={scaledWidth} realWidth={realWidth} position={[0, -scaledHeight / 2 - 0.55, scaledDepth / 2]} unit={unit} />
    </group>
  );
}

export default function AdvancedViewModal({ 
  isOpen, 
  onClose, 
  mode, 
  dimensions, 
  volume,
  surfaceArea 
}: AdvancedViewModalProps) {
  const [unit, setUnit] = useState<UnitType>('cm');
  
  const cycleUnit = () => {
    setUnit(prev => {
      switch (prev) {
        case 'cm': return 'm';
        case 'm': return '%';
        case '%': return 'cm';
      }
    });
  };
  
  if (!dimensions) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="advanced-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="advanced-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="advanced-modal-header">
              <div className="advanced-modal-title">
                <Maximize2 size={20} />
                <h2>Modo de Visualización Avanzado</h2>
              </div>
              <button className="advanced-modal-close" onClick={onClose} aria-label="Cerrar">
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="advanced-modal-content">
              {/* Vista 3D principal */}
              <div className="advanced-3d-view">
                <Canvas
                  shadows
                  camera={{ position: [4, 3, 6], fov: 45 }}
                  style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)' }}
                  gl={{ antialias: true, alpha: true }}
                >
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
                  <directionalLight position={[-5, 5, -5]} intensity={0.3} />
                  <pointLight position={[0, 5, 0]} intensity={0.5} />

                  <Suspense fallback={null}>
                    <Environment preset="studio" />
                    
                    {/* Grid de referencia */}
                    <Grid
                      args={[10, 10]}
                      position={[0, -2, 0]}
                      cellSize={0.5}
                      cellThickness={0.5}
                      cellColor="#2a2a4a"
                      sectionSize={2}
                      sectionThickness={1}
                      sectionColor="#3a3a6a"
                      fadeDistance={15}
                      fadeStrength={1}
                      infiniteGrid
                    />

                    {mode === 'cylinder' ? (
                      <AdvancedCylinderModel
                        radius={dimensions.radius || 1}
                        height={dimensions.height}
                        realRadius={dimensions.radius || 1}
                        realHeight={dimensions.height}
                        unit={unit}
                      />
                    ) : (
                      <AdvancedBoxModel
                        width={dimensions.width || 1}
                        height={dimensions.height}
                        depth={dimensions.depth || 1}
                        realWidth={dimensions.width || 1}
                        realHeight={dimensions.height}
                        unit={unit}
                      />
                    )}
                  </Suspense>

                  <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    minDistance={2}
                    maxDistance={20}
                    autoRotate
                    autoRotateSpeed={0.5}
                  />
                </Canvas>

                {/* Overlay de controles */}
                <div className="advanced-view-controls">
                  <button className="unit-toggle-btn" onClick={cycleUnit} title="Cambiar unidades">
                    <RefreshCw size={16} />
                    <span>{unit === 'cm' ? 'cm' : unit === 'm' ? 'm' : '%'}</span>
                  </button>
                  <div className="view-control-hint">
                    <Move3D size={16} />
                    <span>Arrastra para rotar • Scroll para zoom</span>
                  </div>
                </div>
              </div>

              {/* Panel de información */}
              <div className="advanced-info-panel">
                <div className="info-section">
                  <div className="info-section-header">
                    <Info size={18} />
                    <h3>Información del Modelo</h3>
                  </div>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Tipo</span>
                      <span className="info-value">
                        {mode === 'cylinder' ? (
                          <><Circle size={14} /> Cilindro</>
                        ) : (
                          <><Box size={14} /> Prisma Rectangular</>
                        )}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Volumen</span>
                      <span className="info-value">{volume?.toFixed(2)} cm³</span>
                    </div>
                    <div className="info-item highlight">
                      <span className="info-label">Área Superficial</span>
                      <span className="info-value">{surfaceArea?.toFixed(2)} cm²</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <div className="info-section-header">
                    <Ruler size={18} />
                    <h3>Dimensiones Óptimas</h3>
                  </div>
                  <div className="dimensions-grid">
                    {mode === 'cylinder' ? (
                      <>
                        <div className="dimension-card" style={{ borderColor: '#34c759' }}>
                          <span className="dimension-symbol">r</span>
                          <span className="dimension-name">Radio</span>
                          <span className="dimension-value">{dimensions.radius?.toFixed(4)} cm</span>
                        </div>
                        <div className="dimension-card" style={{ borderColor: '#ff9500' }}>
                          <span className="dimension-symbol">d</span>
                          <span className="dimension-name">Diámetro</span>
                          <span className="dimension-value">{((dimensions.radius || 0) * 2).toFixed(4)} cm</span>
                        </div>
                        <div className="dimension-card" style={{ borderColor: '#0071e3' }}>
                          <span className="dimension-symbol">h</span>
                          <span className="dimension-name">Altura</span>
                          <span className="dimension-value">{dimensions.height.toFixed(4)} cm</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="dimension-card" style={{ borderColor: '#34c759' }}>
                          <span className="dimension-symbol">x</span>
                          <span className="dimension-name">Lado Base</span>
                          <span className="dimension-value">{dimensions.width?.toFixed(4)} cm</span>
                        </div>
                        <div className="dimension-card" style={{ borderColor: '#0071e3' }}>
                          <span className="dimension-symbol">h</span>
                          <span className="dimension-name">Altura</span>
                          <span className="dimension-value">{dimensions.height.toFixed(4)} cm</span>
                        </div>
                        <div className="dimension-card" style={{ borderColor: '#667eea' }}>
                          <span className="dimension-symbol">p</span>
                          <span className="dimension-name">Profundidad</span>
                          <span className="dimension-value">{dimensions.depth?.toFixed(4)} cm</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="info-section">
                  <div className="info-section-header">
                    <Box size={18} />
                    <h3>Leyenda de Colores</h3>
                  </div>
                  <div className="legend-grid">
                    <div className="legend-item">
                      <span className="legend-color" style={{ background: '#ff3b30' }}></span>
                      <span>Eje X</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color" style={{ background: '#34c759' }}></span>
                      <span>Eje Y (Altura)</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color" style={{ background: '#007aff' }}></span>
                      <span>Eje Z</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color" style={{ background: '#0071e3' }}></span>
                      <span>Medida Altura</span>
                    </div>
                    {mode === 'cylinder' ? (
                      <>
                        <div className="legend-item">
                          <span className="legend-color" style={{ background: '#34c759' }}></span>
                          <span>Medida Radio</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color" style={{ background: '#ff9500' }}></span>
                          <span>Medida Diámetro</span>
                        </div>
                      </>
                    ) : (
                      <div className="legend-item">
                        <span className="legend-color" style={{ background: '#34c759' }}></span>
                        <span>Medida Ancho</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
