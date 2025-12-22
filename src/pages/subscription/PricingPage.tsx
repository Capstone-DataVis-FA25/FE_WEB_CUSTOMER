import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { HelpCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { pricingSteps } from '@/config/driver-steps/pricing-steps';
import { Link } from 'react-router-dom';
import Routers from '@/router/routers';

const PricingPage: React.FC = () => {
  const user = useSelector(selectUser);
  const { t } = useTranslation();
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
          overlayOpacity: 0,
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
        const sortedData = data.sort((a, b) => {
          const priceA = Number((a as any).price ?? 0);
          const priceB = Number((b as any).price ?? 0);
          return priceA - priceB;
        });
        setPlans(sortedData);
      } catch (err: any) {
        setError(err?.message || t('subscription.pricing.fetch_plans_failed'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const isSubscribed = (plan: SubscriptionPlan) => {
    return user?.subscriptionPlanId === plan.id;
  };

  const isLowerTierThanSubscribed = (plan: SubscriptionPlan) => {
    if (!user?.subscriptionPlanId) return false;
    const current = plans.find(p => p.id === user.subscriptionPlanId);
    if (!current) return false;
    const planPrice = Number((plan as any).price ?? 0);
    const currentPrice = Number((current as any).price ?? 0);
    return planPrice < currentPrice;
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
        showSuccess(
          t('subscription.pricing.redirecting'),
          t('subscription.pricing.complete_payment')
        );
        // Refresh user data after opening payment gateway
        await refreshUser();
        setSelectedPlan(null);
      } else {
        showError(t('subscription.pricing.error'), t('subscription.pricing.checkout_url_missing'));
      }
    } catch (err: any) {
      console.error(err);
      showError(
        t('subscription.pricing.payment_failed'),
        err?.message || t('subscription.pricing.create_session_failed')
      );
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
      overlayOpacity: 0,
    });
    driverObj.drive();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div id="pricing-header" className="text-center space-y-3 relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('subscription.pricing.title')}
          </h1>
          <p className="text-lg text-muted-foreground">{t('subscription.pricing.subtitle')}</p>

          {/* Action Buttons */}
          <div className="absolute top-0 right-0 flex gap-2">
            {isAuthenticated && (
              <Link to={Routers.TRANSACTION_HISTORY}>
                <Button
                  variant="outline"
                  className="rounded-full px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  {t('subscription.pricing.transaction_history')}
                </Button>
              </Link>
            )}
            <Button
              onClick={startTour}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              {t('subscription.pricing.start_tour')}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mx-auto max-w-lg p-4 bg-red-50 border border-red-200 rounded-xl shadow-md">
            <strong className="block font-semibold text-red-700 mb-1">
              {t('subscription.pricing.error')}
            </strong>
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        {!loading && plans.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-lg">
            {t('subscription.pricing.no_plans_found')}
          </div>
        )}

        <div
          id="pricing-plans-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center"
        >
          {plans.map(plan => {
            const isLower = isLowerTierThanSubscribed(plan);
            const subscribed = isSubscribed(plan);
            const disabledBtn = subscribed || !!checkoutLoading || isLower;
            return (
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
                    {plan.isActive
                      ? t('subscription.pricing.active')
                      : t('subscription.pricing.inactive')}
                  </Badge>
                </div>

                {/* Price */}
                <div className="pricing-plan-price text-4xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <span className="pricing-plan-amount">
                    {formatPrice(plan.price, plan.currency)}
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
                      {t('subscription.pricing.limits')}
                    </strong>
                    <ul className="space-y-1">
                      {Object.entries(plan.limits as Record<string, any>).map(([k, v]) => {
                        const niceKey = k
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, s => s.toUpperCase());
                        const lower = k.toLowerCase();
                        const label = t(`subscription.pricing.limit_criteria.${k}`, {
                          defaultValue: niceKey,
                        });

                        let display = '';
                        if (typeof v === 'number') {
                          if (
                            lower.includes('size') ||
                            lower.includes('file') ||
                            lower.includes('mb')
                          ) {
                            display = `${v}MB`;
                          } else {
                            display = new Intl.NumberFormat().format(v);
                          }
                        } else {
                          display = String(v);
                        }

                        return (
                          <li
                            key={k}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-blue-600/30 dark:bg-blue-500/40" />
                            <span>{`${label}: ${display}`}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Subscribe Button - hidden for lower-tier plans */}
                <div className="mt-6 flex items-center justify-between">
                  {isLower ? (
                    <div />
                  ) : (
                    <Button
                      className={`pricing-subscribe-button rounded-full px-6 py-2.5 font-semibold shadow-lg transition-all duration-300 bg-gradient-to-r ${subscribed ? 'from-gray-600 to-gray-700 disabled' : 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'}  hover:shadow-xl ${disabledBtn ? 'opacity-60 cursor-not-allowed' : ''}`}
                      onClick={() => onSubscribe(plan)}
                      disabled={disabledBtn}
                      aria-disabled={disabledBtn}
                      tabIndex={disabledBtn ? -1 : 0}
                    >
                      {checkoutLoading === plan.id ? (
                        <span className="flex items-center gap-2">
                          {t('subscription.pricing.processing')}
                        </span>
                      ) : subscribed ? (
                        t('subscription.pricing.subscribed')
                      ) : (
                        t('subscription.pricing.subscribe')
                      )}
                    </Button>
                  )}
                  <div className="text-xs text-muted-foreground cursor-default">
                    {plan.limits ? '' : ''}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        {/* Confirmation modal for subscribing */}
        <ModalConfirm
          isOpen={!!selectedPlan}
          onClose={() => !checkoutLoading && setSelectedPlan(null)}
          onConfirm={confirmSubscribe}
          loading={!!checkoutLoading}
          type="info"
          title={
            selectedPlan
              ? `${t('subscription.pricing.confirm_subscription')}: ${selectedPlan.name}`
              : t('subscription.pricing.confirm_subscription')
          }
          message={
            selectedPlan
              ? `You are about to subscribe to ${selectedPlan.name} - ${formatPrice(selectedPlan.price, selectedPlan.currency)}${selectedPlan.interval ? `/${selectedPlan.interval}` : ''}.\n\n` +
                (selectedPlan.limits
                  ? 'Limits:\n' +
                    Object.entries(selectedPlan.limits as Record<string, any>)
                      .map(([k, v]) => {
                        const niceKey = k
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, s => s.toUpperCase());
                        const lower = k.toLowerCase();
                        const label = t(`subscription.pricing.limits.${k}`, {
                          defaultValue: niceKey,
                        });
                        let display = '';
                        if (typeof v === 'number') {
                          if (
                            lower.includes('size') ||
                            lower.includes('file') ||
                            lower.includes('mb')
                          ) {
                            display = `${v}MB`;
                          } else {
                            display = new Intl.NumberFormat().format(v);
                          }
                        } else {
                          display = String(v);
                        }
                        return `${label}: ${display}`;
                      })
                      .join('\n')
                  : '')
              : ''
          }
          confirmText={t('subscription.pricing.confirm')}
          cancelText={t('subscription.pricing.cancel')}
        />
      </div>
    </div>
  );
};

export default PricingPage;
