import type React from 'react';
import { FaCheckCircle, FaSignInAlt, FaArrowLeft } from 'react-icons/fa';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import useNavigation from '@/hooks/useNavigation';

interface EmailVerificationSuccessProps {
  onBackToConfirmation?: () => void;
}

const EmailVerificationSuccess: React.FC<EmailVerificationSuccessProps> = ({
  onBackToConfirmation,
}) => {
  const { goToAuth } = useNavigation();

  const handleContinueLogin = () => {
    goToAuth();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <FaCheckCircle className="text-white text-4xl" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
              Xác thực thành công!
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Tài khoản của bạn đã được xác thực thành công. Bạn có thể tiếp tục đăng nhập để sử
              dụng dịch vụ.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FaCheckCircle className="text-green-600 text-xl flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-medium">Email đã được xác thực</p>
                  <p className="text-green-600 text-sm">Tài khoản của bạn đã sẵn sàng sử dụng</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleContinueLogin}
                variant="default"
                size="lg"
                className="w-full py-3 px-6 font-semibold bg-accent text-primary hover:bg-secondary hover:text-primary shadow-lg  transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <FaSignInAlt className="text-lg" />
                <span>Tiếp tục đăng nhập</span>
              </Button>

              <Button
                onClick={onBackToConfirmation}
                variant="default"
                size="lg"
                className="w-full py-3 px-6 font-semibold text-[#204188] hover:text-[#1a3470] flex items-center justify-center space-x-2"
              >
                <FaArrowLeft className="text-sm" />
                <span>Quay lại trang xác nhận</span>
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Bạn sẽ được chuyển hướng đến trang đăng nhập
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Cần hỗ trợ?{' '}
            <a
              href="mailto:support@datavis.com"
              className="text-[#204188] hover:text-[#1a3470] font-medium hover:underline transition-colors"
            >
              Liên hệ với chúng tôi
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationSuccess;
