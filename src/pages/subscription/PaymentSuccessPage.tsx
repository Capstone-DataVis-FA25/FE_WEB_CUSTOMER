import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import LoadingSpinner from '@/components/ui/LoadingSpinner';
import useToast from '@/hooks/useToast';
import paymentsService from '@/services/payments.service';
import { PaymentStatus } from '@/types/payments';
import Routers from '@/router/routers';

interface LocalStatus {
  status: PaymentStatus;
  message: string;
}

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [webhookDone, setWebhookDone] = useState(false);
  const [localStatus, setLocalStatus] = useState<LocalStatus | null>(null);

  const providerTransactionId = searchParams.get('orderCode') || '';
  const rawStatus = (searchParams.get('status') || '').toUpperCase();

  // Map provider statuses to backend-expected enum
  const mapProviderStatusToInternal = (s: string): PaymentStatus => {
    switch (s) {
      case 'PAID':
      case 'SUCCEEDED':
      case 'SUCCESS':
      case 'COMPLETED':
        return PaymentStatus.COMPLETED;
      case 'PENDING':
      case 'PROCESSING':
        return PaymentStatus.PENDING;
      case 'CANCELED':
      case 'CANCELLED':
      case 'FAILED':
        return PaymentStatus.FAILED;
      case 'REFUNDED':
        return PaymentStatus.REFUNDED;
      default:
        return PaymentStatus.PENDING;
    }
  };

  const transactionStatus: PaymentStatus = mapProviderStatusToInternal(rawStatus);
  const planId = searchParams.get('planId') || undefined;

  useEffect(() => {
    const simulateWebhook = async () => {
      if (!providerTransactionId) {
        showError('Missing transaction ID', 'providerTransactionId not found in URL');
        return;
      }
      setLoading(true);
      try {
        const payload = {
          providerTransactionId,
          status: transactionStatus,
          metadata: { planId },
        };
        await paymentsService.sendWebhook(payload);
        setWebhookDone(true);
        setLocalStatus({ status: transactionStatus, message: 'Payment completed successfully!' });
        if (transactionStatus === PaymentStatus.COMPLETED) {
          showSuccess('Payment', 'Plan has been activated (simulated).');
        } else {
          showError('Status', `Status: ${transactionStatus}`);
        }
      } catch (err: any) {
        console.error(err);
        showError('Webhook error', err?.message || 'Unable to update status.');
        setLocalStatus({ status: PaymentStatus.FAILED, message: 'Failed to update status.' });
      } finally {
        setLoading(false);
      }
    };
    simulateWebhook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerTransactionId, transactionStatus, planId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-lg p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Payment result
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          This page simulates confirming payment via a frontend webhook (not for production use).
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Provider Transaction ID:</span>
            <Badge>{providerTransactionId || 'N/A'}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge
              className={
                localStatus?.status === PaymentStatus.COMPLETED
                  ? 'bg-green-500 text-white'
                  : localStatus?.status === PaymentStatus.FAILED
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
              }
            >
              {localStatus?.status || 'pending'}
            </Badge>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-blue-600 text-sm mb-4">
            Updating status...
          </div>
        )}

        {webhookDone && localStatus && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 mb-6">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              {localStatus.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1">
            <Link to={Routers.PRICING}>Back to Pricing</Link>
          </Button>
          <Button asChild variant="secondary" className="flex-1">
            <Link to={Routers.WORKSPACE_DATASETS}>Go to Workspace</Link>
          </Button>
        </div>
        <div className="mt-6 text-xs text-muted-foreground">
          Note: In production, the payment gateway (Stripe, PayPal, etc.) calls your backend webhook
          server-to-server.
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
