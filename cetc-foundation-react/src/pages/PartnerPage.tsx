import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { partnerForm } from '../data/mockupContent';
import { partnerApi, tradeApi } from '../services/api';

type TradeOption = {
  id: number;
  name: string;
};

function PartnerPage() {
  const [form, setForm] = useState({
    org_name: '',
    contact_name: '',
    mobile: '',
    org_type: partnerForm.fields.find((field) => field.type === 'select')?.options?.[0] || '',
    email: '',
    state: '',
    district: '',
    address: '',
    expected_monthly_students: '',
    password: '',
  });
  const [trades, setTrades] = useState<TradeOption[]>([]);
  const [selectedTrades, setSelectedTrades] = useState<number[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadTrades() {
      setLoadingTrades(true);
      const response = await tradeApi.list();

      if (!mounted) return;

      if (response.success && Array.isArray(response.trades)) {
        const tradeRows = response.trades as Array<Record<string, unknown>>;
        const mapped = tradeRows
          .map((trade) => ({
            id: Number(trade.id),
            name: String(trade.name || ''),
          }))
          .filter((trade) => trade.id > 0 && trade.name);

        setTrades(mapped);
        setSelectedTrades(mapped[0] ? [mapped[0].id] : []);
      } else {
        setTrades([]);
      }

      setLoadingTrades(false);
    }

    loadTrades().catch(() => {
      if (!mounted) return;
      setLoadingTrades(false);
      setMessage({ type: 'error', text: 'Failed to load trades. Please refresh and try again.' });
    });

    return () => {
      mounted = false;
    };
  }, []);

  function updateField(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleTrade(tradeId: number) {
    setSelectedTrades((prev) =>
      prev.includes(tradeId) ? prev.filter((id) => id !== tradeId) : [...prev, tradeId]
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    if (!form.org_name || !form.contact_name || !form.mobile || !form.org_type || !form.state) {
      setMessage({ type: 'error', text: 'Please fill all required fields marked with *.' });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit Indian mobile number.' });
      return;
    }

    if (!selectedTrades.length) {
      setMessage({ type: 'error', text: 'Please select at least one trade of interest.' });
      return;
    }

    setSubmitting(true);
    const response = await partnerApi.register({
      org_name: form.org_name.trim(),
      org_type: form.org_type,
      contact_name: form.contact_name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim() || undefined,
      state: form.state.trim(),
      district: form.district.trim() || undefined,
      address: form.address.trim() || undefined,
      interested_trades: selectedTrades,
      expected_monthly_students: form.expected_monthly_students
        ? Number(form.expected_monthly_students)
        : undefined,
      password: form.password || undefined,
    });
    setSubmitting(false);

    if (response.success) {
      setMessage({ type: 'success', text: String(response.message || 'Application submitted successfully.') });
      setForm((prev) => ({
        ...prev,
        org_name: '',
        contact_name: '',
        mobile: '',
        email: '',
        state: '',
        district: '',
        address: '',
        expected_monthly_students: '',
        password: '',
      }));
      return;
    }

    setMessage({ type: 'error', text: String(response.message || 'Registration failed. Please try again.') });
  }

  return (
    <div className="page">
      <section className="page-hero">
        <div className="breadcrumb">Home &gt; <span>Become a Partner</span></div>
        <h1>{partnerForm.title}</h1>
        <p>{partnerForm.subtitle}</p>
      </section>

      <section className="section">
        <div className="partner-layout">
          <div className="partner-form">
            <div className="section-title">Partner Registration Form</div>
            <form className="form-stack" onSubmit={handleSubmit}>
              <div>
                <label>Institute / Center Name *</label>
                <input
                  className="cert-input"
                  placeholder="e.g. ABC Beauty Academy, Pune"
                  type="text"
                  value={form.org_name}
                  onChange={(e) => updateField('org_name', e.target.value)}
                />
              </div>
              <div className="form-row">
                <div>
                  <label>Contact Person *</label>
                  <input
                    className="cert-input"
                    placeholder="Full Name"
                    type="text"
                    value={form.contact_name}
                    onChange={(e) => updateField('contact_name', e.target.value)}
                  />
                </div>
                <div>
                  <label>Mobile Number *</label>
                  <input
                    className="cert-input"
                    placeholder="10-digit number"
                    type="text"
                    maxLength={10}
                    value={form.mobile}
                    onChange={(e) => updateField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                </div>
              </div>
              <div>
                <label>Institute Type *</label>
                <select
                  className="cert-input"
                  value={form.org_type}
                  onChange={(e) => updateField('org_type', e.target.value)}
                >
                  {partnerForm.fields
                    .find((field) => field.type === 'select')
                    ?.options?.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                </select>
              </div>
              <div className="form-row">
                <div>
                  <label>Email</label>
                  <input
                    className="cert-input"
                    placeholder="name@example.com"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>
                <div>
                  <label>State *</label>
                  <input
                    className="cert-input"
                    placeholder="e.g. Maharashtra"
                    type="text"
                    value={form.state}
                    onChange={(e) => updateField('state', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label>District</label>
                  <input
                    className="cert-input"
                    placeholder="e.g. Thane"
                    type="text"
                    value={form.district}
                    onChange={(e) => updateField('district', e.target.value)}
                  />
                </div>
                <div>
                  <label>Password (for partner login)</label>
                  <input
                    className="cert-input"
                    placeholder="Min 6 characters"
                    type="password"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label>Address</label>
                <input
                  className="cert-input"
                  placeholder="Institute full address"
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                />
              </div>
              <div>
                <label>Trades of Interest *</label>
                {loadingTrades ? (
                  <div className="form-note">Loading trades...</div>
                ) : (
                  <div className="trade-checks">
                    {trades.length ? (
                      trades.map((trade) => (
                        <label key={trade.id} className="check-item">
                          <input
                            type="checkbox"
                            checked={selectedTrades.includes(trade.id)}
                            onChange={() => toggleTrade(trade.id)}
                          />
                          {trade.name}
                        </label>
                      ))
                    ) : (
                      <div className="form-note">No active trades available right now.</div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label>Expected Monthly Students</label>
                <input
                  className="cert-input"
                  placeholder="e.g. 50"
                  type="number"
                  min={0}
                  value={form.expected_monthly_students}
                  onChange={(e) => updateField('expected_monthly_students', e.target.value)}
                />
              </div>
              {message && (
                <div
                  className="form-note"
                  style={{
                    color: message.type === 'success' ? '#047857' : '#b91c1c',
                    textAlign: 'left',
                    fontSize: '12px',
                  }}
                >
                  {message.text}
                </div>
              )}
              <button className="btn-primary full-width" type="submit" disabled={submitting || loadingTrades}>
                {submitting ? 'Submitting...' : partnerForm.submitLabel}
              </button>
              <div className="form-note">{partnerForm.note}</div>
            </form>
          </div>
          <div className="partner-benefits">
            <div className="section-title">Partner Benefits</div>
            <div className="benefit-list">
              {partnerForm.benefits.map((benefit) => (
                <div key={benefit.title} className="benefit-card">
                  <div className="benefit-icon">{benefit.icon}</div>
                  <div>
                    <div className="benefit-title">{benefit.title}</div>
                    <div className="benefit-text">{benefit.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PartnerPage;
