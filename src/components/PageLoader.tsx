import { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface PageLoaderProps {
  children: React.ReactNode;
}

const PageLoader = ({ children }: PageLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">car.connect</h2>
            <p className="text-muted-foreground">Loading your perfect car experience...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PageLoader;
