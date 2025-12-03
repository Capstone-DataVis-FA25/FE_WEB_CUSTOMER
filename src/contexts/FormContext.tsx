import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface FormState {
  datasetName: string;
  description: string;
  validationErrors: {
    datasetName: {
      empty: boolean;
    };
  };
}

interface FormContextType extends FormState {
  setDatasetName: (name: string) => void;
  setDescription: (description: string) => void;
  setValidationError: (
    field: keyof FormState['validationErrors'],
    error: keyof FormState['validationErrors']['datasetName'],
    value: boolean
  ) => void;
  clearValidationErrors: () => void;
  hasValidationErrors: () => boolean;
  resetForm: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

// Initial form state
const initialFormState: FormState = {
  datasetName: '',
  description: '',
  validationErrors: {
    datasetName: {
      empty: false,
    },
  },
};

// Provider component
interface FormProviderProps {
  children: ReactNode;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [state, setState] = useState<FormState>(initialFormState);

  // Form actions - Memoized with useCallback to prevent re-renders
  const setDatasetName = useCallback((name: string) => {
    setState(prev => ({ ...prev, datasetName: name }));
  }, []);

  const setDescription = useCallback((description: string) => {
    setState(prev => ({ ...prev, description: description }));
  }, []);

  const setValidationError = useCallback(
    (
      field: keyof FormState['validationErrors'],
      error: keyof FormState['validationErrors']['datasetName'],
      value: boolean
    ) => {
      setState(prev => ({
        ...prev,
        validationErrors: {
          ...prev.validationErrors,
          [field]: {
            ...prev.validationErrors[field],
            [error]: value,
          },
        },
      }));
    },
    []
  );

  const clearValidationErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      validationErrors: {
        datasetName: {
          empty: false,
        },
      },
    }));
  }, []);

  const hasValidationErrors = useCallback((): boolean => {
    return Object.values(state.validationErrors).some(categoryErrors =>
      Object.values(categoryErrors).some(error => error === true)
    );
  }, [state.validationErrors]);

  const resetForm = useCallback(() => {
    setState(initialFormState);
  }, []);

  const contextValue: FormContextType = {
    ...state,
    setDatasetName,
    setDescription,
    setValidationError,
    clearValidationErrors,
    hasValidationErrors,
    resetForm,
  };

  return <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>;
};

// Custom hook
export const useForm = (): FormContextType => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};
