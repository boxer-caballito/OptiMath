import { motion } from 'framer-motion';
import { Cylinder, Box } from 'lucide-react';

interface ModeSelectorProps {
  mode: 'cylinder' | 'box';
  onModeChange: (mode: 'cylinder' | 'box') => void;
}

export default function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="mode-selector-container">
      <div className="mode-selector">
        <motion.div
          className="mode-selector-indicator"
          initial={false}
          animate={{
            x: mode === 'cylinder' ? 0 : '100%',
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 35,
          }}
        />
        
        <button
          className={`mode-button ${mode === 'cylinder' ? 'active' : ''}`}
          onClick={() => onModeChange('cylinder')}
        >
          <Cylinder size={20} />
          <span>Cilindro (Lata)</span>
        </button>
        
        <button
          className={`mode-button ${mode === 'box' ? 'active' : ''}`}
          onClick={() => onModeChange('box')}
        >
          <Box size={20} />
          <span>Caja (Cereal)</span>
        </button>
      </div>
    </div>
  );
}
