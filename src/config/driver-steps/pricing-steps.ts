import type { DriveStep } from 'driver.js';

export const pricingSteps: DriveStep[] = [
  {
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 1.75rem;'>Welcome to Pricing! 💎</span>",
      description:
        "<p style='font-size: 1.2rem; line-height: 1.7; color: #64748b;'>Choose the perfect subscription plan for your data visualization needs. Let me guide you through our pricing options!</p>",
      side: 'over',
    },
  },
  {
    element: '#pricing-header',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600; font-size: 1.3rem;'>📋 Pricing Plans</span>",
      description:
        "<p style='color: #475569; line-height: 1.6; font-size: 1.05rem;'>Here you'll find all available subscription plans. Each plan is designed to meet different needs and usage levels.</p>",
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#pricing-plans-grid',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600; font-size: 1.3rem;'>🎯 Compare Plans</span>",
      description:
        "<p style='color: #475569; line-height: 1.6; font-size: 1.05rem;'>Browse through our subscription tiers. Each card shows complete plan information. Let's explore the details of each component!</p>",
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '.pricing-plan-card:first-child',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600; font-size: 1.3rem;'>💳 Plan Card Overview</span>",
      description:
        "<p style='color: #475569; line-height: 1.6; font-size: 1.05rem;'>This is a complete subscription plan card. Each card contains: plan name, status badge, pricing, features list, and a subscribe button. Let's explore each part in detail!</p>",
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '.pricing-plan-name:first-child',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600; font-size: 1.3rem;'>📌 Plan Name</span>",
      description:
        "<p style='color: #475569; line-height: 1.6; font-size: 1.05rem;'>This is the subscription plan name. Each plan has a unique name that reflects its tier level (e.g., Free, Basic, Pro, Enterprise).</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '.pricing-plan-badge:first-child',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600; font-size: 1.3rem;'>✅ Status Badge</span>",
      description:
        "<p style='color: #475569; line-height: 1.6; font-size: 1.05rem;'>This badge shows if the plan is currently <strong>Active</strong> (available for subscription) or <strong>Inactive</strong> (not available). Only active plans can be subscribed to.</p>",
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '.pricing-plan-amount:first-child',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600; font-size: 1.3rem;'>💰 Plan Price</span>",
      description:
        "<p style='color: #475569; line-height: 1.6; font-size: 1.05rem;'>This is the subscription price. The amount is displayed prominently with the currency symbol. Compare prices across different plans to find the best value for your needs!</p>",
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '.pricing-plan-interval:first-child',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600; font-size: 1.3rem;'>📅 Billing Interval</span>",
      description:
        "<p style='color: #475569; line-height: 1.6; font-size: 1.05rem;'>This shows how often you'll be charged (e.g., /month, /year, /quarter). The billing interval determines your payment frequency.</p>",
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '.pricing-plan-features:first-child',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600; font-size: 1.3rem;'>✨ Plan Features</span>",
      description:
        "<p style='color: #475569; line-height: 1.6; font-size: 1.05rem;'>Review all the features included in this plan:<br/>• Dataset limits<br/>• Chart creation capabilities<br/>• Export options<br/>• Support level<br/>Higher-tier plans typically include more advanced features and higher usage limits.</p>",
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '.pricing-subscribe-button:first-child',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600; font-size: 1.3rem;'>🚀 Subscribe Button</span>",
      description:
        "<p style='color: #475569; line-height: 1.6; font-size: 1.05rem;'>Click this button to subscribe to the plan. You'll be redirected to a secure payment gateway to complete your subscription. If you're already subscribed to this plan, the button will show <strong>'Subscribed'</strong> and be disabled.</p>",
      side: 'top',
      align: 'center',
    },
  },
  {
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 1.75rem;'>Ready to Subscribe! 🎉</span>",
      description:
        "<p style='font-size: 1.2rem; line-height: 1.7; color: #64748b;'>You now understand all the components of our pricing plans! Choose the plan that best fits your needs and start creating amazing visualizations. You can upgrade or downgrade anytime!</p>",
      side: 'over',
    },
  },
];
