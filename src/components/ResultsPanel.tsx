import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Ruler, Circle, Square, TrendingDown, AlertCircle, Lightbulb } from 'lucide-react';
import Math from './Math';

interface ResultsPanelProps {
  mode: 'cylinder' | 'box';
  volume: number | null;
  results: {
    optimalRadius?: number;
    optimalWidth?: number;
    optimalHeight: number;
    optimalDepth?: number;
    surfaceArea: number;
  } | null;
}

export default function ResultsPanel({ mode, volume, results }: ResultsPanelProps) {
  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toFixed(decimals);
  };

  // Estado vacío cuando no hay volumen válido
  if (!results || volume === null || volume <= 0) {
    return (
      <motion.div
        className="results-panel results-panel-empty"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="results-header">
          <Calculator size={24} />
          <h2>Resultados de Optimización</h2>
        </div>
        
        <div className="empty-state-container">
          <div className="empty-state-icon">
            <AlertCircle size={48} />
          </div>
          <h3 className="empty-state-title">Sin datos para calcular</h3>
          <p className="empty-state-description">
            Ingresa un volumen mayor a 0 cm³ para ver los resultados de optimización.
          </p>
          <div className="empty-state-hint">
            <span>Sugerencia:</span> Prueba con 330 ml (lata estándar) o 500 ml
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="results-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="results-header">
        <Calculator size={24} />
        <h2>Resultados de Optimización</h2>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          className="results-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* Volumen dado */}
          <div className="result-card volume-card">
            <div className="result-icon">
              <Ruler size={20} />
            </div>
            <div className="result-info">
              <span className="result-label">Volumen Dado</span>
              <span className="result-value">{formatNumber(volume)} cm³</span>
            </div>
          </div>

          {/* Dimensiones óptimas */}
          <div className="result-card dimensions-card">
            <div className="result-icon">
              {mode === 'cylinder' ? <Circle size={20} /> : <Square size={20} />}
            </div>
            <div className="result-info">
              <span className="result-label">Dimensiones Óptimas</span>
              {mode === 'cylinder' ? (
                <div className="dimensions-list">
                  <div className="dimension-item">
                    <span>Radio (r):</span>
                    <span className="dimension-value">{formatNumber(results.optimalRadius || 0)} cm</span>
                  </div>
                  <div className="dimension-item">
                    <span>Altura (h):</span>
                    <span className="dimension-value">{formatNumber(results.optimalHeight)} cm</span>
                  </div>
                  <div className="dimension-item">
                    <span>Diámetro (d):</span>
                    <span className="dimension-value">{formatNumber((results.optimalRadius || 0) * 2)} cm</span>
                  </div>
                </div>
              ) : (
                <div className="dimensions-list">
                  <div className="dimension-item">
                    <span>Lado base (x):</span>
                    <span className="dimension-value">{formatNumber(results.optimalWidth || 0)} cm</span>
                  </div>
                  <div className="dimension-item">
                    <span>Altura (h):</span>
                    <span className="dimension-value">{formatNumber(results.optimalHeight)} cm</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Área superficial mínima */}
          <div className="result-card area-card highlight">
            <div className="result-icon">
              <TrendingDown size={20} />
            </div>
            <div className="result-info">
              <span className="result-label">Área Superficial Mínima</span>
              <span className="result-value highlight-value">
                {formatNumber(results.surfaceArea)} cm²
              </span>
              <span className="result-subtitle">Material mínimo requerido</span>
            </div>
          </div>

          {/* Insight especial */}
          <motion.div
            className="insight-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="insight-content">
              {mode === 'cylinder' ? (
                <>
                  <span className="insight-icon"><Lightbulb size={20} /></span>
                  <p>
                    <strong>Dato importante:</strong> En la forma óptima del cilindro, 
                    la altura es igual al diámetro (<Math tex="h = 2r" />), 
                    lo que minimiza el uso de material.
                  </p>
                </>
              ) : (
                <>
                  <span className="insight-icon"><Lightbulb size={20} /></span>
                  <p>
                    <strong>Dato importante:</strong> Para una caja con base cuadrada, 
                    la forma óptima es un <strong>cubo perfecto</strong> (<Math tex="x = h" />), 
                    donde todas las aristas son iguales.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
