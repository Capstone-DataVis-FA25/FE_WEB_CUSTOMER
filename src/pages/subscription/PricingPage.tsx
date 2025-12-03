import React, { useEffect, useState } from 'react';
import subscriptionPlansService from '@/services/subscriptionPlans.service';
import paymentsService from '@/services/payments.service';
import type { SubscriptionPlan } from '@/types/subscription';
import { formatPrice } from '@/utils/formatter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import useToast from '@/hooks/useToast';
import { selectUser } from '@/features/auth/authSelector';
import { useSelector } from 'react-redux';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { pricingSteps } from '@/config/driver-steps';
import { HelpCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { ModalConfirm } from '@/components/ui/modal-confirm';

const PricingPage: React.FC = () => {
  const user = useSelector(selectUser);
  const { isAuthenticated, refreshUser } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const { showError, showSuccess } = useToast();

  // Auto-show tour on first visit
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const storageKey = `hasShownPricingTour_${user.id}`;
      const hasShownTour = localStorage.getItem(storageKey);

      if (hasShownTour !== 'true') {
        const driverObj = driver({
          steps: pricingSteps,
          showProgress: true,
          showButtons: ['next', 'previous', 'close'],
          nextBtnText: 'Next →',
          prevBtnText: '← Previous',
          doneBtnText: 'Done ✓',
          popoverClass: 'driverjs-theme',
          overlayOpacity: 0.2,
        });

        setTimeout(() => {
          driverObj.drive();
          localStorage.setItem(storageKey, 'true');
        }, 1000);
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await subscriptionPlansService.getActivePlans();
        setPlans(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch plans');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const isSubscribed = (plan: SubscriptionPlan) => {
    return user?.subscriptionPlanId === plan.id;
  };

  const onSubscribe = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const confirmSubscribe = async () => {
    if (!selectedPlan) return;
    const planId = selectedPlan.id;
    setCheckoutLoading(planId);
    try {
      const baseSuccess = `${window.location.origin}/subscription/success`;
      const returnUrl = `${baseSuccess}?status=COMPLETED&planId=${encodeURIComponent(planId)}`;
      const res = await paymentsService.createCheckout(planId, returnUrl);
      const url = res?.checkoutUrl;
      if (url) {
        window.open(url, '_blank');
        showSuccess('Redirecting to payment gateway', 'Please complete the payment.');
        // Refresh user data after opening payment gateway
        await refreshUser();
        setSelectedPlan(null);
      } else {
        showError('Error', 'checkoutUrl not returned by server.');
      }
    } catch (err: any) {
      console.error(err);
      showError('Payment failed', err?.message || 'Unable to create payment session.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const startTour = () => {
    const driverObj = driver({
      steps: pricingSteps,
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Next →',
      prevBtnText: '← Previous',
      doneBtnText: 'Done ✓',
      popoverClass: 'driverjs-theme',
      overlayOpacity: 0.2,
    });
    driverObj.drive();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div id="pricing-header" className="text-center space-y-3 relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Pricing
          </h1>
          <p className="text-lg text-muted-foreground">Choose a plan that fits your needs.</p>

          {/* Start Tour Button */}
          <Button
            onClick={startTour}
            className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Start Tour
          </Button>
        </div>

        {loading && (
          <div className="py-16 text-center text-blue-500 text-lg font-medium">
            Loading plans...
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-lg p-4 bg-red-50 border border-red-200 rounded-xl shadow-md">
            <strong className="block font-semibold text-red-700 mb-1">Error</strong>
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        {!loading && plans.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-lg">
            No subscription plans found.
          </div>
        )}

        <div
          id="pricing-plans-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center"
        >
          {plans.map(plan => (
            <Card
              key={plan.id}
              className="pricing-plan-card w-full max-w-sm p-8 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 dark:bg-gray-800/70 dark:border-gray-700"
            >
              {/* Header */}
              <div className="pricing-plan-header flex justify-between items-start mb-6">
                <div className="pricing-plan-name-section">
                  <h3 className="pricing-plan-name text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p className="pricing-plan-description text-sm text-muted-foreground mt-1">
                      {plan.description}
                    </p>
                  )}
                </div>
                <Badge
                  className={`pricing-plan-badge ${
                    plan.isActive
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {plan.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Price */}
              <div className="pricing-plan-price text-4xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                <span className="pricing-plan-amount">
                  {formatPrice(plan.price, plan.currency)}
                </span>
                <span className="pricing-plan-interval text-base font-medium text-gray-600 dark:text-gray-300 ml-2">
                  {plan.interval ? `/${plan.interval}` : ''}
                </span>
              </div>

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <ul className="pricing-plan-features mb-6 space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-600/30 dark:bg-blue-500/40" />
                      <span className="text-sm text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Limits - render details if present */}
              {plan.limits && Object.keys(plan.limits).length > 0 && (
                <div className="pricing-plan-limits mb-4 text-sm text-muted-foreground">
                  <strong className="block mb-2 text-sm text-gray-700 dark:text-gray-200">
                    Limits
                  </strong>
                  <ul className="space-y-1">
                    {Object.entries(plan.limits as Record<string, any>).map(([k, v]) => {
                      const niceKey = k
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, s => s.toUpperCase());
                      let display = String(v);
                      const lower = k.toLowerCase();
                      if (typeof v === 'number') {
                        if (
                          lower.includes('size') ||
                          lower.includes('file') ||
                          lower.includes('mb')
                        ) {
                          display = `${v}MB`;
                        }
                      }
                      return (
                        <li
                          key={k}
                          className="text-sm text-muted-foreground flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-blue-600/30 dark:bg-blue-500/40" />
                          <span>{`${niceKey}: ${display}`}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Subscribe Button */}
              <div className="mt-6 flex items-center justify-between">
                <Button
                  className={`pricing-subscribe-button rounded-full px-6 py-2.5 font-semibold shadow-lg transition-all duration-300 bg-gradient-to-r ${isSubscribed(plan) ? 'from-gray-600 to-gray-700 disabled' : 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'}  hover:shadow-xl`}
                  onClick={() => onSubscribe(plan)}
                  disabled={isSubscribed(plan) || !!checkoutLoading}
                >
                  {checkoutLoading === plan.id ? (
                    <span className="flex items-center gap-2">Processing...</span>
                  ) : isSubscribed(plan) ? (
                    'Subscribed'
                  ) : (
                    'Subscribe'
                  )}
                </Button>
                <div className="text-xs text-muted-foreground cursor-default">
                  {/* Small helper text - limits are shown above when available */}
                  {plan.limits ? '' : ''}
                </div>
              </div>
            </Card>
          ))}
        </div>
        {/* Confirmation modal for subscribing */}
        <ModalConfirm
          isOpen={!!selectedPlan}
          onClose={() => !checkoutLoading && setSelectedPlan(null)}
          onConfirm={confirmSubscribe}
          loading={!!checkoutLoading}
          type="info"
          title={
            selectedPlan ? `Confirm subscription: ${selectedPlan.name}` : 'Confirm subscription'
          }
          message={
            selectedPlan
              ? `You are about to subscribe to ${selectedPlan.name} - ${formatPrice(selectedPlan.price, selectedPlan.currency)}${selectedPlan.interval ? `/${selectedPlan.interval}` : ''}.\n\n` +
                (selectedPlan.limits
                  ? 'Limits:\n' +
                    Object.entries(selectedPlan.limits as Record<string, any>)
                      .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1')}: ${v}`)
                      .join('\n')
                  : '')
              : ''
          }
          confirmText="Confirm"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
};

export default PricingPage;
