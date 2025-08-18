import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, Info } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { MotionWrapper } from '@/theme/animation';
import { motion } from 'framer-motion';
import { progressVariants } from '@/theme/animation/animation.config';
import { usePasswordStrength } from '@/hooks/usePasswordStrength';

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

  const { t } = useTranslation();
  // Password strength rules with i18n
  const rules: PasswordStrengthRule[] = [
    {
      label: t('password_strength_rule_minLength'),
      isValid: password.length >= 6,
    },
    {
      label: t('password_strength_rule_uppercase'),
      isValid: /[A-Z]/.test(password),
    },
    {
      label: t('password_strength_rule_lowercase'),
      isValid: /[a-z]/.test(password),
    },
    {
      label: t('password_strength_rule_number'),
      isValid: /\d/.test(password),
    },
    {
      label: t('password_strength_rule_special'),
      isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];

  // Tính độ mạnh mật khẩu
  const validRulesCount = rules.filter(rule => rule.isValid).length;
  const strengthPercentage = (validRulesCount / rules.length) * 100;

  // Strength info with i18n
  const getStrengthInfo = () => {
    if (strengthPercentage < 40) {
      return {
        color: 'bg-destructive',
        label: t('password_strength_weak'),
        textColor: 'text-destructive',
      };
    } else if (strengthPercentage < 60) {
      return {
        color: 'bg-yellow-500',
        label: t('password_strength_medium'),
        textColor: 'text-yellow-500',
      };
    } else if (strengthPercentage < 80) {
      return {
        color: 'bg-secondary',
        label: t('password_strength_good'),
        textColor: 'text-secondary',
      };
    } else {
      return {
        color: 'bg-green-500',
        label: t('password_strength_strong'),
        textColor: 'text-green-500',
      };
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
          <MotionWrapper
            animation="slideLeft"
            className="absolute left-0 top-0 -translate-x-full -translate-y-2 w-80 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 z-50"
            ref={tooltipRef}
          >
            {/* Arrow pointing to input */}
            <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-2 h-2 bg-background border-r border-t border-border rotate-45"></div>

            <div className="space-y-3">
              {/* Header */}
              <MotionWrapper animation="fade" className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">
                  {t('password_strength_title')}
                </span>
                <MotionWrapper
                  animation="fade"
                  className={`text-sm font-semibold ${strengthInfo.textColor}`}
                  key={strengthInfo.label}
                >
                  {strengthInfo.label}
                </MotionWrapper>
              </MotionWrapper>

              {/* Rules List */}
              <div className="space-y-2">
                {rules.map((rule, index) => (
                  <MotionWrapper
                    animation="fade"
                    delay={0.05 + index * 0.05}
                    key={index}
                    className="flex items-center space-x-2 text-xs"
                  >
                    <MotionWrapper animation="scale" delay={0.1 + index * 0.05}>
                      {rule.isValid ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground" />
                      )}
                    </MotionWrapper>
                    <span
                      className={`${rule.isValid ? 'text-green-500' : 'text-muted-foreground'} transition-colors duration-200`}
                    >
                      {rule.label}
                    </span>
                  </MotionWrapper>
                ))}
              </div>

              {/* Success Message */}
              <AnimatePresence>
                {validRulesCount === rules.length && (
                  <MotionWrapper
                    animation="scale"
                    className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800"
                  >
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      {t('password_strength_success')}
                    </span>
                  </MotionWrapper>
                )}
              </AnimatePresence>
            </div>
          </MotionWrapper>
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

export default PasswordStrengthChecker;
