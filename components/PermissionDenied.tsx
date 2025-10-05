import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './ui/Card';

const PermissionDenied: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
        <p className="text-text-secondary mb-6">
          No tienes permiso para ver esta página. Por favor, contacta a un administrador si crees que esto es un error.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-dark transition-colors"
        >
          Volver al Panel Principal
        </button>
      </Card>
    </div>
  );
};

export default PermissionDenied;
