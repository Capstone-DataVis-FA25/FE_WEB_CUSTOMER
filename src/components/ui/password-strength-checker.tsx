import React, { useState, useRef } from 'react';
import { Check, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PasswordStrengthRule {
  label: string;
  isValid: boolean;
}

interface PasswordStrengthTooltipProps {
  password: string;
  isVisible: boolean;
  onToggle: () => void;
}

interface PasswordStrengthCheckerProps {
  password: string;
  className?: string;
}

export const PasswordStrengthTooltip: React.FC<PasswordStrengthTooltipProps> = ({
  password,
  isVisible,
  onToggle,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Kiểm tra các quy tắc mật khẩu mạnh
  const rules: PasswordStrengthRule[] = [
    {
      label: 'Ít nhất 6 ký tự',
      isValid: password.length >= 6,
    },
    {
      label: 'Có chữ hoa (A-Z)',
      isValid: /[A-Z]/.test(password),
    },
    {
      label: 'Có chữ thường (a-z)',
      isValid: /[a-z]/.test(password),
    },
    {
      label: 'Có số (0-9)',
      isValid: /\d/.test(password),
    },
    {
      label: 'Có ký tự đặc biệt (!@#$%^&*)',
      isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];

  // Tính độ mạnh mật khẩu
  const validRulesCount = rules.filter(rule => rule.isValid).length;
  const strengthPercentage = (validRulesCount / rules.length) * 100;

  // Xác định màu sắc và nhãn độ mạnh
  const getStrengthInfo = () => {
    if (strengthPercentage < 40) {
      return { color: 'bg-destructive', label: 'Yếu', textColor: 'text-destructive' };
    } else if (strengthPercentage < 60) {
      return { color: 'bg-yellow-500', label: 'Trung bình', textColor: 'text-yellow-500' };
    } else if (strengthPercentage < 80) {
      return { color: 'bg-secondary', label: 'Tốt', textColor: 'text-secondary' };
    } else {
      return { color: 'bg-green-500', label: 'Mạnh', textColor: 'text-green-500' };
    }
  };

  const strengthInfo = getStrengthInfo();

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-secondary transition-colors duration-200 z-10"
        title="Kiểm tra độ mạnh mật khẩu"
      >
        <Info className="h-4 w-4" />
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {isVisible && password && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute left-0 top-0 -translate-x-full -translate-y-2 w-80 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 z-50"
          >
            {/* Arrow pointing to input */}
            <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-2 h-2 bg-background border-r border-t border-border rotate-45"></div>

            <div className="space-y-3">
              {/* Header */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Độ mạnh mật khẩu</span>
                <motion.span
                  className={`text-sm font-semibold ${strengthInfo.textColor}`}
                  key={strengthInfo.label}
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {strengthInfo.label}
                </motion.span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-2 rounded-full ${strengthInfo.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${strengthPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              {/* Rules List */}
              <div className="space-y-2">
                {rules.map((rule, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-2 text-xs"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + index * 0.05, duration: 0.2 }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.1 + index * 0.05,
                        duration: 0.3,
                        type: 'spring',
                        stiffness: 200,
                      }}
                    >
                      {rule.isValid ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground" />
                      )}
                    </motion.div>
                    <span
                      className={`${
                        rule.isValid ? 'text-green-500' : 'text-muted-foreground'
                      } transition-colors duration-200`}
                    >
                      {rule.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Success Message */}
              <AnimatePresence>
                {validRulesCount === rules.length && (
                  <motion.div
                    className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800"
                    initial={{ opacity: 0, scale: 0.8, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -5 }}
                    transition={{
                      duration: 0.3,
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                    }}
                  >
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      Mật khẩu đủ mạnh!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Component wrapper để dùng như cũ trong AuthPage
export const PasswordStrengthChecker: React.FC<PasswordStrengthCheckerProps> = ({
  password,
  className = '',
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  // Auto hiển thị tooltip khi có password
  React.useEffect(() => {
    setIsTooltipVisible(password.length > 0);
  }, [password]);

  // Tự động ẩn tooltip sau 5 giây khi mật khẩu đủ mạnh
  const { isStrong } = usePasswordStrength(password);
  React.useEffect(() => {
    if (isStrong && isTooltipVisible) {
      const timer = setTimeout(() => {
        setIsTooltipVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isStrong, isTooltipVisible]);

  if (!password) return null;

  return (
    <div className={`relative ${className}`}>
      <PasswordStrengthTooltip
        password={password}
        isVisible={isTooltipVisible}
        onToggle={() => setIsTooltipVisible(!isTooltipVisible)}
      />
    </div>
  );
};

// Hook để kiểm tra mật khẩu có đủ mạnh không
export const usePasswordStrength = (password: string) => {
  const isStrong = React.useMemo(() => {
    if (password.length < 6) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/\d/.test(password)) return false;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    return true;
  }, [password]);

  const isValid = password.length >= 6; // Tối thiểu 6 ký tự

  return { isValid, isStrong };
};

export default PasswordStrengthChecker;
