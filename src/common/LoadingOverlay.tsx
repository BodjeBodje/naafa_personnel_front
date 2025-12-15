import React from "react";

interface LoadingOverlayProps {
  loading: boolean;
  setLoading?: (value: boolean) => void;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ loading, setLoading }) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-primary/50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center">
        {/* Spinner */}
        <div className="w-36 h-36 border-8 border-blue-300 border-t-transparent rounded-full animate-spin"></div>

      </div>

    </div>
  );
};

export default LoadingOverlay;
