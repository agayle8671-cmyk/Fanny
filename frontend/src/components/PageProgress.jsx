import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const PageProgress = () => {
  const { pathname } = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(30);

    const timer1 = setTimeout(() => {
      setProgress(60);
    }, 100);

    const timer2 = setTimeout(() => {
      setProgress(85);
    }, 250);

    const timer3 = setTimeout(() => {
      setProgress(100);
    }, 450);

    const timer4 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 h-[3px] z-[9999] transition-all duration-300 ease-out pointer-events-none"
      style={{
        width: `${progress}%`,
        background: "linear-gradient(90deg, #FF2A6D 0%, #FF7B00 50%, #05D9E8 100%)",
        boxShadow: "0 0 8px rgba(255, 42, 109, 0.6), 0 0 4px rgba(5, 217, 232, 0.4)",
      }}
    />
  );
};

export const PageTransition = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="animate-page-enter">
      {children}
    </div>
  );
};
