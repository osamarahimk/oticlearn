
import React, { useState, useRef } from 'react';
import { GlassCard } from './GlassCard';
import { FileText, X, Camera, UploadCloud, Loader2 } from 'lucide-react';
import { CameraScanner } from './CameraScanner';

interface UploadModalProps {
  initialFile: File | null;
  onConfirm: (title: string, file: File) => void;
  onCancel: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ initialFile, onConfirm, onCancel }) => {
  const [file, setFile] = useState<File | null>(initialFile);
  const [title, setTitle] = useState(initialFile ? initialFile.name.split('.')[0] : '');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const selected = e.target.files[0];
        setFile(selected);
        setTitle(selected.name.split('.')[0]);
    }
  };

  const handleScanCapture = (capturedFile: File) => {
      setFile(capturedFile);
      setTitle("Scanned Notes " + new Date().toLocaleTimeString());
      setIsScanning(false);
  };

  if (isScanning) {
      return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-2xl h-[80vh] p-4">
                <CameraScanner onCapture={handleScanCapture} onCancel={() => setIsScanning(false)} />
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <GlassCard className="w-full max-w-md p-6 relative">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-otic-orange/10 rounded-full flex items-center justify-center mb-4">
            {file ? <FileText className="w-8 h-8 text-otic-orange" /> : <UploadCloud className="w-8 h-8 text-otic-orange" />}
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{file ? "Name Your Document" : "Add Document"}</h2>
          {file && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[200px]">
                {file.name}
              </p>
          )}
        </div>

        {!file ? (
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-otic-orange hover:bg-otic-orange/5 transition-all flex flex-col items-center gap-2 group"
                >
                    <UploadCloud className="text-gray-400 group-hover:text-otic-orange" size={32} />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Upload File</span>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.docx,.txt,.png,.jpg" onChange={handleFileSelect} />
                </button>
                <button 
                    onClick={() => setIsScanning(true)}
                    className="p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-otic-orange hover:bg-otic-orange/5 transition-all flex flex-col items-center gap-2 group"
                >
                    <Camera className="text-gray-400 group-hover:text-otic-orange" size={32} />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Scan Notes</span>
                </button>
            </div>
        ) : (
            <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Document Title
                </label>
                <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Biology Unit 1 Notes"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:outline-none focus:border-otic-orange text-gray-800 dark:text-white"
                autoFocus
                />
            </div>
            
            <div className="flex gap-3">
                <button 
                    onClick={() => setFile(null)}
                    className="px-4 py-3 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-600 dark:text-white font-medium hover:bg-gray-200 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={() => {
                        if (title.trim() && file) onConfirm(title, file);
                    }}
                    disabled={!title.trim()}
                    className="flex-1 py-3 bg-otic-orange hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 transition-all"
                >
                    Save & Open
                </button>
            </div>
            </div>
        )}
      </GlassCard>
    </div>
  );
};