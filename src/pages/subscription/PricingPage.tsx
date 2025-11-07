import React, { useEffect, useState } from 'react';
import subscriptionPlansService from '@/services/subscriptionPlans.service';
import type { SubscriptionPlan } from '@/types/subscription';
import { formatPrice } from '@/utils/formatter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const PricingPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

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

  const onSubscribe = async (plan: SubscriptionPlan) => {
    const priceId = plan.stripePriceId || plan.id;
    setCheckoutLoading(priceId || plan.id);
    try {
      const res = await subscriptionPlansService.createCheckout(priceId);
      const url = res?.checkoutUrl;
      if (url) {
        window.open(url, '_blank');
      } else {
        alert('Checkout URL not returned by server.');
      }
    } catch (err: any) {
      console.error(err);
      alert(
        err?.message ||
          'Failed to start checkout. Backend endpoint /subscription-plans/checkout may be required.'
      );
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Pricing
          </h1>
          <p className="text-lg text-muted-foreground">Choose a plan that fits your needs.</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {plans.map(plan => (
            <Card
              key={plan.id}
              className="w-full max-w-sm p-8 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 dark:bg-gray-800/70 dark:border-gray-700"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  )}
                </div>
                <Badge
                  className={
                    plan.isActive
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                  }
                >
                  {plan.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Price */}
              <div className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {formatPrice(plan.price, plan.currency)}
                <span className="text-base font-medium text-gray-600 dark:text-gray-300 ml-2">
                  {plan.interval ? `/${plan.interval}` : ''}
                </span>
              </div>

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <ul className="mb-6 space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-600/30 dark:bg-blue-500/40" />
                      <span className="text-sm text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Subscribe Button */}
              <div className="mt-6 flex items-center justify-between">
                <Button
                  className="rounded-full px-6 py-2.5 font-semibold shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                  onClick={() => onSubscribe(plan)}
                  disabled={!!checkoutLoading}
                >
                  {checkoutLoading === (plan.stripePriceId || plan.id) ? (
                    <span className="flex items-center gap-2">Processing...</span>
                  ) : (
                    'Subscribe'
                  )}
                </Button>
                <div className="text-xs text-muted-foreground underline hover:text-blue-600 cursor-pointer">
                  {plan.limits ? 'See limits' : ''}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
