import { ReactNode } from 'react';
import { CheckCircle } from 'lucide-react';

interface FormPageShellProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
  success?: boolean;
  successMessage?: string;
}

export function FormPageShell({ 
  title, 
  subtitle, 
  icon, 
  children, 
  success, 
  successMessage 
}: FormPageShellProps) {
  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 anim-fade-up">
        <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-2xl p-12 text-center shadow-lg anim-pop">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800">
            {successMessage || 'Successfully Submitted!'}
          </h2>
          <p className="text-gray-600 mt-3 max-w-md mx-auto">
            We have received your request. Our team will contact you shortly. 
            Jai Jagannath! 🙏
          </p>
          <a 
            href="/" 
            className="inline-block mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark smooth-btn"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }    return (
    <div className="max-w-3xl mx-auto px-4 py-8 anim-fade-up">
      <div className="bg-white shadow-xl rounded-2xl p-6 md:p-10 border border-gray-100 anim-pop">
        <div className="flex items-center gap-3 mb-2">
          {icon && <span className="text-primary">{icon}</span>}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h1>
        </div>
        {subtitle && <p className="text-gray-500 mb-6 border-l-4 border-primary pl-4">{subtitle}</p>}
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}