const getDashboardPath = (role: string): string => {
    switch (role) {
      case 'rh':
        return '/manager-dashboard';
      case 'manager':
          return '/manager-dashboard';
      case 'admin':
        return '/admin-dashboard';
      case 'employee':
        return '/employe-dashboard';

      default:
        return '/';
    }
  };

  export default getDashboardPath
