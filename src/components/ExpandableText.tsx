import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableTextProps {
  text: string;
  limit?: number;
  className?: string;
  lineClamp?: number;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({ 
  text, 
  limit = 80, 
  className = "text-sm text-slate-500 leading-relaxed whitespace-pre-wrap",
  lineClamp = 2
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowButton = text.length > limit;

  if (!shouldShowButton) {
    return <p className={className}>{text}</p>;
  }

  return (
    <div className="space-y-1">
      <p 
        className={`${className} ${!isExpanded ? `line-clamp-${lineClamp} overflow-hidden` : ''}`} 
        style={!isExpanded ? { 
          display: '-webkit-box', 
          WebkitLineClamp: lineClamp, 
          WebkitBoxOrient: 'vertical' 
        } : {}}
      >
        {text}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
      >
        {isExpanded ? (
          <>
            Thu gọn <ChevronUp size={14} />
          </>
        ) : (
          <>
            Xem thêm <ChevronDown size={14} />
          </>
        )}
      </button>
    </div>
  );
};
