import React, { type JSX } from 'react';
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion';
import { animationPresets, transitions } from './animation.config';

// Base Motion Wrapper Component
interface MotionWrapperProps {
  children: React.ReactNode;
  animation?: keyof typeof animationPresets;
  customVariants?: any;
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  hover?: boolean;
  tap?: boolean;
}

export const MotionWrapper: React.FC<MotionWrapperProps & HTMLMotionProps<any>> = ({
  children,
  animation = 'fade',
  customVariants,
  delay = 0,
  className,
  as = 'div',
  hover = false,
  tap = false,
  ...motionProps
}) => {
  const MotionComponent = motion[as as keyof typeof motion] as any;

  const variants = customVariants || animationPresets[animation];

  // Thêm delay nếu có
  const variantsWithDelay =
    delay > 0
      ? {
          ...variants,
          visible: {
            ...variants.visible,
            transition: {
              ...variants.visible.transition,
              delay,
            },
          },
        }
      : variants;

  const motionProps_final = {
    variants: variantsWithDelay,
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    className,
    ...(hover && { whileHover: 'hover' }),
    ...(tap && { whileTap: 'tap' }),
    ...motionProps,
  };

  return <MotionComponent {...motionProps_final}>{children}</MotionComponent>;
};

// Fade Animation Component
export const FadeIn: React.FC<
  Omit<MotionWrapperProps, 'animation'> & HTMLMotionProps<any>
> = props => <MotionWrapper animation="fade" {...props} />;

// Slide Animation Components
export const SlideInLeft: React.FC<
  Omit<MotionWrapperProps, 'animation'> & HTMLMotionProps<any>
> = props => <MotionWrapper animation="slideLeft" {...props} />;

export const SlideInRight: React.FC<
  Omit<MotionWrapperProps, 'animation'> & HTMLMotionProps<any>
> = props => <MotionWrapper animation="slideRight" {...props} />;

export const SlideInUp: React.FC<
  Omit<MotionWrapperProps, 'animation'> & HTMLMotionProps<any>
> = props => <MotionWrapper animation="slideUp" {...props} />;

// Alias for SlideInUp
export const SlideUp: React.FC<Omit<MotionWrapperProps, 'animation'> & HTMLMotionProps<any>> =
  SlideInUp;

export const SlideInDown: React.FC<
  Omit<MotionWrapperProps, 'animation'> & HTMLMotionProps<any>
> = props => <MotionWrapper animation="slideDown" {...props} />;

// Scale Animation Component
export const ScaleIn: React.FC<
  Omit<MotionWrapperProps, 'animation'> & HTMLMotionProps<any>
> = props => <MotionWrapper animation="scale" hover tap {...props} />;

// Rotate Animation Component
export const RotateIn: React.FC<
  Omit<MotionWrapperProps, 'animation'> & HTMLMotionProps<any>
> = props => <MotionWrapper animation="rotate" {...props} />;

// Container với stagger animation
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  as?: keyof JSX.IntrinsicElements;
}

export const StaggerContainer: React.FC<StaggerContainerProps & HTMLMotionProps<any>> = ({
  children,
  className,
  staggerDelay = 0.1,
  as = 'div',
  ...motionProps
}) => {
  const MotionComponent = motion[as as keyof typeof motion] as any;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        ...transitions.smooth,
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <MotionComponent
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
      {...motionProps}
    >
      {children}
    </MotionComponent>
  );
};

// List Item Animation Component
export const StaggerItem: React.FC<
  Omit<MotionWrapperProps, 'animation'> & HTMLMotionProps<any>
> = props => <MotionWrapper animation="listItem" {...props} />;

// Modal Animation Component
export const ModalWrapper: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}> = ({ children, isOpen, onClose, className }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        {/* Backdrop */}
        <motion.div
          variants={animationPresets.backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
        {/* Modal Content */}
        <motion.div
          variants={animationPresets.modal}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${className || ''}`}
        >
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// Card Animation Component
export const AnimatedCard: React.FC<
  Omit<MotionWrapperProps, 'animation'> & HTMLMotionProps<any>
> = props => <MotionWrapper animation="card" hover {...props} />;

// Button Animation Component
export const AnimatedButton: React.FC<
  Omit<MotionWrapperProps, 'animation'> & HTMLMotionProps<any>
> = props => <MotionWrapper animation="button" as="button" hover tap {...props} />;

// Toast/Notification Animation Component
export const ToastWrapper: React.FC<{
  children: React.ReactNode;
  isVisible: boolean;
  className?: string;
}> = ({ children, isVisible, className }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        variants={animationPresets.toast}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

// Page Transition Component
export const PageTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <motion.div
    variants={animationPresets.page}
    initial="initial"
    animate="in"
    exit="out"
    className={className}
  >
    {children}
  </motion.div>
);

// Progress Bar Component
export const AnimatedProgress: React.FC<{
  progress: number;
  className?: string;
  barClassName?: string;
}> = ({ progress, className, barClassName }) => (
  <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${className || ''}`}>
    <motion.div
      variants={animationPresets.progress}
      initial="initial"
      animate="animate"
      custom={progress}
      className={`h-full bg-blue-500 rounded-full ${barClassName || ''}`}
    />
  </div>
);

// Utility Hook cho animations
export const useAnimationControls = () => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  const startAnimation = React.useCallback(() => {
    setIsAnimating(true);
  }, []);

  const stopAnimation = React.useCallback(() => {
    setIsAnimating(false);
  }, []);

  return { isAnimating, startAnimation, stopAnimation };
};

// Export tất cả
export * from './animation.config';
export { AnimatePresence, motion } from 'framer-motion';
