import type { Variants, Transition } from 'framer-motion';

// Transition configs có thể tái sử dụng
export const transitions: {
  smooth: Transition;
  spring: Transition;
  bouncy: Transition;
  slow: Transition;
  fast: Transition;
} = {
  smooth: {
    type: 'tween',
    duration: 0.3,
    ease: 'easeInOut',
  },
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  },
  slow: {
    type: 'tween',
    duration: 0.6,
    ease: 'easeInOut',
  },
  fast: {
    type: 'tween',
    duration: 0.15,
    ease: 'easeInOut',
  },
};

// Animation variants cho fade effects
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

// Animation variants cho slide effects
export const slideVariants = {
  // Slide từ trái
  slideInLeft: {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: transitions.smooth },
    exit: { x: -50, opacity: 0, transition: transitions.fast },
  },
  // Slide từ phải
  slideInRight: {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: transitions.smooth },
    exit: { x: 50, opacity: 0, transition: transitions.fast },
  },
  // Slide từ trên
  slideInTop: {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: transitions.smooth },
    exit: { y: -50, opacity: 0, transition: transitions.fast },
  },
  // Slide từ dưới
  slideInBottom: {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: transitions.smooth },
    exit: { y: 50, opacity: 0, transition: transitions.fast },
  },
} as const;

// Animation variants cho scale effects
export const scaleVariants: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: transitions.spring,
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: transitions.fast,
  },
  // Hover effect
  hover: {
    scale: 1.05,
    transition: transitions.fast,
  },
  // Tap effect
  tap: {
    scale: 0.95,
    transition: transitions.fast,
  },
};

// Animation variants cho rotate effects
export const rotateVariants: Variants = {
  hidden: {
    rotate: -10,
    opacity: 0,
  },
  visible: {
    rotate: 0,
    opacity: 1,
    transition: transitions.spring,
  },
  exit: {
    rotate: 10,
    opacity: 0,
    transition: transitions.fast,
  },
};

// Animation variants cho container (stagger children)
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      ...transitions.smooth,
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      ...transitions.fast,
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

// Animation variants cho list items
export const listItemVariants: Variants = {
  hidden: {
    y: 20,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: transitions.fast,
  },
};

// Animation variants cho modal/popup
export const modalVariants: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    y: 20,
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    y: 20,
    transition: transitions.fast,
  },
};

// Animation variants cho backdrop
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Animation variants cho button
export const buttonVariants: Variants = {
  hover: {
    scale: 1.02,
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    transition: transitions.fast,
  },
  tap: {
    scale: 0.98,
    transition: transitions.fast,
  },
};

// Animation variants cho card
export const cardVariants: Variants = {
  hidden: {
    y: 30,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.smooth,
  },
  hover: {
    y: -5,
    scale: 1.02,
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    transition: transitions.fast,
  },
};

// Animation variants cho loading spinner
export const spinnerVariants: Variants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Animation variants cho progress bar
export const progressVariants: Variants = {
  initial: { width: '0%' },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: transitions.smooth,
  }),
};

// Animation variants cho notification/toast
export const toastVariants: Variants = {
  hidden: {
    x: 300,
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    x: 300,
    opacity: 0,
    scale: 0.8,
    transition: transitions.fast,
  },
};

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  in: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
  out: {
    opacity: 0,
    x: -20,
    transition: transitions.fast,
  },
};

// Utility function để tạo delay
export const createDelayedVariants = (baseVariants: Variants, delay: number): Variants => {
  const delayedVariants: Variants = {};

  Object.keys(baseVariants).forEach(key => {
    const variant = (baseVariants as any)[key];
    if (variant && typeof variant === 'object') {
      (delayedVariants as any)[key] = {
        ...variant,
        transition: {
          ...((variant.transition as Transition | undefined) || transitions.smooth),
          delay,
        },
      } as any;
    }
  });

  return delayedVariants;
};

// Animation presets tổng hợp
export const animationPresets = {
  fade: fadeVariants,
  slideLeft: slideVariants.slideInLeft,
  slideRight: slideVariants.slideInRight,
  slideUp: slideVariants.slideInTop,
  slideDown: slideVariants.slideInBottom,
  scale: scaleVariants,
  rotate: rotateVariants,
  container: containerVariants,
  listItem: listItemVariants,
  modal: modalVariants,
  backdrop: backdropVariants,
  button: buttonVariants,
  card: cardVariants,
  spinner: spinnerVariants,
  progress: progressVariants,
  toast: toastVariants,
  page: pageVariants,
};

export default animationPresets;
