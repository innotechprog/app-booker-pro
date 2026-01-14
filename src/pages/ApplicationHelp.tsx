import { useState } from "react";

const ApplicationHelp = () => {
  const [form, setForm] = useState({ name: "", email: "", cellphone: "", message: "" });
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Simple validators
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidCellphone = (cell: string) => /^(0|\+27)[6-8][0-9]{8}$/.test(cell.replace(/\s+/g, ""));

  const isFormValid =
    form.name.trim().length > 0 &&
    isValidEmail(form.email) &&
    isValidCellphone(form.cellphone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setStatus("Please fill in all required fields correctly.");
      return;
    }
    setIsSending(true);
    setStatus("Sending...");
    try {
      const res = await fetch("/api/application-help/send-application-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("Request sent successfully!");
        setForm({ name: "", email: "", cellphone: "", message: "" });
      } else {
        setStatus("Failed to send request. Please try again.");
      }
    } catch {
      setStatus("Failed to send request. Please try again.");
    }
    setIsSending(false);
  };

  return (
    <div className="max-w-lg mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6">University Application Help Request</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <div>
          <label className="block font-medium mb-1 text-black" htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="e.g. Jane Doe"
            className="w-full border rounded px-3 py-2 text-black"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-black" htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="e.g. jane@email.com"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-black" htmlFor="cellphone">Cellphone Number</label>
          <input
            id="cellphone"
            name="cellphone"
            value={form.cellphone}
            onChange={handleChange}
            required
            placeholder="e.g. 071 234 5678"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-black" htmlFor="message">Message (optional)</label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="How can we help you with your application?"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 rounded font-semibold transition-opacity ${(!isFormValid || isSending) ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isFormValid || isSending}
        >
          {isSending ? 'Sending...' : 'Send Request'}
        </button>
        {status && <div className="mt-2 text-center text-sm text-red-600">{status}</div>}
      </form>
    </div>
  );
};

export default ApplicationHelp;
