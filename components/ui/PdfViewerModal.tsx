
import React from 'react';

interface PdfViewerModalProps {
  file: {
    name: string;
    type: string;
    content: string; // base64 string
  };
  onClose: () => void;
}

const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ file, onClose }) => {
  if (!file) return null;

  const dataUri = `data:${file.type};base64,${file.content}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface rounded-lg w-full max-w-4xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-border-color flex-shrink-0">
            <h3 className="text-lg font-bold text-text-primary truncate">{file.name}</h3>
            <button onClick={onClose} className="text-2xl text-text-secondary hover:text-text-primary" aria-label="Cerrar">&times;</button>
        </header>
        <div className="flex-grow p-2 bg-gray-200">
             <object
                data={dataUri}
                type={file.type}
                className="w-full h-full border-0"
                aria-label={file.name}
            >
                <p>Tu navegador no soporta la visualización de este archivo. Puedes <a href={dataUri} download={file.name}>descargarlo aquí</a>.</p>
            </object>
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;
