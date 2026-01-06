import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface OptiMathChatProps {
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

// Configuración de Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export default function OptiMathChat({ mode, volume, results }: OptiMathChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Guardar los datos anteriores para detectar cambios
  const prevDataRef = useRef({ mode, volume, surfaceArea: results?.surfaceArea ?? 0 });
  const hasOpenedBefore = useRef(false);

  // Detectar cambios en los datos y agregar mensaje de notificación
  useEffect(() => {
    if (!results) return; // No hacer nada si no hay resultados
    
    const prevData = prevDataRef.current;
    const dataChanged = 
      prevData.mode !== mode || 
      prevData.volume !== volume || 
      Math.abs(prevData.surfaceArea - results.surfaceArea) > 0.01;
    
    // Solo notificar si ya se había abierto el chat antes y hay mensajes
    if (dataChanged && hasOpenedBefore.current && messages.length > 0) {
      const forma = mode === 'cylinder' ? 'Cilindro (Lata)' : 'Caja Rectangular';
      let nuevosResultados = '';
      
      if (mode === 'cylinder') {
        nuevosResultados = `Radio: ${results.optimalRadius?.toFixed(2)} cm, Altura: ${results.optimalHeight.toFixed(2)} cm`;
      } else {
        nuevosResultados = `Ancho: ${results.optimalWidth?.toFixed(2)} cm, Altura: ${results.optimalHeight.toFixed(2)} cm`;
      }
      
      const updateMessage = `📊 **¡Los datos han cambiado!**\n\n**Nuevos parámetros:**\n- Forma: ${forma}\n- Volumen: ${volume} ml\n- ${nuevosResultados}\n- Área superficial: ${results.surfaceArea.toFixed(2)} cm²\n\n_Puedes preguntarme sobre estos nuevos cálculos._`;
      
      setMessages(prev => [...prev, { role: 'assistant', content: updateMessage }]);
    }
    
    // Actualizar referencia
    prevDataRef.current = { mode, volume, surfaceArea: results.surfaceArea };
  }, [mode, volume, results?.surfaceArea, results?.optimalRadius, results?.optimalWidth, results?.optimalHeight]);

  // Tooltip aleatorio
  useEffect(() => {
    const showRandomTooltip = () => {
      if (!isOpen) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 3000);
      }
    };

    const interval = setInterval(showRandomTooltip, 8000);
    setTimeout(showRandomTooltip, 2000);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto-scroll al final del contenedor de mensajes
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Focus input al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // System prompt dinámico
  const getSystemPrompt = () => {
    const forma = mode === 'cylinder' ? 'cilindro (lata)' : 'caja rectangular';
    
    if (!results || volume === null || volume <= 0) {
      return `Eres OptiMath, asistente de cálculo. El usuario aún no ha ingresado un volumen válido. Pídele que ingrese un volumen mayor a 0 para poder calcular. Responde en español y sé breve.`;
    }
    
    let datosOptimos = '';
    if (mode === 'cylinder') {
      datosOptimos = `r=${results.optimalRadius?.toFixed(2)}cm, h=${results.optimalHeight.toFixed(2)}cm, A=${results.surfaceArea.toFixed(2)}cm²`;
    } else {
      datosOptimos = `x=${results.optimalWidth?.toFixed(2)}cm, h=${results.optimalHeight.toFixed(2)}cm, A=${results.surfaceArea.toFixed(2)}cm²`;
    }

    return `Eres OptiMath, asistente de cálculo. Sé BREVE y DIRECTO.

CONTEXTO: ${forma}, V=${volume}ml. Resultados: ${datosOptimos}

REGLAS ESTRICTAS:
- Respuestas CORTAS (máx 3-4 oraciones por punto)
- NO repitas información que ya diste
- NO uses introducciones largas como "¡Excelente pregunta!"
- Usa LaTeX: $inline$ y $$bloque$$
- Usa saltos de línea entre secciones
- Si explicas pasos, usa listas numeradas breves
- Responde en español

Fórmulas: Cilindro(r=∛(V/2π), h=2r) | Caja(x=∛V, h=x)`;
  };

  // Enviar mensaje a Gemini
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
      });
      
      // Construir el prompt con contexto del sistema
      const systemContext = getSystemPrompt();

      // Construir historial para contexto (filtrar mensajes para que comience con 'user')
      // Encontrar el índice del primer mensaje del usuario
      const firstUserIndex = messages.findIndex(msg => msg.role === 'user');
      
      // Solo incluir mensajes desde el primer mensaje del usuario
      const validMessages = firstUserIndex >= 0 ? messages.slice(firstUserIndex) : [];
      
      const chatHistory = validMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        history: chatHistory,
      });

      // SIEMPRE incluir contexto actualizado en cada mensaje para que la IA tenga los datos actuales
      const messageToSend = `[CONTEXTO ACTUAL: ${systemContext}]\n\nPregunta del usuario: ${userMessage}`;

      const result = await chat.sendMessage(messageToSend);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error: unknown) {
      console.error('Error al comunicarse con Gemini:', error);
      
      let errorMessage = 'Lo siento, hubo un error al procesar tu pregunta. Por favor intenta de nuevo.';
      
      if (error instanceof Error) {
        if (error.message.includes('429') || error.message.includes('quota')) {
          errorMessage = '⏳ Has excedido el límite de solicitudes. Por favor espera unos segundos e intenta de nuevo.';
        } else if (error.message.includes('API key')) {
          errorMessage = '🔑 Error con la API key. Por favor verifica que sea válida.';
        }
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Mensaje de bienvenida (se genera dinámicamente con los datos actuales)
  const getWelcomeMessage = () => {
    if (!results || volume === null || volume <= 0) {
      return `¡Hola! 👋 Soy **OptiMath**, tu asistente de cálculo.\n\n⚠️ **Aún no hay datos para calcular.**\n\nPor favor, ingresa un volumen mayor a 0 cm³ en el campo de entrada para que pueda mostrarte los resultados de optimización.\n\n_Ejemplo: Prueba con 330 ml (lata estándar) o 500 ml._`;
    }
    
    if (mode === 'cylinder') {
      return `¡Hola! 👋 Soy **OptiMath**, tu asistente de cálculo.\n\n📊 **Datos actuales:**\n- Forma: Cilindro (Lata)\n- Volumen: ${volume} ml\n- Radio óptimo: **${results.optimalRadius?.toFixed(2)} cm**\n- Altura óptima: **${results.optimalHeight.toFixed(2)} cm**\n- Área superficial: **${results.surfaceArea.toFixed(2)} cm²**\n\n¿Tienes alguna duda sobre cómo llegamos a estos resultados?`;
    } else {
      return `¡Hola! 👋 Soy **OptiMath**, tu asistente de cálculo.\n\n📊 **Datos actuales:**\n- Forma: Caja Rectangular\n- Volumen: ${volume} ml\n- Ancho/Profundidad óptimos: **${results.optimalWidth?.toFixed(2)} cm**\n- Altura óptima: **${results.optimalHeight.toFixed(2)} cm**\n- Área superficial: **${results.surfaceArea.toFixed(2)} cm²**\n\n¿Quieres que te explique por qué un cubo minimiza el material?`;
    }
  };

  return (
    <>
      {/* Botón flotante con efecto blob */}
      <div className="optimath-trigger-container">
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              className="optimath-tooltip"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <MessageSquare size={14} />
              <span>¿Necesitas ayuda?</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="optimath-trigger"
          onClick={() => {
            setIsOpen(true);
            setShowTooltip(false);
            hasOpenedBefore.current = true;
            if (messages.length === 0) {
              setMessages([{ role: 'assistant', content: getWelcomeMessage() }]);
            }
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="optimath-trigger-inner"
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Sparkles size={26} />
          </motion.div>
        </motion.button>
      </div>

      {/* Modal del chat */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop con blur */}
            <motion.div
              className="optimath-backdrop"
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.4 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Ventana de chat */}
            <motion.div
              className="optimath-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.4, 
                type: 'spring', 
                stiffness: 300, 
                damping: 30 
              }}
            >
              {/* Header */}
              <div className="optimath-header">
                <div className="optimath-header-info">
                  <div className="optimath-avatar">
                    <Sparkles size={20} />
                  </div>
                  <div className="optimath-header-text">
                    <h3>OptiMath</h3>
                    <span>Asistente de Cálculo</span>
                  </div>
                </div>
                <motion.button
                  className="optimath-close"
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Cerrar chat"
                >
                  ✕
                </motion.button>
              </div>

              {/* Mensajes */}
              <div className="optimath-messages" ref={messagesContainerRef}>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    className={`optimath-message ${message.role}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {message.role === 'assistant' && (
                      <div className="optimath-message-avatar">
                        <Sparkles size={14} />
                      </div>
                    )}
                    <div className="optimath-message-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    className="optimath-message assistant"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="optimath-message-avatar">
                      <Sparkles size={14} />
                    </div>
                    <div className="optimath-message-content loading">
                      <Loader2 className="spin" size={18} />
                      <span>Pensando...</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input */}
              <div className="optimath-input-container">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Pregunta sobre optimización..."
                  className="optimath-input"
                  disabled={isLoading}
                />
                <motion.button
                  className="optimath-send"
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={18} />
                </motion.button>
              </div>

              {/* Footer hint */}
              <div className="optimath-footer">
                <span>Powered by Gemini AI • Usa LaTeX para fórmulas</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
