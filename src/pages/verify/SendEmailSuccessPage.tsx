import { MdEmail, MdCheckCircle, MdOpenInNew } from 'react-icons/md';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { SlideInDown } from '@/theme/animation';

const EmailConfirmation = () => {
  const handleOpenGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  const handleResendEmail = () => {
    // Logic để gửi lại email
    console.log('Resending email...');
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <SlideInDown>
          <Card className="overflow-hidden bg-primary shadow-2xl border-0">
            {/* Header with gradient */}
            <div className="bg-accent px-8 py-12 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ">
                {/* <MdEmail className="w-10 h-10 text-accent" /> */}
                <img
                  src="https://res.cloudinary.com/dfvy81evi/image/upload/v1754886570/circle_logo_uresgo.png"
                  className="p-2"
                />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Email Đã Được Gửi!</h1>
              <p className="text-blue-100 text-sm">Vui lòng kiểm tra hộp thư của bạn</p>
            </div>

            {/* Content */}
            <CardContent className="px-8 py-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <MdCheckCircle className="w-6 h-6 text-green-800 mr-2" />
                  <span className="text-green-800 font-semibold">Email xác nhận đã được gửi</span>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Chúng tôi đã gửi email xác nhận tài khoản đến địa chỉ email của bạn. Vui lòng kiểm
                  tra hộp thư và nhấp vào liên kết xác nhận để hoàn tất quá trình đăng ký.
                </p>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800 text-sm font-medium flex items-center justify-center gap-2">
                    <span>💡</span>
                    Mẹo: Kiểm tra cả thư mục spam nếu không thấy email
                  </p>
                </div>
              </div>

              {/* Gmail Button */}
              <Button
                onClick={handleOpenGmail}
                variant="default"
                size="lg"
                className="w-full bg-accent text-primary hover:bg-secondary hover:text-primary py-4 text-base font-semibold transition-all duration-300 transform hover:shadow-lg group"
              >
                <MdEmail className="w-5 h-5 mr-3" />
                Mở Gmail
              </Button>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-gray-500 text-xs mb-3">Không nhận được email?</p>
                  <Button
                    onClick={handleResendEmail}
                    variant="default"
                    className="text-black hover:text-accent text-sm font-medium underline"
                  >
                    Gửi lại email xác nhận
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideInDown>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-xs">© 2024 DataVis. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
