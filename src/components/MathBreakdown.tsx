import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, Calculator } from 'lucide-react';
import { useState } from 'react';
import Math from './Math';

interface MathBreakdownProps {
  mode: 'cylinder' | 'box';
  volume: number | null;
  results: {
    optimalRadius?: number;
    optimalWidth?: number;
    optimalHeight: number;
    surfaceArea: number;
  } | null;
}

export default function MathBreakdown({ mode, volume, results }: MathBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatNumber = (num: number): string => num.toFixed(4);

  // Estado vacío
  if (!results || volume === null || volume <= 0) {
    return (
      <motion.div
        className="math-breakdown math-breakdown-empty"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="breakdown-header-disabled">
          <div className="breakdown-title">
            <BookOpen size={20} />
            <h3>Explicación Matemática Paso a Paso</h3>
          </div>
        </div>
        <div className="breakdown-empty-content">
          <Calculator size={32} className="empty-icon" />
          <p>Ingresa un volumen válido para ver la explicación matemática detallada.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="math-breakdown"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <button
        className="breakdown-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="breakdown-title">
          <BookOpen size={20} />
          <h3>Explicación Matemática Paso a Paso</h3>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="breakdown-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {mode === 'cylinder' ? (
              <CylinderBreakdown volume={volume} results={results} formatNumber={formatNumber} />
            ) : (
              <BoxBreakdown volume={volume} results={results} formatNumber={formatNumber} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface BreakdownProps {
  volume: number;
  results: {
    optimalRadius?: number;
    optimalWidth?: number;
    optimalHeight: number;
    surfaceArea: number;
  };
  formatNumber: (num: number) => string;
}

function CylinderBreakdown({ volume, results, formatNumber }: BreakdownProps) {
  return (
    <div className="breakdown-steps">
      {/* Paso 1: Problema */}
      <div className="step">
        <div className="step-number">1</div>
        <div className="step-content">
          <h4>Definición del Problema</h4>
          <p>
            Queremos minimizar el área superficial de un cilindro con volumen fijo{' '}
            <Math tex={`V = ${volume}\\text{ cm}^3`} />.
          </p>
          <div className="formula-box">
            <span className="formula-label">Área Superficial:</span>
            <Math tex="A = 2\pi r^2 + 2\pi rh" display />
            <span className="formula-label">Restricción (Volumen):</span>
            <Math tex="V = \pi r^2 h" display />
          </div>
        </div>
      </div>

      {/* Paso 2: Sustitución */}
      <div className="step">
        <div className="step-number">2</div>
        <div className="step-content">
          <h4>Expresar h en términos de r</h4>
          <p>
            Despejamos <Math tex="h" /> de la ecuación de volumen:
          </p>
          <div className="formula-box">
            <Math tex={`h = \\frac{V}{\\pi r^2} = \\frac{${volume}}{\\pi r^2}`} display />
          </div>
        </div>
      </div>

      {/* Paso 3: Función de una variable */}
      <div className="step">
        <div className="step-number">3</div>
        <div className="step-content">
          <h4>Función de Área en una variable</h4>
          <p>Sustituimos en la función de área:</p>
          <div className="formula-box">
            <Math tex={`A(r) = 2\\pi r^2 + 2\\pi r \\cdot \\frac{${volume}}{\\pi r^2}`} display />
            <Math tex={`A(r) = 2\\pi r^2 + \\frac{${2 * volume}}{r}`} display />
          </div>
        </div>
      </div>

      {/* Paso 4: Derivada */}
      <div className="step">
        <div className="step-number">4</div>
        <div className="step-content">
          <h4>Calcular la Derivada</h4>
          <p>Derivamos <Math tex="A(r)" /> respecto a <Math tex="r" />:</p>
          <div className="formula-box">
            <Math tex={`A'(r) = 4\\pi r - \\frac{${2 * volume}}{r^2}`} display />
          </div>
        </div>
      </div>

      {/* Paso 5: Punto crítico */}
      <div className="step">
        <div className="step-number">5</div>
        <div className="step-content">
          <h4>Encontrar Punto Crítico</h4>
          <p>Igualamos <Math tex="A'(r) = 0" /> y despejamos <Math tex="r" />:</p>
          <div className="formula-box">
            <Math tex={`4\\pi r = \\frac{${2 * volume}}{r^2}`} display />
            <Math tex={`r^3 = \\frac{${2 * volume}}{4\\pi} = \\frac{${volume}}{2\\pi}`} display />
            <Math tex={`r = \\sqrt[3]{\\frac{V}{2\\pi}} = \\sqrt[3]{\\frac{${volume}}{2\\pi}}`} display />
          </div>
          <div className="result-highlight">
            <Math tex={`r_{\\text{óptimo}} = ${formatNumber(results.optimalRadius || 0)}\\text{ cm}`} display />
          </div>
        </div>
      </div>

      {/* Paso 6: Altura óptima */}
      <div className="step">
        <div className="step-number">6</div>
        <div className="step-content">
          <h4>Calcular Altura Óptima</h4>
          <p>Sustituimos el radio óptimo en la ecuación de altura:</p>
          <div className="formula-box">
            <Math tex={`h = \\frac{${volume}}{\\pi \\cdot (${formatNumber(results.optimalRadius || 0)})^2}`} display />
          </div>
          <div className="result-highlight">
            <Math tex={`h_{\\text{óptimo}} = ${formatNumber(results.optimalHeight)}\\text{ cm}`} display />
          </div>
          <p className="verification">
            <strong>Verificación:</strong> <Math tex={`h = 2r \\Rightarrow ${formatNumber(results.optimalHeight)} \\approx 2 \\times ${formatNumber(results.optimalRadius || 0)}`} /> ✓
          </p>
        </div>
      </div>

      {/* Paso 7: Área mínima */}
      <div className="step final">
        <div className="step-number">7</div>
        <div className="step-content">
          <h4>Área Superficial Mínima</h4>
          <p>Calculamos el área con las dimensiones óptimas:</p>
          <div className="formula-box final">
            <Math tex={`A_{\\min} = 2\\pi r^2 + 2\\pi rh`} display />
            <Math tex={`A_{\\min} = 2\\pi (${formatNumber(results.optimalRadius || 0)})^2 + 2\\pi (${formatNumber(results.optimalRadius || 0)})(${formatNumber(results.optimalHeight)})`} display />
          </div>
          <div className="result-highlight final">
            <Math tex={`A_{\\min} = ${formatNumber(results.surfaceArea)}\\text{ cm}^2`} display />
          </div>
        </div>
      </div>
    </div>
  );
}

function BoxBreakdown({ volume, results, formatNumber }: BreakdownProps) {
  return (
    <div className="breakdown-steps">
      {/* Paso 1: Problema */}
      <div className="step">
        <div className="step-number">1</div>
        <div className="step-content">
          <h4>Definición del Problema</h4>
          <p>
            Queremos minimizar el área superficial de un prisma rectangular con base cuadrada 
            y volumen fijo <Math tex={`V = ${volume}\\text{ cm}^3`} />.
          </p>
          <div className="formula-box">
            <span className="formula-label">Área Superficial:</span>
            <Math tex="A = 2x^2 + 4xh" display />
            <span className="formula-label">Restricción (Volumen):</span>
            <Math tex="V = x^2 h" display />
          </div>
          <p className="note">
            Donde <Math tex="x" /> es el lado de la base cuadrada y <Math tex="h" /> es la altura.
          </p>
        </div>
      </div>

      {/* Paso 2: Sustitución */}
      <div className="step">
        <div className="step-number">2</div>
        <div className="step-content">
          <h4>Expresar h en términos de x</h4>
          <p>
            Despejamos <Math tex="h" /> de la ecuación de volumen:
          </p>
          <div className="formula-box">
            <Math tex={`h = \\frac{V}{x^2} = \\frac{${volume}}{x^2}`} display />
          </div>
        </div>
      </div>

      {/* Paso 3: Función de una variable */}
      <div className="step">
        <div className="step-number">3</div>
        <div className="step-content">
          <h4>Función de Área en una variable</h4>
          <p>Sustituimos en la función de área:</p>
          <div className="formula-box">
            <Math tex={`A(x) = 2x^2 + 4x \\cdot \\frac{${volume}}{x^2}`} display />
            <Math tex={`A(x) = 2x^2 + \\frac{${4 * volume}}{x}`} display />
          </div>
        </div>
      </div>

      {/* Paso 4: Derivada */}
      <div className="step">
        <div className="step-number">4</div>
        <div className="step-content">
          <h4>Calcular la Derivada</h4>
          <p>Derivamos <Math tex="A(x)" /> respecto a <Math tex="x" />:</p>
          <div className="formula-box">
            <Math tex={`A'(x) = 4x - \\frac{${4 * volume}}{x^2}`} display />
          </div>
        </div>
      </div>

      {/* Paso 5: Punto crítico */}
      <div className="step">
        <div className="step-number">5</div>
        <div className="step-content">
          <h4>Encontrar Punto Crítico</h4>
          <p>Igualamos <Math tex="A'(x) = 0" /> y despejamos <Math tex="x" />:</p>
          <div className="formula-box">
            <Math tex={`4x = \\frac{${4 * volume}}{x^2}`} display />
            <Math tex={`x^3 = ${volume}`} display />
            <Math tex={`x = \\sqrt[3]{V} = \\sqrt[3]{${volume}}`} display />
          </div>
          <div className="result-highlight">
            <Math tex={`x_{\\text{óptimo}} = ${formatNumber(results.optimalWidth || 0)}\\text{ cm}`} display />
          </div>
        </div>
      </div>

      {/* Paso 6: Altura óptima */}
      <div className="step">
        <div className="step-number">6</div>
        <div className="step-content">
          <h4>Calcular Altura Óptima</h4>
          <p>Sustituimos el lado óptimo en la ecuación de altura:</p>
          <div className="formula-box">
            <Math tex={`h = \\frac{${volume}}{(${formatNumber(results.optimalWidth || 0)})^2}`} display />
          </div>
          <div className="result-highlight">
            <Math tex={`h_{\\text{óptimo}} = ${formatNumber(results.optimalHeight)}\\text{ cm}`} display />
          </div>
          <p className="verification">
            <strong>Verificación:</strong> <Math tex={`x = h \\Rightarrow ${formatNumber(results.optimalWidth || 0)} \\approx ${formatNumber(results.optimalHeight)}`} /> ✓
            <br />
            <em>¡La forma óptima es un cubo!</em>
          </p>
        </div>
      </div>

      {/* Paso 7: Área mínima */}
      <div className="step final">
        <div className="step-number">7</div>
        <div className="step-content">
          <h4>Área Superficial Mínima</h4>
          <p>Calculamos el área con las dimensiones óptimas:</p>
          <div className="formula-box final">
            <Math tex={`A_{\\min} = 2x^2 + 4xh`} display />
            <Math tex={`A_{\\min} = 2(${formatNumber(results.optimalWidth || 0)})^2 + 4(${formatNumber(results.optimalWidth || 0)})(${formatNumber(results.optimalHeight)})`} display />
          </div>
          <div className="result-highlight final">
            <Math tex={`A_{\\min} = ${formatNumber(results.surfaceArea)}\\text{ cm}^2`} display />
          </div>
        </div>
      </div>
    </div>
  );
}
