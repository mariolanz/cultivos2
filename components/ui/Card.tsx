import React, { ReactNode } from 'react';

interface CardProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-surface border border-border-color rounded-lg shadow-md p-4 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
