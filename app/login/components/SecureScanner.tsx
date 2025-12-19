import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { X, Camera, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { generateSecurePDF } from '@/lib/pdfGenerator';

interface SecureScannerProps {
  onClose: () => void;
  onPDFGenerated?: (pdfBlob: Blob, fileSize: number) => void;
}

export const SecureScanner: React.FC<SecureScannerProps> = ({ onClose, onPDFGenerated }) => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfStatus, setPDFStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Capture a single photo from the camera
  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImages([...capturedImages, imageSrc]);
      }
    }
  }, [capturedImages]);

  // Remove a captured image from the batch
  const removeImage = (index: number) => {
    const updatedImages = capturedImages.filter((_, i) => i !== index);
    setCapturedImages(updatedImages);
    if (selectedIndex === index) {
      setSelectedIndex(null);
    }
  };

  // Clear all captured images
  const clearAll = () => {
    setCapturedImages([]);
    setSelectedIndex(null);
  };

  // Generate PDF from captured images
  const handleGeneratePDF = async () => {
    if (capturedImages.length === 0) {
      alert('Please capture at least one photo before generating PDF');
      return;
    }

    setIsGeneratingPDF(true);
    setPDFStatus('generating');

    try {
      const pdfBlob = await generateSecurePDF(capturedImages);
      setPDFStatus('success');

      if (onPDFGenerated) {
        onPDFGenerated(pdfBlob, pdfBlob.size);
      }

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      setPDFStatus('error');
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-navy z-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-gold/20 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera className="w-6 h-6 text-gold" />
          <h2 className="text-xl font-serif font-black text-white">Secure Document Scanner</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-lg transition-all text-slate-300 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Camera View */}
        <div className="flex-1 relative bg-black overflow-hidden">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 1280,
              height: 720,
              facingMode: 'environment'
            }}
            className="w-full h-full object-cover"
          />

          {/* Camera Guide Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-80 h-96 border-4 border-gold/40 rounded-[32px] bg-gradient-to-b from-gold/10 to-transparent" />
          </div>

          {/* Capture Button Overlay */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-gold hover:bg-yellow-400 shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95"
              title="Capture photo"
            >
              <Camera className="w-10 h-10 text-navy" />
            </button>
          </div>

          {/* Photo Count Badge */}
          <div className="absolute top-6 right-6 bg-gold text-navy px-4 py-2 rounded-full font-bold text-lg shadow-lg">
            {capturedImages.length} photo{capturedImages.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Thumbnail Strip & Controls */}
        <div className="bg-slate-900 border-t border-gold/20 p-6 space-y-4">
          {/* Thumbnails */}
          {capturedImages.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Captured Pages</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {capturedImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative flex-shrink-0 cursor-pointer transition-all ${
                      selectedIndex === idx ? 'ring-4 ring-gold rounded-lg' : 'hover:opacity-80'
                    }`}
                    onClick={() => setSelectedIndex(idx)}
                  >
                    <img
                      src={img}
                      alt={`Captured page ${idx + 1}`}
                      className="w-20 h-24 object-cover rounded-lg"
                    />
                    <div className="absolute -top-2 -right-2 bg-navy border-2 border-gold w-6 h-6 rounded-full flex items-center justify-center text-gold text-xs font-bold">
                      {idx + 1}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      className="absolute -top-2 -left-2 bg-crimson hover:bg-red-700 text-white p-1 rounded-full transition-all opacity-0 hover:opacity-100"
                      title={`Delete photo ${idx + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={clearAll}
              disabled={capturedImages.length === 0}
              className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Clear All
            </button>

            <button
              onClick={handleGeneratePDF}
              disabled={capturedImages.length === 0 || isGeneratingPDF}
              className={`flex-1 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-white ${
                pdfStatus === 'success'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : pdfStatus === 'error'
                    ? 'bg-crimson hover:bg-red-700'
                    : 'bg-gold hover:bg-yellow-400 text-navy disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isGeneratingPDF ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Encrypting...
                </>
              ) : pdfStatus === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Encrypted & Ready
                </>
              ) : pdfStatus === 'error' ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Error
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Finish & Encrypt
                </>
              )}
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-xs text-slate-400 font-medium text-center">
            {capturedImages.length === 0
              ? 'Position document in the frame and tap the gold button to capture'
              : `${capturedImages.length} page${capturedImages.length !== 1 ? 's' : ''} ready to encrypt - tap "Finish & Encrypt" to create PDF`}
          </p>

          {/* Privacy Notice */}
          <div className="bg-slate-800 border border-gold/20 rounded-lg p-3">
            <p className="text-xs text-slate-300 font-medium flex items-start gap-2">
              <span className="text-gold font-bold">🔒</span>
              <span>All photos are stored securely in your device memory. Nothing is saved to your gallery or cloud until you explicitly upload.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureScanner;
