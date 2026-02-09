import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mic, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';

export default function VoiceInput() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showResult, setShowResult] = useState(false);

  const mockPhrase = "Ho finito il latte e comprato le mele";

  const handleStartListening = () => {
    setIsListening(true);
    setTranscript('');
    setShowResult(false);

    // Simulate typing effect
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= mockPhrase.length) {
        setTranscript(mockPhrase.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsListening(false);
        setShowResult(true);
      }
    }, 80);
  };

  useEffect(() => {
    if (showResult) {
      const timer = setTimeout(() => {
        toast.success('Azione simulata eseguita!', {
          description: 'Latte rimosso dall\'inventario, Mele aggiunte',
          icon: '✅'
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showResult]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-700">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white">Input Vocale</h1>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        {/* Waveform visualization */}
        <div className="relative w-full max-w-xs h-32 mb-8 flex items-center justify-center">
          {isListening ? (
            <div className="flex items-center gap-1">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [20, 40 + Math.random() * 40, 20],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="w-2 bg-white/80 rounded-full"
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-4 bg-white/30 rounded-full"
                />
              ))}
            </div>
          )}
        </div>

        {/* Transcript */}
        <div className="w-full max-w-xs min-h-[80px] mb-8">
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/20 rounded-2xl p-4"
            >
              <p className="text-white text-center font-medium">
                "{transcript}"
                {isListening && <span className="animate-pulse">|</span>}
              </p>
            </motion.div>
          )}
        </div>

        {/* Result */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xs mb-8"
          >
            <div className="bg-white rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3 p-2 bg-red-50 rounded-xl">
                <span className="text-2xl">🥛</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1A1A1A]">Latte</p>
                  <p className="text-xs text-red-600">Rimosso dall'inventario</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-green-50 rounded-xl">
                <span className="text-2xl">🍎</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1A1A1A]">Mele</p>
                  <p className="text-xs text-green-600">Aggiunte all'inventario</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mic button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleStartListening}
          disabled={isListening}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            isListening 
              ? 'bg-red-500' 
              : 'bg-white'
          }`}
        >
          {isListening ? (
            <MicOff className="w-10 h-10 text-white" />
          ) : (
            <Mic className="w-10 h-10 text-purple-700" />
          )}
        </motion.button>
        
        <p className="text-white/80 text-sm mt-4 text-center">
          {isListening 
            ? 'Sto ascoltando...' 
            : showResult 
              ? 'Tocca per riprovare'
              : 'Tocca il microfono e parla'
          }
        </p>

        {!isListening && !showResult && (
          <p className="text-white/60 text-xs mt-2 text-center max-w-xs">
            Esempio: "Ho finito il latte e comprato le mele"
          </p>
        )}
      </div>
    </div>
  );
}