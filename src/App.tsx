import { useState, useMemo, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, GraduationCap, User, Calculator, Code, Shield, BookOpen, Mail, Maximize2 } from 'lucide-react';
import ModeSelector from './components/ModeSelector';
import VolumeInput from './components/VolumeInput';
import Scene3D from './components/Scene3D';
import ResultsPanel from './components/ResultsPanel';
import MathBreakdown from './components/MathBreakdown';
import OptiMathChat from './components/OptiMathChat';
import AdvancedViewModal from './components/AdvancedViewModal';
import './App.css';

type Mode = 'cylinder' | 'box';
type Page = 'calculator' | 'about';

interface OptimizationResults {
  optimalRadius?: number;
  optimalWidth?: number;
  optimalHeight: number;
  optimalDepth?: number;
  surfaceArea: number;
}

function App() {
  const [mode, setMode] = useState<Mode>('cylinder');
  const [volume, setVolume] = useState<number | null>(330);
  const [currentPage, setCurrentPage] = useState<Page>('calculator');
  const [showSplash, setShowSplash] = useState(true);
  const [isAdvancedViewOpen, setIsAdvancedViewOpen] = useState(false);

  // Ocultar splash después de la animación
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  // Cálculos de optimización
  const results = useMemo<OptimizationResults | null>(() => {
    // Si el volumen es null, 0 o negativo, no calcular
    if (volume === null || volume <= 0) {
      return null;
    }
    
    if (mode === 'cylinder') {
      // Cilindro: r = ∛(V / (2π)), h = 2r
      const optimalRadius = Math.pow(volume / (2 * Math.PI), 1 / 3);
      const optimalHeight = 2 * optimalRadius;
      const surfaceArea = 2 * Math.PI * Math.pow(optimalRadius, 2) + 2 * Math.PI * optimalRadius * optimalHeight;
      
      return {
        optimalRadius,
        optimalHeight,
        surfaceArea,
      };
    } else {
      // Caja con base cuadrada: x = ∛V, h = x (cubo perfecto)
      const optimalWidth = Math.pow(volume, 1 / 3);
      const optimalHeight = optimalWidth;
      const optimalDepth = optimalWidth;
      const surfaceArea = 2 * Math.pow(optimalWidth, 2) + 4 * optimalWidth * optimalHeight;
      
      return {
        optimalWidth,
        optimalHeight,
        optimalDepth,
        surfaceArea,
      };
    }
  }, [mode, volume]);

  // Dimensiones para la escena 3D
  const dimensions = useMemo(() => {
    if (!results) return null;
    
    if (mode === 'cylinder') {
      return {
        radius: results.optimalRadius || 1,
        height: results.optimalHeight,
      };
    } else {
      return {
        width: results.optimalWidth || 1,
        height: results.optimalHeight,
        depth: results.optimalDepth || 1,
      };
    }
  }, [mode, results]);

  return (
    <>
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>

      <motion.div 
        className="app"
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Background decorativo */}
        <div className="background-gradient" />
        <div className="background-noise" />
      
        {/* Header */}
        <motion.header
          className="header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: showSplash ? 0 : 1, y: showSplash ? -20 : 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="header-content">
          <div className="logo">
            <div className="logo-icon-wrapper">
              <svg viewBox="0 0 32 32" className="logo-svg">
                <defs>
                  <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1d1d1f"/>
                    <stop offset="100%" stopColor="#86868b"/>
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="15" fill="#ffffff" stroke="#e5e5e5" strokeWidth="1"/>
                <path 
                  d="M18 6 C14 6, 12 9, 12 12 L12 20 C12 23, 10 26, 6 26" 
                  fill="none" 
                  stroke="url(#headerGrad)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
                <text x="19" y="19" fontFamily="Times New Roman, serif" fontSize="7" fontStyle="italic" fill="#86868b">dx</text>
              </svg>
            </div>
            <div className="logo-text">
              <h1>Optimización de Derivadas</h1>
              <span className="subtitle">Cálculo Diferencial Aplicado</span>
            </div>
          </div>
          <nav className="header-nav">
            <button 
              className={`nav-button ${currentPage === 'calculator' ? 'active' : ''}`}
              onClick={() => setCurrentPage('calculator')}
            >
              <Calculator size={18} />
              <span>Calculadora</span>
            </button>
            <button 
              className={`nav-button ${currentPage === 'about' ? 'active' : ''}`}
              onClick={() => setCurrentPage('about')}
            >
              <User size={18} />
              <span>Sobre Mí</span>
            </button>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        {currentPage === 'calculator' ? (
          <motion.div
            key="calculator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Controles principales */}
            <motion.section
              className="controls-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <ModeSelector mode={mode} onModeChange={setMode} />
              <VolumeInput volume={volume} onVolumeChange={setVolume} mode={mode} />
            </motion.section>

            {/* Main Stage - Split View */}
            <main className="main-stage">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  className="stage-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Escena 3D */}
                  <div className="scene-wrapper">
                    <div className="scene-card">
                      <div className="scene-header">
                        <span className="scene-title">
                          {mode === 'cylinder' ? '🥫 Modelo de Lata' : '📦 Modelo de Caja'}
                        </span>
                        <div className="scene-header-actions">
                          <span className="scene-hint">Arrastra para rotar</span>
                          {dimensions && (
                            <motion.button
                              className="expand-button"
                              onClick={() => setIsAdvancedViewOpen(true)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Maximize2 size={16} />
                              <span>Expandir</span>
                            </motion.button>
                          )}
                        </div>
                      </div>
                      <Suspense fallback={<SceneLoader />}>
                        <Scene3D mode={mode} dimensions={dimensions} realDimensions={dimensions} />
                      </Suspense>
                    </div>
                  </div>

                  {/* Panel de resultados */}
                  <div className="results-wrapper">
                    <ResultsPanel mode={mode} volume={volume} results={results} />
                  </div>
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Explicación matemática */}
            <section className="breakdown-section">
              <MathBreakdown mode={mode} volume={volume} results={results} />
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <AboutSection />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>Proyecto de Cálculo Diferencial</p>
          <div className="footer-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github size={18} />
            </a>
          </div>
        </div>
      </footer>

      {/* OptiMath Chat Assistant */}
      <OptiMathChat mode={mode} volume={volume} results={results} />

      {/* Advanced View Modal */}
      <AdvancedViewModal
        isOpen={isAdvancedViewOpen}
        onClose={() => setIsAdvancedViewOpen(false)}
        mode={mode}
        dimensions={dimensions}
        volume={volume}
        surfaceArea={results?.surfaceArea ?? null}
      />
      </motion.div>
    </>
  );
}

// Componente Splash Screen
function SplashScreen() {
  return (
    <motion.div
      className="splash-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="splash-content">
        {/* Logo animado con símbolo matemático */}
        <motion.div
          className="splash-logo"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div
            className="splash-icon"
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <svg viewBox="0 0 100 100" className="splash-svg">
              {/* Integral symbol */}
              <motion.path
                d="M55 15 C45 15, 40 25, 40 35 L40 65 C40 75, 35 85, 25 85"
                fill="none"
                stroke="url(#splashGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeInOut' }}
              />
              {/* Derivative dx */}
              <motion.text
                x="58"
                y="58"
                className="splash-dx"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                dx
              </motion.text>
              <defs>
                <linearGradient id="splashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1d1d1f" />
                  <stop offset="100%" stopColor="#86868b" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </motion.div>

        {/* Texto */}
        <motion.div
          className="splash-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h1 className="splash-title">Optimización</h1>
          <motion.p
            className="splash-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.2 }}
          >
            Cálculo Diferencial Aplicado
          </motion.p>
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          className="splash-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1.5 }}
        >
          <motion.div
            className="splash-loader-bar"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1.6, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

// Componente About Section
function AboutSection() {
  const skills = [
    { icon: Code, label: 'Desarrollador Frontend', color: '#0071e3' },
    { icon: Shield, label: 'Estudiante de Ciberseguridad', color: '#34c759' },
    { icon: BookOpen, label: 'Ing. en Sistemas Computacionales', color: '#a855f7' },
    { icon: Calculator, label: 'Cálculo Diferencial', color: '#f472b6' },
  ];

  return (
    <section className="about-section">
      <div className="about-container">
        {/* Hero Card */}
        <motion.div 
          className="about-hero-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="about-photo-container">
            <div className="about-photo-wrapper">
              <img 
                src="/Perfil-image-evan.png" 
                alt="Evan Alberto Aguilar García" 
                className="about-photo" 
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
            <div className="about-photo-glow" />
          </div>
          
          <div className="about-hero-content">
            <motion.span 
              className="about-greeting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              ¡Hola! 👋 Soy
            </motion.span>
            <motion.h1 
              className="about-name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Evan Alberto
              <span className="about-name-accent">Aguilar García</span>
            </motion.h1>
            <motion.p 
              className="about-tagline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Estudiante de Ingeniería en Sistemas Computacionales
            </motion.p>
            <motion.div 
              className="about-age-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span>18 años</span>
              <span className="separator">•</span>
              <span>1er Semestre</span>
            </motion.div>
            
            <motion.div 
              className="about-social-links"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <a 
                href="https://github.com/boxer-caballito" 
                target="_blank" 
                rel="noopener noreferrer"
                className="about-social-btn"
              >
                <Github size={18} />
                <span>GitHub</span>
              </a>
              <a 
                href="mailto:evanalbertoavelar@gmail.com"
                className="about-social-btn"
              >
                <Mail size={18} />
                <span>Correo</span>
              </a>
            </motion.div>
          </div>
        </motion.div>

        {/* Skills Grid */}
        <motion.div 
          className="about-skills-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="about-section-title">Lo que hago</h2>
          <div className="about-skills-grid">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.label}
                className="about-skill-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div 
                  className="about-skill-icon" 
                  style={{ background: `linear-gradient(135deg, ${skill.color}20, ${skill.color}40)` }}
                >
                  <skill.icon size={24} style={{ color: skill.color }} />
                </div>
                <span className="about-skill-label">{skill.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Project Info */}
        <motion.div 
          className="about-project-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="about-project-header">
            <GraduationCap size={24} />
            <h2>Sobre este Proyecto</h2>
          </div>
          <p className="about-project-description">
            Este proyecto fue desarrollado para la materia de <strong>Cálculo Diferencial</strong> como 
            parte del programa de <strong>Ingeniería en Sistemas Computacionales</strong>. 
            El objetivo es demostrar la <strong>aplicación práctica de las derivadas</strong> en 
            problemas de optimización del mundo real.
          </p>
          <div className="about-project-highlights">
            <div className="about-highlight">
              <span className="highlight-number">∞</span>
              <span className="highlight-label">Derivadas Aplicadas</span>
            </div>
            <div className="about-highlight">
              <span className="highlight-number">3D</span>
              <span className="highlight-label">Visualización Interactiva</span>
            </div>
            <div className="about-highlight">
              <span className="highlight-number">AI</span>
              <span className="highlight-label">Asistente Integrado</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SceneLoader() {
  return (
    <div className="scene-loader">
      <div className="loader-spinner" />
      <span>Cargando modelo 3D...</span>
    </div>
  );
}

export default App;
