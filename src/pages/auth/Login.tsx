import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, Mail, Lock, Users, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api/AppApi';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login({
        login: email.trim(),
        password: password
      });

      if (response.data && response.data.token) {
        const success = await authLogin(email, password);

        if (!success) {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Erreur lors de la connexion',
            timer: 3000,
            showConfirmButton: false
          });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Réponse invalide du serveur',
          timer: 3000,
          showConfirmButton: false
        });
      }
    } catch (err: any) {
      let errorMessage = 'Une erreur inattendue s\'est produite';

      if (err.response) {
        if (err.response.status === 403) {
          const apiMessage = err.response.data?.message || 'Accès refusé.';
          Swal.fire({
            icon: 'warning',
            title: 'Accès refusé',
            text: apiMessage,
            confirmButtonText: 'OK',
            confirmButtonColor: '#3B82F6',
          });
          setIsLoading(false);
          return;
        }

        switch (err.response.status) {
          case 401:
            errorMessage = 'Email et/ou Mot de passe incorrect';
            break;
          case 422:
            errorMessage = 'Données invalides. Vérifiez vos informations.';
            break;
          case 429:
            errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
            break;
          case 500:
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            break;
          default:
            errorMessage = 'Une erreur est survenue lors de la connexion';
        }
      } else if (err.request) {
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
      }

      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: errorMessage,
        timer: 3000,
        showConfirmButton: false
      });

      console.error('Erreur de connexion:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Bulles animées */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 opacity-20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-cyan-200 opacity-20 rounded-full blur-3xl animate-pulse"></div>

      <div className="w-full max-w-6xl flex bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* === PANNEAU GAUCHE - NAFA (conservé avec animations) === */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-cyan-600 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 animate-float"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>

          <div className="relative z-10 animate-slideInLeft">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg transform group hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-white">NAFA</h1>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Gestion du Personnel
            </h2>
            <p className="text-blue-100 text-lg">
              Plateforme complète de suivi des présences, congés et permissions
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            {/* Carte 1 */}
            <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-xl p-4 border border-white border-opacity-30 hover:bg-opacity-15 transition-all duration-300 transform hover:translate-x-2 cursor-default group">
              <h3 className="text-white font-semibold mb-2 flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3 group-hover:bg-opacity-50 transition-all transform group-hover:scale-110">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                Suivi en temps réel
              </h3>
              <p className="text-blue-100 text-sm ml-11">Contrôlez les présences instantanément</p>
            </div>

            {/* Carte 2 */}
            <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-xl p-4 border border-white border-opacity-30 hover:bg-opacity-15 transition-all duration-300 transform hover:translate-x-2 cursor-default group">
              <h3 className="text-white font-semibold mb-2 flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3 group-hover:bg-opacity-50 transition-all transform group-hover:scale-110">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                Gestion simplifiée
              </h3>
              <p className="text-blue-100 text-sm ml-11">Demandes et validations automatisées</p>
            </div>
          </div>
        </div>

        {/* === PANNEAU DROIT - FORMULAIRE (100% comme LoginForm) === */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">NAFA</h1>
          </div>

          <div className="max-w-md mx-auto">
            {/* Icône animée */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-full">
                  <LogIn className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
              Connexion
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Connectez-vous à votre compte
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="vous@exemple.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="Entrez votre mot de passe"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Mot de passe oublié */}
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  disabled={isLoading}
                >
                  Mot de passe oublié?
                </button>
              </div>

              {/* Bouton Connexion */}
              <button
                type="submit"
                disabled={!email || !password || isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium
                          hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                          shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            {/* Sécurité */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                Vos données sont sécurisées et chiffrées
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;