import { useEffect } from 'react';

// Custom hook to set page title dynamically
export const usePageTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} - MEDI-VAULT` : 'MEDI-VAULT';
    
    // Cleanup function to restore previous title if needed
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

export default usePageTitle;