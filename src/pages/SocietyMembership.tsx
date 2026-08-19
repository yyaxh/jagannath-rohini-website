import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, User, Phone, Mail, FileText, Home, Briefcase, Calendar,
  Type, HeartPulse, UserPlus, IdCard, IndianRupee, Handshake, PenLine,
} from 'lucide-react';
import { createSocietyOrder, uploadFile } from '../lib/api';
import { FormPageShell } from '../components/FormPageShell';
import { numberToIndianWords } from '../lib/utils';
import { Field, FileInput, SectionTitle, inputClass, IconTextInput } from '../components/membership/FormControls';

const MEMBERSHIP_TYPES: { value: string; label: string; amount: number }[] = [
  { value: 'partner', label: 'Partner Member', amount: 551000 },
  { value: 'founder', label: 'Founder Member (Voting Right)', amount: 111000 },
  { value: 'life', label: 'Life Member', amount: 73000 },
  { value: 'general', label: 'General Member', amount: 31000 },
  { value: 'advisor', label: 'Advisor', amount: 251000 },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const AMOUNTS: Record<string, number> = Object.fromEntries(
  MEMBERSHIP_TYPES.map((t) => [t.value, t.amount]),
);

const initialForm = {
  membership_type: 'general',
  name: '', father_husband_name: '', gotra: '', dob: '', blood_group: '',
  residence_address: '', office_address: '',
  residence_telephone: '', office_telephone: '', mobile: '', fax: '', email: '',
  pan: '', aadhaar: '', occupation_designation: '',
  introducing_member_name: '', introducing_member_mobile: '',
  place: '', member_signature: '',
};

const initialFiles: Record<string, File | null> = {
  member_photo: null, spouse_photo: null, pan_document: null, aadhaar_document: null,
};

export default function SocietyMembershipPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState(initialFiles);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const amount = AMOUNTS[form.membership_type];

  const validate = () => {
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = 'Name is required';
    if (!form.mobile.match(/^[6-9]\d{9}$/)) err.mobile = 'Valid 10-digit Indian mobile required';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) err.email = 'Valid email required';
    // PAN or Aadhaar — at least one is mandatory for ID verification.
    if (!form.pan.trim() && !form.aadhaar.trim()) {
      err.pan_aadhaar = 'Either PAN or Aadhaar number is required for ID verification';
    }
    if (!files.member_photo) err.member_photo = 'Member photo is required';
    if (!terms) err.terms = 'Please accept the declaration to proceed';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const uploadAll = async (): Promise<Record<string, string | undefined>> => {
    const result: Record<string, string | undefined> = {};
    for (const key of Object.keys(initialFiles)) {
      if (files[key]) {
        const { filename } = await uploadFile(files[key] as File);
        result[key] = filename;
      }
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const uploaded = await uploadAll();
      const payload = {
        membership_type: form.membership_type,
        name: form.name,
        father_husband_name: form.father_husband_name || undefined,
        gotra: form.gotra || undefined,
        dob: form.dob || undefined,
        blood_group: form.blood_group || undefined,
        residence_address: form.residence_address || undefined,
        office_address: form.office_address || undefined,
        residence_telephone: form.residence_telephone || undefined,
        office_telephone: form.office_telephone || undefined,
        mobile: form.mobile,
        fax: form.fax || undefined,
        email: form.email,
        pan: form.pan || undefined,
        aadhaar: form.aadhaar || undefined,
        occupation_designation: form.occupation_designation || undefined,
        introducing_member_name: form.introducing_member_name || undefined,
        introducing_member_mobile: form.introducing_member_mobile || undefined,
        member_photo: uploaded.member_photo,
        spouse_photo: uploaded.spouse_photo,
        pan_document: uploaded.pan_document,
        aadhaar_document: uploaded.aadhaar_document,
        payment_method: 'offline',
        amount_in_words: `${numberToIndianWords(amount)} Rupees Only`,
        place: form.place || undefined,
        member_signature: form.member_signature || undefined,
        terms_accepted: terms,
      };
      await createSocietyOrder(payload);
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <FormPageShell
        title="Membership Application Received"
        success={true}
        successMessage="Jai Jagannath! We have received your Society Membership application and the selected amount will be collected from you. Our committee will contact you soon."
      />
    );
  }

  return (
    <FormPageShell
      title="Society Membership Application"
      subtitle="Join the Jagannath Mandir Rohini family. Select a membership type, fill in your details — our committee will contact you to collect the membership amount."
      icon={<Users className="w-6 h-6" />}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Membership Type */}
        <section className="space-y-3">
          <SectionTitle>Membership Type</SectionTitle>
          <div className="grid gap-2">
            {MEMBERSHIP_TYPES.map((t) => (
              <label
                key={t.value}
                className={`flex items-center justify-between gap-3 border rounded-lg px-4 py-3 cursor-pointer transition ${
                  form.membership_type === t.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-gray-300 hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="membership_type"
                    value={t.value}
                    checked={form.membership_type === t.value}
                    onChange={() => set('membership_type', t.value)}
                    className="accent-primary"
                  />
                  <span className="font-medium text-gray-800">{t.label}</span>
                </div>
                <span className="font-semibold text-primary">₹{t.amount.toLocaleString('en-IN')}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Personal Details */}
        <section className="space-y-4">
          <SectionTitle>Personal Details</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <IconTextInput
  label="Name (Capital Letters)"
  required
  error={errors.name}
  icon={User}
  type="text"
  placeholder="FULL NAME"
  value={form.name}
  onChange={(e) => set('name', e.target.value.toUpperCase())}
  className={inputClass(!!errors.name)}
/>
            <IconTextInput
  label="Father / Husband Name"
  error={errors.father_husband_name}
  icon={User}
  type="text"
  placeholder="FATHER / HUSBAND NAME"
  value={form.father_husband_name}
  onChange={(e) => set('father_husband_name', e.target.value)}
  className={inputClass()}
/>
            <IconTextInput
  label="Gotra"
  error={errors.gotra}
  icon={Type}
  type="text"
  placeholder="GOTRA"
  value={form.gotra}
  onChange={(e) => set('gotra', e.target.value)}
  className={inputClass()}
/>
            <IconTextInput
  label="Date of Birth"
  error={errors.dob}
  icon={Calendar}
  type="date"
  placeholder="DATE OF BIRTH"
  value={form.dob}
  onChange={(e) => set('dob', e.target.value)}
  className={inputClass()}
/>
            <IconTextInput
  label="Blood Group"
  error={errors.blood_group}
  icon={HeartPulse}
  type="select"
  placeholder="SELECT BLOOD GROUP"
  value={form.blood_group}
  onChange={(e) => set('blood_group', e.target.value)}
  options={BLOOD_GROUPS}
  className={inputClass()}
/>
          </div>
          <IconTextInput
  label="Residence Address"
  error={errors.residence_address}
  icon={Home}
  asTextarea
  placeholder="RESIDENCE ADDRESS"
  value={form.residence_address}
  onChange={(e) => set('residence_address', e.target.value)}
  className={`${inputClass()} min-h-[70px]`
}
/>
<IconTextInput
  label="Office Address"
  error={errors.office_address}
  icon={Briefcase}
  asTextarea
  placeholder="OFFICE ADDRESS"
  value={form.office_address}
  onChange={(e) => set('office_address', e.target.value)}
  className={`${inputClass()} min-h-[70px]`
}
/>
        </section>

        {/* Contact Details */}
        <section className="space-y-4">
          <SectionTitle>Contact Details</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <IconTextInput
  label="Residence Telephone"
  error={errors.residence_telephone}
  icon={Phone}
  type="tel"
  placeholder="9876543210"
  value={form.residence_telephone}
  onChange={(e) => set('residence_telephone', e.target.value.replace(/\D/g, ''))}
  className={inputClass()}
/>
            <IconTextInput
  label="Office Telephone"
  error={errors.office_telephone}
  icon={Phone}
  type="tel"
  placeholder="9876543210"
  value={form.office_telephone}
  onChange={(e) => set('office_telephone', e.target.value.replace(/\D/g, ''))}
  className={inputClass()}
/>
            <IconTextInput
  label="Mobile Number"
  required
  error={errors.mobile}
  icon={Phone}
  type="tel"
  placeholder="9876543210"
  value={form.mobile}
  onChange={(e) => set('mobile', e.target.value.replace(/\D/g, ''))}
  className={inputClass(!!errors.mobile)}
/>
            <IconTextInput
  label="Fax"
  error={errors.fax}
  icon={Phone}
  type="text"
  placeholder="FAX"
  value={form.fax}
  onChange={(e) => set('fax', e.target.value)}
  className={inputClass()}
/>
            <IconTextInput
  label="Email"
  required
  error={errors.email}
  icon={Mail}
  type="email"
  placeholder="you@example.com"
  value={form.email}
  onChange={(e) => set('email', e.target.value)}
  className={inputClass(!!errors.email)}
/>
          </div>
        </section>

        {/* Professional Details */}
        <section className="space-y-4">
          <SectionTitle>Professional Details</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <IconTextInput
  label="Occupation & Designation"
  error={errors.occupation_designation}
  icon={Briefcase}
  type="text"
  placeholder="OCCUPATION & DESIGNATION"
  value={form.occupation_designation}
  onChange={(e) => set('occupation_designation', e.target.value)}
  className={inputClass()}
/>
          </div>
        </section>

        {/* ID Proof (PAN or Aadhaar — one required) */}
        <section className="space-y-4">
          <SectionTitle>ID Proof — PAN or Aadhaar (one required)</SectionTitle>
          <p className="text-xs text-gray-400 flex items-start gap-1">
            <IdCard className="w-4 h-4 mt-0.5 shrink-0" />
            For identity verification, please provide at least one of PAN or Aadhaar number.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <IconTextInput
  label="PAN Number"
  hint="Optional if Aadhaar is provided"
  error={errors.pan_aadhaar}
  icon={FileText}
  type="text"
  placeholder="ABCDE1234F"
  value={form.pan}
  onChange={(e) => set('pan', e.target.value.toUpperCase())}
  className={inputClass()}
/>
            <IconTextInput
  label="Aadhaar Number"
  hint="Optional if PAN is provided"
  error={errors.pan_aadhaar}
  icon={IdCard}
  type="text"
  placeholder="1234 5678 9012"
  value={form.aadhaar}
  onChange={(e) => set('aadhaar', e.target.value.replace(/[^\d]/g, '').slice(0, 12))}
  className={inputClass()}
/>
          </div>
          {errors.pan_aadhaar && (
            <p className="text-red-500 text-sm flex items-start gap-1">
              <IdCard className="w-4 h-4 mt-0.5 shrink-0" /> {errors.pan_aadhaar}
            </p>
          )}
        </section>

        {/* Introducing Member */}
        <section className="space-y-4">
          <SectionTitle>Introducing Member</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <IconTextInput
  label="Introducing Member Name"
  error={errors.introducing_member_name}
  icon={UserPlus}
  type="text"
  placeholder="INTRODUCING MEMBER NAME"
  value={form.introducing_member_name}
  onChange={(e) => set('introducing_member_name', e.target.value)}
  className={inputClass()}
/>
            <IconTextInput
  label="Introducing Member Mobile Number"
  error={errors.introducing_member_mobile}
  icon={Phone}
  type="tel"
  placeholder="9876543210"
  value={form.introducing_member_mobile}
  onChange={(e) => set('introducing_member_mobile', e.target.value.replace(/\D/g, ''))}
  className={inputClass()}
/>
          </div>
        </section>

        {/* Photos */}
        <section className="space-y-4">
          <SectionTitle>Photos</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Member Photo" required error={errors.member_photo} hint="Recent stamp-size photo (JPG/PNG)">
              <FileInput label="Member Photo" required value={files.member_photo} onChange={(f) => setFiles((p) => ({ ...p, member_photo: f }))} accept="image/*" />
              {errors.member_photo && <p className="text-red-500 text-sm mt-1">{errors.member_photo}</p>}
            </Field>
            <Field label="Spouse Photo (if applicable)">
              <FileInput label="Spouse Photo" value={files.spouse_photo} onChange={(f) => setFiles((p) => ({ ...p, spouse_photo: f }))} accept="image/*" />
            </Field>
          </div>
        </section>

        {/* Documents */}
        <section className="space-y-4">
          <SectionTitle>Documents</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="PAN Card" hint="PDF or image">
              <FileInput label="PAN Card" value={files.pan_document} onChange={(f) => setFiles((p) => ({ ...p, pan_document: f }))} accept="image/*,.pdf" />
            </Field>
            <Field label="Aadhaar Card / Voter ID" hint="PDF or image">
              <FileInput label="Aadhaar / Voter ID" value={files.aadhaar_document} onChange={(f) => setFiles((p) => ({ ...p, aadhaar_document: f }))} accept="image/*,.pdf" />
            </Field>
          </div>
          <p className="text-xs text-gray-400 flex items-start gap-1">
            <IdCard className="w-4 h-4 mt-0.5 shrink-0" />
            Your documents and photo are stored securely on our server and are only accessible to the temple committee.
          </p>
        </section>

        {/* Membership Amount */}
        <section className="space-y-4">
          <SectionTitle>Membership Amount</SectionTitle>
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-primary" />
              <span className="font-medium text-gray-700">Selected Membership Amount</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">₹{amount.toLocaleString('en-IN')}</span>
              <p className="text-xs text-gray-500">{numberToIndianWords(amount)} Rupees Only</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            No online payment is needed right now. Our committee will contact you to collect the membership amount.
          </p>
        </section>

        {/* Final */}
        <section className="space-y-4">
          <SectionTitle>Final</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <IconTextInput
  label="Place"
  error={errors.place}
  icon={Handshake}
  type="text"
  placeholder="CITY"
  value={form.place}
  onChange={(e) => set('place', e.target.value)}
  className={inputClass()}
/>
            <IconTextInput
  label="Member Signature"
  error={errors.member_signature}
  icon={PenLine}
  type="text"
  placeholder="TYPE FULL NAME"
  value={form.member_signature}
  onChange={(e) => set('member_signature', e.target.value.toUpperCase())}
  className={inputClass()}
/>
          </div>
          <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 accent-primary" />
            <span>
              I accept the terms &amp; conditions and declare that the information provided is true and correct, and
              I agree to pay the selected membership amount.
            </span>
          </label>
          {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg smooth-btn disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          By submitting you agree to our{' '}
          <Link to="/terms-conditions" className="text-primary underline">Terms &amp; Conditions</Link> and{' '}
          <Link to="/privacy-policy" className="text-primary underline">Privacy Policy</Link>.
        </p>
      </form>
    </FormPageShell>
  );
}