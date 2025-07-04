import React, { useEffect, useState, FC, ReactNode } from "react";
interface Props {
  content: ReactNode;
  pop_content: ReactNode;
  className: string;
  pop_size: Size;
}

const Tooltips: FC<Props> = ({ content, pop_content, className, pop_size }) => {
  const [hoverItem, setHoverItem] = useState<{
    x: number;
    y: number;
  } | null>(null);

  return (
    <div className={`tooltips-wrapper ${className}`}>
      <div
        className={`tooltips-content`}
        onMouseEnter={(el) => setHoverItem({ x: el.clientX, y: el.clientY })}
        onMouseMove={(el) => setHoverItem({ x: el.clientX, y: el.clientY })}
        onMouseLeave={(el) => setHoverItem(null)}
      >
        {content}
      </div>
      {hoverItem && (
        <div
          className={`tooltips-pop`}
          style={{
            left: hoverItem.x - pop_size.w / 2,
            top: hoverItem.y - pop_size.h - 10,
            width: pop_size.w,
            height: pop_size.h,
          }}
        >
          {pop_content}
        </div>
      )}
    </div>
  );
};

export default Tooltips;
