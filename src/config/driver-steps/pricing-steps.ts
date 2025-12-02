import type { DriveStep } from 'driver.js';
import { Icons } from './icons';

export const pricingSteps: DriveStep[] = [
  {
    popover: {
      title: `${Icons.CreditCard} Pricing Plans`,
      description: 'Choose the perfect plan for your needs. Upgrade anytime as you grow.',
      align: 'center',
    },
  },
  {
    element: '#pricing-plans-grid',
    popover: {
      title: `${Icons.LayoutDashboard} Compare Options`,
      description:
        'Browse our tiers. From free starter plans to enterprise solutions, we have you covered.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '.pricing-plan-features:first-child',
    popover: {
      title: `${Icons.Sparkles} What's Included`,
      description: 'Check the features list to see exactly what you get with each plan.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '.pricing-subscribe-button:first-child',
    popover: {
      title: `${Icons.Rocket} Get Started`,
      description: 'Ready to upgrade? Click to subscribe and unlock premium features instantly.',
      side: 'top',
      align: 'center',
    },
  },
];
