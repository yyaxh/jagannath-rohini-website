import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, User, Phone, Mail, FileText, Home, IndianRupee, Construction } from 'lucide-react';
import { useRazorpay } from '../lib/useRazorpay';
import { createDonation, getPublicConfig, verifyDonation, getSiteSettings, type SiteSettings } from '../lib/api';
import { FormPageShell } from '../components/FormPageShell';

const CAUSES = [
  { value: 'general', label: 'General Temple Fund' },
  { value: 'annadaan', label: 'Annadaan (Free Meal Seva)' },
  { value: 'rath_yatra', label: 'Rath Yatra Fund' },
  { value: 'seva', label: 'Nitya Seva / Puja' },
  { value: 'annaprasad', label: 'Annaprasad Booking' },
  { value: 'temple_construction', label: 'New Temple Construction Fund' },
];

export default function DonatePage() {
  const [searchParams] = useSearchParams();
  // Deep-link support: /donate?cause=temple_construction preselects the cause.
  const initialCause = CAUSES.some((c) => c.value === searchParams.get('cause'))
    ? (searchParams.get('cause') as string)
    : 'general';
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    donor_name: '',
    donor_phone: '',
    donor_email: '',
    donor_pan: '',
    address: '',
    cause: initialCause,
    amount: 501,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [smtpConfigured, setSmtpConfigured] = useState(false);

  const { loadRazorpay, isLoaded } = useRazorpay();

  useEffect(() => {
    getSiteSettings()
      .then(setSettings)
      .catch(() => setSettings(null));
    getPublicConfig()
      .then((cfg) => setSmtpConfigured(Boolean(cfg.smtp_configured)))
      .catch(() => setSmtpConfigured(false));
  }, []);

  const getRazorpayKey = async (): Promise<string> => {
    // Runtime config from backend (public key id only) — works on every host
    // without build-time env. Falls back to VITE_RAZORPAY_KEY_ID for old setups.
    try {
      const cfg = await getPublicConfig();
      if (cfg.razorpay_key_id) return cfg.razorpay_key_id;
    } catch {
      // backend unreachable — fall through to env/build var
    }
    return import.meta.env.VITE_RAZORPAY_KEY_ID || '';
  };

  const validate = () => {
    const err: Record<string, string> = {};
    if (!form.donor_name.trim()) err.donor_name = 'Name is required';
    if (!form.donor_phone.match(/^[6-9]\d{9}$/)) err.donor_phone = 'Valid 10-digit Indian mobile number required';
    if (!form.donor_email.match(/^\S+@\S+\.\S+$/)) err.donor_email = 'Valid email required';
    if (form.donor_pan && !form.donor_pan.match(/^[A-Z]{5}[0-9]{4}[A-Z]$/)) {
      err.donor_pan = 'Valid PAN (e.g. ABCDE1234F)';
    }
    if (form.amount < 1) err.amount = 'Amount must be at least ₹1';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!isLoaded) {
      alert('Payment gateway is loading. Please wait.');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create donation in backend
      const donation = await createDonation(form);
      const { id, razorpay_order_id } = donation;

      // Step 2: Load Razorpay checkout
      const rzpKey = await getRazorpayKey();
      if (!rzpKey) {
        alert('Payment provider not configured yet. Please contact the temple office.');
        setLoading(false);
        return;
      }
      const rzp = await loadRazorpay();
      const options = {
        key: rzpKey,
        amount: form.amount * 100,
        currency: 'INR',
        name: 'Jagannath Mandir Rohini',
        description: `Donation: ${CAUSES.find(c => c.value === form.cause)?.label}`,
        order_id: razorpay_order_id,
        prefill: {
          name: form.donor_name,
          email: form.donor_email,
          contact: form.donor_phone,
        },
        modal: {
          ondismiss: () => { setLoading(false); }
        },
        handler: async (response: any) => {
          try {
            await verifyDonation({
              donation_id: id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setSuccess(true);
            setLoading(false);
          } catch (err) {
            alert('Payment verified, but confirmation failed. Please contact support.');
            setLoading(false);
          }
        },
      };
      const rzpInstance = new rzp(options);
      rzpInstance.open();
    } catch (err: any) {
      alert(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <FormPageShell
        title="Donation Successful!"
        success={true}
        successMessage={
          smtpConfigured
            ? 'Thank you for your generous contribution. We have sent the receipt to your email.'
            : 'Thank you for your generous contribution. Your 80G receipt will be emailed to you shortly.'
        }
      />
    );
  }

  return (
    <FormPageShell
      title="Make a Donation"
      subtitle="Support the temple's seva activities. Your donation is eligible for 80G tax deduction."
      icon={<Heart className="w-6 h-6" />}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {settings?.under_construction && (
          <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 flex items-start gap-3">
            <Construction className="w-6 h-6 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">The temple is under construction</p>
              <p className="text-sm text-amber-800 mt-0.5">
                {settings.donate_banner || 'Please donate any amount of your choice to help complete the temple. Every contribution counts. Jai Jagannath!'}
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={form.donor_name}
              onChange={e => setForm({ ...form, donor_name: e.target.value })}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition ${errors.donor_name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Your full name"
            />
          </div>
          {errors.donor_name && <p className="text-red-500 text-sm mt-1">{errors.donor_name}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={form.donor_phone}
                onChange={e => setForm({ ...form, donor_phone: e.target.value.replace(/\D/g, '') })}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition ${errors.donor_phone ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="9876543210"
                maxLength={10}
              />
            </div>
            {errors.donor_phone && <p className="text-red-500 text-sm mt-1">{errors.donor_phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={form.donor_email}
                onChange={e => setForm({ ...form, donor_email: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition ${errors.donor_email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="you@example.com"
              />
            </div>
            {errors.donor_email && <p className="text-red-500 text-sm mt-1">{errors.donor_email}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PAN (for 80G receipt)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.donor_pan}
                onChange={e => setForm({ ...form, donor_pan: e.target.value.toUpperCase() })}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition ${errors.donor_pan ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
            </div>
            {errors.donor_pan && <p className="text-red-500 text-sm mt-1">{errors.donor_pan}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cause <span className="text-red-500">*</span>
            </label>
            <select
              value={form.cause}
              onChange={e => setForm({ ...form, cause: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
            >
              {CAUSES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <div className="relative">
            <Home className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition min-h-[80px]"
              placeholder="Your address (optional)"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (₹) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="501"
              min="1"
              step="1"
            />
          </div>
          {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          <p className="text-xs text-gray-400 mt-1">Minimum ₹1. All donations are eligible for 80G deduction.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            'Proceed to Pay'
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          You will be redirected to Razorpay for secure payment. <br />
          Your donation supports temple seva activities.
        </p>
      </form>
    </FormPageShell>
  );
}