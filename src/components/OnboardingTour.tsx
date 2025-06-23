import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  steps: OnboardingStep[];
}

export function OnboardingTour({ isOpen, onClose, steps }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      const element = document.querySelector(steps[currentStep].target) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Добавляем подсветку
        element.style.position = 'relative';
        element.style.zIndex = '1001';
        element.style.boxShadow = '0 0 0 4px rgba(182, 194, 252, 0.5)';
        element.style.borderRadius = '8px';
      }
    }

    return () => {
      if (targetElement) {
        targetElement.style.position = '';
        targetElement.style.zIndex = '';
        targetElement.style.boxShadow = '';
        targetElement.style.borderRadius = '';
      }
    };
  }, [currentStep, isOpen, steps, targetElement]);

  const nextStep = () => {
    if (steps[currentStep]?.action) {
      steps[currentStep].action!();
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onClose();
  };

  if (!isOpen || !steps[currentStep]) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-1000" />
      
      {/* Tour popup */}
      <div className="fixed z-1002 max-w-sm mx-4">
        <div 
          className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{
            position: 'fixed',
            top: isMobile ? '50%' : '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: isMobile ? '90vw' : '400px',
            width: '100%'
          }}
        >
          {/* Header */}
          <div 
            className="p-4 text-white relative"
            style={{ background: 'linear-gradient(135deg, #b6c2fc 0%, #afd6fa 100%)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold uppercase">{step.title}</h3>
                <div className="text-sm opacity-90 uppercase">
                  ШАГ {currentStep + 1} ИЗ {steps.length}
                </div>
              </div>
              <button
                onClick={skipTour}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="uppercase">НАЗАД</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={skipTour}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors uppercase"
                >
                  ПРОПУСТИТЬ
                </button>
                
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors uppercase"
                  style={{ backgroundColor: '#b6c2fc' }}
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>ЗАВЕРШИТЬ</span>
                    </>
                  ) : (
                    <>
                      <span>ДАЛЕЕ</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Хук для управления онбордингом
export function useOnboarding() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('planify-onboarding-seen');
    if (!seen) {
      setIsOnboardingOpen(true);
    } else {
      setHasSeenOnboarding(true);
    }
  }, []);

  const startOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const completeOnboarding = () => {
    setIsOnboardingOpen(false);
    setHasSeenOnboarding(true);
    localStorage.setItem('planify-onboarding-seen', 'true');
  };

  return {
    isOnboardingOpen,
    hasSeenOnboarding,
    startOnboarding,
    completeOnboarding,
  };
}