"use client";

import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function Card({ 
  children, 
  className, 
  padding = 'md',
  shadow = 'sm',
  onClick 
}: CardProps) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      className={clsx(
        // Base styles
        "bg-white rounded-lg border border-gray-200",
        
        // Padding variants
        {
          'p-0': padding === 'none',
          'p-3': padding === 'sm',
          'p-4': padding === 'md',
          'p-6': padding === 'lg',
        },
        
        // Shadow variants
        {
          'shadow-none': shadow === 'none',
          'shadow-sm': shadow === 'sm',
          'shadow-md': shadow === 'md',
          'shadow-lg': shadow === 'lg',
        },
        
        // Interactive styles if clickable
        onClick && "cursor-pointer hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        
        className
      )}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}