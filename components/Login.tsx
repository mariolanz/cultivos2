
import React, { useState } from 'react';
import { useAuth } from '../context/AppProvider';
import { useNavigate } from 'react-router-dom';
import Card from './ui/Card';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = login(username, password);
    if (user) {
      navigate('/');
    } else {
      setError('Usuario o contraseña inválidos');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">Torus Ac.</h1>
            <p className="text-text-secondary mb-6">Sistema de Gestión de Cultivo</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p className="mb-4 text-center text-red-500">{error}</p>}
          <div className="mb-4">
            <label className="block text-text-secondary mb-2" htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="username"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-text-secondary mb-2" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md transition-colors"
          >
            Iniciar Sesión
          </button>
        </form>
      </Card>
    </div>
  );
};

export default Login;