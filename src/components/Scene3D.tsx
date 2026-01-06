import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, RoundedBox, Line } from '@react-three/drei';
import { motion } from 'framer-motion';

interface CylinderModelProps {
  radius: number;
  height: number;
  realRadius: number;
  realHeight: number;
}

interface BoxModelProps {
  width: number;
  height: number;
  depth: number;
  realWidth: number;
  realHeight: number;
}

// Escala para visualización
const SCALE_FACTOR = 0.12;

// Lata de bebida/conserva - Diseño minimalista premium
function CylinderModel({ radius, height, realRadius, realHeight }: CylinderModelProps) {
  // Proporciones de lata real (altura es aprox 2x el diámetro)
  const scaledRadius = radius * SCALE_FACTOR;
  const scaledHeight = height * SCALE_FACTOR;
  
  // Grosor del borde metálico
  const rimThickness = 0.015;
  const rimHeight = 0.03;
  
  // Posiciones para las líneas de medición
  const measureOffset = scaledRadius + 0.3;

  return (
    <group>
      {/* Cuerpo principal de la lata - Color premium */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[scaledRadius, scaledRadius, scaledHeight, 64]} />
        <meshPhysicalMaterial
          color="#1a1a2e"
          metalness={0.3}
          roughness={0.4}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Franja decorativa superior */}
      <mesh position={[0, scaledHeight * 0.25, 0]} castShadow>
        <cylinderGeometry args={[scaledRadius + 0.001, scaledRadius + 0.001, scaledHeight * 0.08, 64]} />
        <meshPhysicalMaterial
          color="#e94560"
          metalness={0.5}
          roughness={0.3}
          clearcoat={1}
        />
      </mesh>

      {/* Franja decorativa inferior */}
      <mesh position={[0, -scaledHeight * 0.35, 0]} castShadow>
        <cylinderGeometry args={[scaledRadius + 0.001, scaledRadius + 0.001, scaledHeight * 0.04, 64]} />
        <meshPhysicalMaterial
          color="#e94560"
          metalness={0.5}
          roughness={0.3}
          clearcoat={1}
        />
      </mesh>
      
      {/* Tapa superior metálica con borde */}
      <group position={[0, scaledHeight / 2, 0]}>
        {/* Borde elevado */}
        <mesh castShadow>
          <cylinderGeometry args={[scaledRadius + rimThickness, scaledRadius + rimThickness, rimHeight, 64]} />
          <meshPhysicalMaterial
            color="#c4c4c4"
            metalness={0.95}
            roughness={0.1}
            clearcoat={0.5}
          />
        </mesh>
        {/* Tapa interior */}
        <mesh position={[0, rimHeight / 2, 0]} castShadow>
          <cylinderGeometry args={[scaledRadius * 0.85, scaledRadius * 0.85, 0.01, 64]} />
          <meshPhysicalMaterial
            color="#e8e8e8"
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>
        {/* Anillo de apertura */}
        <mesh position={[scaledRadius * 0.3, rimHeight / 2 + 0.008, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[scaledRadius * 0.15, 0.008, 8, 24]} />
          <meshPhysicalMaterial
            color="#a0a0a0"
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>
      </group>
      
      {/* Tapa inferior metálica */}
      <mesh position={[0, -scaledHeight / 2 - 0.005, 0]} castShadow>
        <cylinderGeometry args={[scaledRadius * 0.9, scaledRadius * 0.9, 0.01, 64]} />
        <meshPhysicalMaterial
          color="#b0b0b0"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Texto principal - PROYECTO */}
      <Text
        position={[0, scaledHeight * 0.05, scaledRadius + 0.01]}
        fontSize={Math.min(scaledRadius * 0.28, 0.1)}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        letterSpacing={0.1}
      >
        PROYECTO
      </Text>

      {/* Texto secundario - CÁLCULO */}
      <Text
        position={[0, -scaledHeight * 0.08, scaledRadius + 0.01]}
        fontSize={Math.min(scaledRadius * 0.4, 0.14)}
        color="#e94560"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        letterSpacing={0.05}
      >
        CÁLCULO
      </Text>

      {/* Texto en el lado opuesto */}
      <Text
        position={[0, scaledHeight * 0.05, -(scaledRadius + 0.01)]}
        rotation={[0, Math.PI, 0]}
        fontSize={Math.min(scaledRadius * 0.28, 0.1)}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        letterSpacing={0.1}
      >
        PROYECTO
      </Text>

      <Text
        position={[0, -scaledHeight * 0.08, -(scaledRadius + 0.01)]}
        rotation={[0, Math.PI, 0]}
        fontSize={Math.min(scaledRadius * 0.4, 0.14)}
        color="#e94560"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        letterSpacing={0.05}
      >
        CÁLCULO
      </Text>

      {/* Línea decorativa circular */}
      <mesh position={[0, -scaledHeight * 0.2, 0]}>
        <torusGeometry args={[scaledRadius + 0.002, 0.003, 8, 64]} />
        <meshPhysicalMaterial color="#e94560" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* ===== LÍNEAS DE MEDICIÓN ===== */}
      
      {/* Línea de altura (vertical) */}
      <Line
        points={[
          [measureOffset, -scaledHeight / 2, 0],
          [measureOffset, scaledHeight / 2, 0]
        ]}
        color="#0071e3"
        lineWidth={2}
      />
      {/* Marcas horizontales en los extremos de altura */}
      <Line
        points={[
          [measureOffset - 0.05, -scaledHeight / 2, 0],
          [measureOffset + 0.05, -scaledHeight / 2, 0]
        ]}
        color="#0071e3"
        lineWidth={2}
      />
      <Line
        points={[
          [measureOffset - 0.05, scaledHeight / 2, 0],
          [measureOffset + 0.05, scaledHeight / 2, 0]
        ]}
        color="#0071e3"
        lineWidth={2}
      />
      {/* Etiqueta de altura */}
      <Text
        position={[measureOffset + 0.15, 0, 0]}
        fontSize={0.12}
        color="#0071e3"
        anchorX="left"
        anchorY="middle"
      >
        {`h = ${realHeight.toFixed(2)} cm`}
      </Text>

      {/* Línea de radio (horizontal arriba desde centro) */}
      <Line
        points={[
          [0, scaledHeight / 2 + 0.15, 0],
          [scaledRadius, scaledHeight / 2 + 0.15, 0]
        ]}
        color="#34c759"
        lineWidth={2}
      />
      {/* Marcas verticales en los extremos del radio */}
      <Line
        points={[
          [0, scaledHeight / 2 + 0.1, 0],
          [0, scaledHeight / 2 + 0.2, 0]
        ]}
        color="#34c759"
        lineWidth={2}
      />
      <Line
        points={[
          [scaledRadius, scaledHeight / 2 + 0.1, 0],
          [scaledRadius, scaledHeight / 2 + 0.2, 0]
        ]}
        color="#34c759"
        lineWidth={2}
      />
      {/* Etiqueta de radio */}
      <Text
        position={[scaledRadius / 2, scaledHeight / 2 + 0.28, 0]}
        fontSize={0.1}
        color="#34c759"
        anchorX="center"
        anchorY="middle"
      >
        {`r = ${realRadius.toFixed(2)} cm`}
      </Text>

      {/* Línea de diámetro (horizontal completa abajo) */}
      <Line
        points={[
          [-scaledRadius, -scaledHeight / 2 - 0.15, 0],
          [scaledRadius, -scaledHeight / 2 - 0.15, 0]
        ]}
        color="#ff9500"
        lineWidth={2}
      />
      {/* Marcas verticales en los extremos del diámetro */}
      <Line
        points={[
          [-scaledRadius, -scaledHeight / 2 - 0.1, 0],
          [-scaledRadius, -scaledHeight / 2 - 0.2, 0]
        ]}
        color="#ff9500"
        lineWidth={2}
      />
      <Line
        points={[
          [scaledRadius, -scaledHeight / 2 - 0.1, 0],
          [scaledRadius, -scaledHeight / 2 - 0.2, 0]
        ]}
        color="#ff9500"
        lineWidth={2}
      />
      {/* Etiqueta de diámetro */}
      <Text
        position={[0, -scaledHeight / 2 - 0.3, 0]}
        fontSize={0.1}
        color="#ff9500"
        anchorX="center"
        anchorY="middle"
      >
        {`d = ${(realRadius * 2).toFixed(2)} cm`}
      </Text>
    </group>
  );
}

// Caja de cereal - Diseño minimalista moderno
function BoxModel({ width, height, depth, realWidth, realHeight }: BoxModelProps) {
  // Proporciones de caja de cereal real (alta, ancha, delgada)
  // Típicamente: altura > ancho > profundidad
  const cerealRatio = {
    width: 1,      // Base
    height: 1.5,   // Más alta
    depth: 0.3     // Más delgada
  };
  
  const baseScale = Math.cbrt(width * height * depth) * SCALE_FACTOR;
  const scaledWidth = baseScale * cerealRatio.width * 1.2;
  const scaledHeight = baseScale * cerealRatio.height * 1.2;
  const scaledDepth = baseScale * cerealRatio.depth * 1.2;
  
  // Offset para las líneas de medición
  const measureOffsetX = scaledWidth / 2 + 0.25;
  const measureOffsetY = -scaledHeight / 2 - 0.15;

  return (
    <group>
      {/* Cuerpo principal de la caja */}
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
          clearcoat={0.2}
        />
      </RoundedBox>

      {/* Panel frontal decorativo */}
      <mesh position={[0, 0, scaledDepth / 2 + 0.001]}>
        <planeGeometry args={[scaledWidth * 0.92, scaledHeight * 0.92]} />
        <meshPhysicalMaterial
          color="#0f0f23"
          metalness={0}
          roughness={0.4}
        />
      </mesh>

      {/* Franja de color superior */}
      <mesh position={[0, scaledHeight * 0.35, scaledDepth / 2 + 0.002]}>
        <planeGeometry args={[scaledWidth * 0.92, scaledHeight * 0.15]} />
        <meshPhysicalMaterial
          color="#667eea"
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* Franja de color inferior */}
      <mesh position={[0, -scaledHeight * 0.4, scaledDepth / 2 + 0.002]}>
        <planeGeometry args={[scaledWidth * 0.92, scaledHeight * 0.08]} />
        <meshPhysicalMaterial
          color="#764ba2"
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* Círculo decorativo */}
      <mesh position={[0, scaledHeight * 0.05, scaledDepth / 2 + 0.003]}>
        <circleGeometry args={[scaledWidth * 0.2, 64]} />
        <meshPhysicalMaterial
          color="#667eea"
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>

      {/* Texto PROYECTO - Superior */}
      <Text
        position={[0, scaledHeight * 0.2, scaledDepth / 2 + 0.004]}
        fontSize={scaledWidth * 0.08}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        letterSpacing={0.15}
      >
        PROYECTO
      </Text>

      {/* Texto CÁLCULO - Principal grande */}
      <Text
        position={[0, scaledHeight * 0.05, scaledDepth / 2 + 0.004]}
        fontSize={scaledWidth * 0.14}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        letterSpacing={0.02}
      >
        CÁLCULO
      </Text>

      {/* Subtexto decorativo */}
      <Text
        position={[0, -scaledHeight * 0.12, scaledDepth / 2 + 0.004]}
        fontSize={scaledWidth * 0.045}
        color="#a0a0a0"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        letterSpacing={0.2}
      >
        OPTIMIZACIÓN • DERIVADAS
      </Text>

      {/* Panel trasero */}
      <mesh position={[0, 0, -scaledDepth / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[scaledWidth * 0.92, scaledHeight * 0.92]} />
        <meshPhysicalMaterial
          color="#1a1a2e"
          metalness={0}
          roughness={0.4}
        />
      </mesh>

      {/* Texto trasero */}
      <Text
        position={[0, 0, -scaledDepth / 2 - 0.002]}
        rotation={[0, Math.PI, 0]}
        fontSize={scaledWidth * 0.1}
        color="#667eea"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
      >
        CÁLCULO
      </Text>

      {/* Paneles laterales con color */}
      <mesh position={[scaledWidth / 2 + 0.001, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[scaledDepth * 0.95, scaledHeight * 0.95]} />
        <meshPhysicalMaterial
          color="#667eea"
          metalness={0}
          roughness={0.4}
        />
      </mesh>

      <mesh position={[-scaledWidth / 2 - 0.001, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[scaledDepth * 0.95, scaledHeight * 0.95]} />
        <meshPhysicalMaterial
          color="#764ba2"
          metalness={0}
          roughness={0.4}
        />
      </mesh>

      {/* Tapa superior */}
      <mesh position={[0, scaledHeight / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[scaledWidth, scaledDepth]} />
        <meshPhysicalMaterial
          color="#e0e0e0"
          metalness={0}
          roughness={0.5}
        />
      </mesh>

      {/* ===== LÍNEAS DE MEDICIÓN ===== */}
      
      {/* Línea de altura (vertical) */}
      <Line
        points={[
          [measureOffsetX, -scaledHeight / 2, 0],
          [measureOffsetX, scaledHeight / 2, 0]
        ]}
        color="#0071e3"
        lineWidth={2}
      />
      {/* Marcas horizontales en los extremos de altura */}
      <Line
        points={[
          [measureOffsetX - 0.05, -scaledHeight / 2, 0],
          [measureOffsetX + 0.05, -scaledHeight / 2, 0]
        ]}
        color="#0071e3"
        lineWidth={2}
      />
      <Line
        points={[
          [measureOffsetX - 0.05, scaledHeight / 2, 0],
          [measureOffsetX + 0.05, scaledHeight / 2, 0]
        ]}
        color="#0071e3"
        lineWidth={2}
      />
      {/* Etiqueta de altura */}
      <Text
        position={[measureOffsetX + 0.12, 0, 0]}
        fontSize={0.1}
        color="#0071e3"
        anchorX="left"
        anchorY="middle"
      >
        {`h = ${realHeight.toFixed(2)} cm`}
      </Text>

      {/* Línea de ancho (horizontal abajo) */}
      <Line
        points={[
          [-scaledWidth / 2, measureOffsetY, scaledDepth / 2],
          [scaledWidth / 2, measureOffsetY, scaledDepth / 2]
        ]}
        color="#34c759"
        lineWidth={2}
      />
      {/* Marcas verticales en los extremos del ancho */}
      <Line
        points={[
          [-scaledWidth / 2, measureOffsetY - 0.05, scaledDepth / 2],
          [-scaledWidth / 2, measureOffsetY + 0.05, scaledDepth / 2]
        ]}
        color="#34c759"
        lineWidth={2}
      />
      <Line
        points={[
          [scaledWidth / 2, measureOffsetY - 0.05, scaledDepth / 2],
          [scaledWidth / 2, measureOffsetY + 0.05, scaledDepth / 2]
        ]}
        color="#34c759"
        lineWidth={2}
      />
      {/* Etiqueta de ancho */}
      <Text
        position={[0, measureOffsetY - 0.12, scaledDepth / 2]}
        fontSize={0.09}
        color="#34c759"
        anchorX="center"
        anchorY="middle"
      >
        {`x = ${realWidth.toFixed(2)} cm`}
      </Text>
    </group>
  );
}

// Componente de carga simple
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#0071e3" wireframe />
    </mesh>
  );
}

// Componente para estado vacío/sin datos
function EmptyState() {
  return (
    <group>
      {/* Cubo con signo de interrogación */}
      <mesh rotation={[0.4, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color="#e5e5e5"
          metalness={0.1}
          roughness={0.5}
          transparent
          opacity={0.6}
          wireframe={false}
        />
      </mesh>
      <mesh rotation={[0.4, 0.5, 0]}>
        <boxGeometry args={[1.01, 1.01, 1.01]} />
        <meshBasicMaterial color="#d1d1d6" wireframe />
      </mesh>
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.2}
        color="#86868b"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
      >
        Ingresa un volumen
      </Text>
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.12}
        color="#aeaeb2"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
      >
        mayor a 0
      </Text>
    </group>
  );
}

interface Scene3DProps {
  mode: 'cylinder' | 'box';
  dimensions: {
    radius?: number;
    height: number;
    width?: number;
    depth?: number;
  } | null;
  realDimensions?: {
    radius?: number;
    height: number;
    width?: number;
    depth?: number;
  } | null;
}

export default function Scene3D({ mode, dimensions, realDimensions }: Scene3DProps) {
  return (
    <motion.div
      className="scene-container"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
    >
      <Canvas
        shadows
        camera={{ position: [3, 2, 5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Luces básicas que siempre se muestran */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.3} />
        <pointLight position={[0, 5, 0]} intensity={0.5} />

        <Suspense fallback={<LoadingFallback />}>
          {/* Environment para reflejos realistas */}
          <Environment preset="studio" />

        {/* Modelo según el modo o estado vacío */}
        {!dimensions ? (
          <EmptyState />
        ) : mode === 'cylinder' ? (
          <CylinderModel
            radius={dimensions.radius || 1}
            height={dimensions.height}
            realRadius={realDimensions?.radius || dimensions.radius || 1}
            realHeight={realDimensions?.height || dimensions.height}
          />
        ) : (
          <BoxModel
            width={dimensions.width || 1}
            height={dimensions.height}
            depth={dimensions.depth || 1}
            realWidth={realDimensions?.width || dimensions.width || 1}
            realHeight={realDimensions?.height || dimensions.height}
          />
        )}
        </Suspense>

        {/* Plano de suelo con sombra */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -2, 0]}
          receiveShadow
        >
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.15} />
        </mesh>

        {/* Controles de órbita */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={15}
          autoRotate
          autoRotateSpeed={1}
        />
      </Canvas>
    </motion.div>
  );
}
