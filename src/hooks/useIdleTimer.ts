import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';

const IDLE_TIMEOUT = 300000;
const WARNING_TIME = 30000;

export const useIdleTimer = (onLogout: () => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isWarningShown, setIsWarningShown] = useState(false);

  const resetTimer = () => {
    if (isWarningShown) {
      Swal.close();
      setIsWarningShown(false);
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    warningTimeoutRef.current = setTimeout(() => {
      showWarning();
    }, IDLE_TIMEOUT - WARNING_TIME);

    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, IDLE_TIMEOUT);
  };

  const showWarning = () => {
    setIsWarningShown(true);
    let timerInterval: NodeJS.Timeout;

    Swal.fire({
      title: 'Session expirée',
      html: '<b>30</b> secondes',
      icon: 'warning',
      timer: WARNING_TIME,
      timerProgressBar: true,
      showCancelButton: true,
      confirmButtonText: 'Continuer',
      cancelButtonText: 'Deconnecter',
      allowOutsideClick: false,
      didOpen: () => {
        const content = Swal.getHtmlContainer();
        const b = content?.querySelector('b');
        timerInterval = setInterval(() => {
          const timeLeft = Math.ceil((Swal.getTimerLeft() || 0) / 1000);
          if (b) b.textContent = timeLeft.toString();
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
      setIsWarningShown(false);
      if (result.isConfirmed) {
        resetTimer();
      } else if (result.dismiss === Swal.DismissReason.timer) {
        handleLogout();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        handleLogout();
      }
    });
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Session expirée',
      text: 'Vous avez été déconnecté pour inactivité',
      icon: 'info',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    }).then(() => {
      onLogout();
    });
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, []);

  return { resetTimer };
};
