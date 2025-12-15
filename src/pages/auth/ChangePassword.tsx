import { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api/AppApi';
import getDashboardPath from '../../routes/utils/Dashboard';
import LoadingOverlay from '../../common/LoadingOverlay';

function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
    };
  };

  const passwordValidation = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!passwordValidation.isValid) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Le mot de passe ne respecte pas tous les critères de sécurité',
      });
      setIsLoading(false);
      return;
    }

    if (!passwordsMatch) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Les mots de passe ne correspondent pas',
      });
      setIsLoading(false);
      return;
    }

    try {
      await authAPI.changePassword({ password: newPassword });

      if (setUser && user) {
        const updatedUser = { ...user, mustChangePassword: false };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        toast.success('Mot de passe modifié avec succès !');

        const dashboardPath = getDashboardPath(updatedUser.role);
        navigate(dashboardPath, { replace: true });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur est survenue lors du changement de mot de passe.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 relative">
      {isLoading && <LoadingOverlay loading={true} />}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 transform transition-all duration-300 hover:shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-full">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Bienvenue !
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Pour des raisons de sécurité, veuillez changer votre mot de passe avant de continuer
          </p>

          <form onSubmit={handleChangePassword} className="space-y-5">
            {/* New Password Field */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (!touched) setTouched(true);
                  }}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                  placeholder="Entrez votre nouveau mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                  placeholder="Confirmez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {newPassword && (
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Critères requis :</p>
                <PasswordRequirement met={passwordValidation.minLength} text="Au moins 8 caractères" touched={touched} />
                <PasswordRequirement met={passwordValidation.hasUpperCase} text="Une lettre majuscule" touched={touched} />
                <PasswordRequirement met={passwordValidation.hasLowerCase} text="Une lettre minuscule" touched={touched} />
                <PasswordRequirement met={passwordValidation.hasNumber} text="Un chiffre" touched={touched} />
                <PasswordRequirement met={passwordValidation.hasSpecialChar} text="Un caractère spécial (!@#$%^&*...)" touched={touched} />
                {confirmPassword && <PasswordRequirement met={passwordsMatch} text="Les mots de passe correspondent" touched={touched} />}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!passwordValidation.isValid || !passwordsMatch || isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium
                         hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2
                         shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Changer le mot de passe'
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" />
            Vos données sont sécurisées et chiffrées
          </p>
        </div>
      </div>
    </div>
  );
}

function PasswordRequirement({ met, text, touched }: { met: boolean; text: string; touched: boolean }) {
  // Classe dynamique pour couleur et animation
  const colorClass = touched ? (met ? 'text-green-600' : 'text-red-600') : 'text-gray-500';
  const scaleClass = touched ? (met ? 'scale-110' : 'scale-90') : 'scale-90';
  const opacityClass = touched ? 'opacity-100' : 'opacity-50';

  return (
    <div
      className={`flex items-center gap-3 text-sm transition-all duration-300 ${colorClass} ${scaleClass} ${opacityClass}`}
    >
     <CheckCircle2
  className={`h-4 w-4 flex-shrink-0 ml-2 transition-all duration-300 ${colorClass} ${scaleClass} ${opacityClass}`}
/>
      <span className={`transition-colors duration-300 ${met ? 'font-medium' : ''}`}>{text}</span>
    </div>
  );
}

export default ChangePassword;
