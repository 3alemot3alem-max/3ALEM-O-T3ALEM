import React, { useState, useEffect, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const ErrorBoundary: React.FC<Props> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    let message = "Une erreur est survenue. Veuillez réessayer.";
    
    try {
      const parsed = JSON.parse(error?.message || "");
      if (parsed.error && parsed.error.includes("permission")) {
        message = "Vous n'avez pas les permissions nécessaires pour effectuer cette action.";
      }
    } catch (e) {
      // Not a JSON error
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Oups !</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          Recharger la page
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
