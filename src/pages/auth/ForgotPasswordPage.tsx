import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { forgotPasswordThunk } from '@/features/auth/authThunk';
import { validateEmail } from '@/utils/validation';
import { useAuth } from '@/features/auth/useAuth';
import { useToastContext } from '@/components/providers/ToastProvider';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { showSuccess, showError } = useToastContext();
  const { isLoading } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!email) {
      showError('Vui lòng nhập email');
      return;
    }

    if (!validateEmail(email)) {
      showError('Email không hợp lệ');
      return;
    }

    try {
      await dispatch(forgotPasswordThunk({ email })).unwrap();
      setIsSuccess(true);
      showSuccess('Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn reset mật khẩu');
    } catch (error: unknown) {
      showError(`Có lỗi xảy ra. Vui lòng thử lại.${error}`);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Email đã được gửi</CardTitle>
              <CardDescription>
                Chúng tôi đã gửi hướng dẫn reset mật khẩu đến email của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để reset mật khẩu. Nếu không
                thấy email, hãy kiểm tra thư mục spam.
              </p>
              <div className="flex gap-4">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/auth/signin">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại đăng nhập
                  </Link>
                </Button>
                <Button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                  className="flex-1"
                >
                  Gửi lại email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Quên mật khẩu?</CardTitle>
            <CardDescription>
              Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn reset mật khẩu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  disabled={isLoading}
                  required
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Gửi hướng dẫn reset
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link
                  to="/auth/signin"
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
