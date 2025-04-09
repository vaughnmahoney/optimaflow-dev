
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ReportResultsProps {
  children: React.ReactNode;
  className?: string;
}

// Animation variants for the container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1
    }
  }
};

// Animation variants for each child element
const childVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4
    }
  }
};

export const ReportResults: React.FC<ReportResultsProps> = ({
  children,
  className
}) => {
  // Convert children to array to iterate and apply animations
  const childrenArray = React.Children.toArray(children);
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("space-y-6", className)}
    >
      {childrenArray.map((child, index) => (
        <motion.div key={index} variants={childVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
