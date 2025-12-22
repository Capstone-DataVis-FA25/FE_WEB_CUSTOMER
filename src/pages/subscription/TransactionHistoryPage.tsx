import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useToast from '@/hooks/useToast';
import transactionHistoryService, {
  TransactionStatus,
  type TransactionItem,
} from '@/services/transactionHistory.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const TransactionHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { showError } = useToast();
  const { t } = useTranslation();

  const limit = 10;

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await transactionHistoryService.getMyTransactions(page, limit);
      setTransactions(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err: any) {
      console.error(err);
      showError(
        t('subscription.transaction_history.failed_load_title'),
        err?.message || t('subscription.transaction_history.failed_load')
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    const statusMap: Record<TransactionStatus, { label: string; className: string }> = {
      COMPLETED: { label: t('transaction_status.completed'), className: 'bg-green-500 text-white' },
      PENDING: { label: t('transaction_status.pending'), className: 'bg-yellow-500 text-white' },
      FAILED: { label: t('transaction_status.failed'), className: 'bg-red-500 text-white' },
    };
    const s = statusMap[status] || { label: status, className: 'bg-gray-300 text-gray-800' };
    return <Badge className={s.className}>{s.label}</Badge>;
  };

  const formatPrice = (amount: number, currency: string) => {
    if (currency === 'VND') {
      return `₫${amount.toLocaleString('vi-VN')}`;
    }
    return `${currency} ${amount.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {t('subscription.transaction_history.title')}
          </h1>
          <p className="text-muted-foreground">{t('subscription.transaction_history.subtitle')}</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {!loading && transactions.length === 0 && (
          <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
            <p className="text-muted-foreground">
              {t('subscription.transaction_history.no_transactions')}
            </p>
          </Card>
        )}
        {!loading && transactions.length > 0 && (
          <>
            <div className="space-y-4">
              {transactions.map(tx => (
                <Card
                  key={tx.id}
                  className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {tx.subscriptionPlan?.name ||
                            t('subscription.transaction_history.unknown_plan')}
                        </h3>
                        {getStatusBadge(tx.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t('subscription.transaction_history.transaction_id')}:{' '}
                        <span className="font-mono text-xs">{tx.id}</span>
                      </p>
                      {tx.providerTransactionId && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {t('subscription.transaction_history.provider_id')}:{' '}
                          <span className="font-mono text-xs">{tx.providerTransactionId}</span>
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatPrice(tx.amount, tx.currency)}
                      </p>
                      {tx.provider && (
                        <p className="text-xs text-muted-foreground capitalize mt-1">
                          {t('subscription.transaction_history.via', { provider: tx.provider })}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  {t('prev_button')}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t('subscription.transaction_history.page_info', { page, totalPages, total })}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  {t('next_button')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionHistoryPage;
