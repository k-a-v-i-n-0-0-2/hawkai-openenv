import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import getCroppedImg from '../../lib/cropImage';

interface ImageCropModalProps {
  image: string | null;
  onClose: () => void;
  onCropComplete: (croppedImage: string) => void;
}

export default function ImageCropModal({ image, onClose, onCropComplete }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      if (!image || !croppedAreaPixels) return;
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
      onClose();
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  };

  return (
    <AnimatePresence>
      {image && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 bg-theme-card border-b border-theme z-10 shadow-2xl">
            <button 
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-theme-bg/50 border border-theme text-theme-muted font-black text-xs uppercase tracking-widest hover:text-theme-main transition-colors"
            >
              Cancel
            </button>
            <h3 className="text-xl font-black tracking-tight text-theme-main italic">EDIT AVATAR</h3>
            <button 
              onClick={handleSave}
              className="px-8 py-3 rounded-2xl bg-theme-primary text-on-primary font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
            >
              Save
            </button>
          </div>
          
          {/* Cropper Container */}
          <div className="relative flex-1 group">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              classes={{
                containerClassName: "bg-black",
                cropAreaClassName: "border-4 border-theme-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.85)]",
              }}
            />
          </div>

          {/* Controls */}
          <div className="bg-theme-card p-8 pb-12 border-t border-theme z-10 space-y-8 safe-bottom shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <ZoomOut className="w-5 h-5 text-theme-muted" />
                <div className="flex-1 relative flex items-center">
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-1.5 bg-theme-bg rounded-lg appearance-none cursor-pointer accent-theme-primary"
                  />
                </div>
                <ZoomIn className="w-5 h-5 text-theme-muted" />
              </div>

              <div className="flex items-center gap-6">
                <RotateCw className="w-5 h-5 text-theme-muted" />
                <div className="flex-1 relative flex items-center">
                  <input
                    type="range"
                    value={rotation}
                    min={0}
                    max={360}
                    step={1}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full h-1.5 bg-theme-bg rounded-lg appearance-none cursor-pointer accent-theme-primary"
                  />
                </div>
                <span className="text-theme-muted text-[10px] font-black tracking-widest w-10 text-right">{rotation}°</span>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={() => setRotation(r => (r + 90) % 360)}
                className="flex items-center gap-3 bg-theme-bg/50 border border-theme px-8 py-4 rounded-2xl hover:bg-theme-primary/10 hover:border-theme-primary/20 transition-all group"
              >
                <RotateCw className="w-5 h-5 text-theme-primary group-hover:rotate-90 transition-transform duration-500" />
                <span className="text-theme-main font-black text-xs uppercase tracking-widest">Rotate 90°</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
