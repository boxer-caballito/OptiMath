import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

interface VolumeInputProps {
  volume: number | null;
  onVolumeChange: (volume: number | null) => void;
  mode: 'cylinder' | 'box';
}

export default function VolumeInput({ volume, onVolumeChange, mode }: VolumeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Permitir campo vacío
    if (inputValue === '' || inputValue === null) {
      onVolumeChange(null);
      return;
    }
    
    const value = parseFloat(inputValue);
    if (!isNaN(value) && value >= 0) {
      onVolumeChange(value);
    }
  };

  const presetVolumes = [330, 500, 1000, 2000];

  return (
    <motion.div
      className="volume-input-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <label className="volume-label">
        <Package size={20} />
        <span>Volumen del {mode === 'cylinder' ? 'Cilindro' : 'Prisma'}</span>
      </label>
      
      <div className="volume-input-wrapper">
        <input
          type="number"
          value={volume === null ? '' : volume}
          onChange={handleChange}
          min={0}
          step={10}
          className="volume-input"
          placeholder="Ingresa volumen"
        />
        <span className="volume-unit">cm³ (ml)</span>
      </div>

      <div className="volume-presets">
        {presetVolumes.map((preset) => (
          <motion.button
            key={preset}
            className={`preset-button ${volume === preset ? 'active' : ''}`}
            onClick={() => onVolumeChange(preset)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {preset} ml
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
