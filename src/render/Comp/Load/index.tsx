import React, { useEffect, useState, FC } from "react";
import { RotatingLines } from "react-loader-spinner";
interface Props {}

const Loading: FC<Props> = ({}) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isVisible && (
        <div className="loading-overlay">
          <RotatingLines
            visible={true}
            width="200"
            strokeWidth="5"
            animationDuration="0.75"
            ariaLabel="rotating-lines-loading"
            strokeColor="#ccc"
          />
        </div>
      )}
    </>
  );
};

export default Loading;
