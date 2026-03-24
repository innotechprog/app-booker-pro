import { useState } from "react";

const ApplicationHelpPage = () => {
  const [form, setForm] = useState({ name: "", email: "", cellphone: "", message: "" });
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidCellphone = (cell: string) => /^(0|\+27)[6-8][0-9]{8}$/.test(cell.replace(/\s+/g, ""));

  const isFormValid = form.name.trim().length > 0 && isValidEmail(form.email) && isValidCellphone(form.cellphone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setStatus("Please fill in all required fields correctly.");
      return;
    }
    setIsSending(true);
    setStatus("Sending...");
    try {
      const apiBase = import.meta.env.VITE_API_URL || "https://ib-backend.ib-innovativesolutions.com/api/";
      const res = await fetch(`${apiBase}application-help/send-application-help`, {
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
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="mb-6 text-3xl font-bold">University Application Help Request</h1>
      <div className="mb-6 rounded border-l-4 border-blue-600 bg-blue-50 p-4 text-black">
        <p className="mb-2">For urgent assistance, you can:</p>
        <div className="ml-2">
          <div>Email: <a href="mailto:innocent38318@gmail.com" className="text-black underline">innocent38318@gmail.com</a></div>
          <div>Call: <a href="tel:0684240852" className="text-black underline">068 424 0852</a></div>
        </div>
        <p className="mt-2">Or fill out the form below for application help.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow">
        <div>
          <label className="mb-1 block font-medium text-black" htmlFor="name">Full Name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Jane Doe" className="w-full rounded border px-3 py-2 text-black" />
        </div>
        <div>
          <label className="mb-1 block font-medium text-black" htmlFor="email">Email Address</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="e.g. jane@email.com" className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block font-medium text-black" htmlFor="cellphone">Cellphone Number</label>
          <input id="cellphone" name="cellphone" type="tel" value={form.cellphone} onChange={handleChange} required placeholder="e.g. 071 234 5678" className="w-full rounded border px-3 py-2 text-black" />
        </div>
        <div>
          <label className="mb-1 block font-medium text-black" htmlFor="message">Message (optional)</label>
          <textarea id="message" name="message" value={form.message} onChange={handleChange} placeholder="How can we help you with your application?" className="w-full rounded border px-3 py-2 text-black" />
        </div>
        <button type="submit" className={`w-full rounded bg-blue-600 py-2 font-semibold text-white transition-opacity ${(!isFormValid || isSending) ? "cursor-not-allowed opacity-50" : ""}`} disabled={!isFormValid || isSending}>
          {isSending ? "Sending..." : "Send Request"}
        </button>
        {status === "Request sent successfully!" && <div className="mt-2 text-center text-sm font-semibold text-green-600">{status}</div>}
        {status && status !== "Request sent successfully!" && status !== "Sending..." && <div className="mt-2 text-center text-sm text-red-600">{status}</div>}
      </form>
    </div>
  );
};

export default ApplicationHelpPage;
