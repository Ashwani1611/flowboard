import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, loginUser, getMe } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";

const FIELDS = [
  { name: "first_name",       label: "First Name",       type: "text",     placeholder: "First Name" },
  { name: "last_name",        label: "Last Name",        type: "text",     placeholder: "Last Name" },
  { name: "username",         label: "Username",         type: "text",     placeholder: "Username" },
  { name: "email",            label: "Email",            type: "email",    placeholder: "email@example.com" },
  { name: "password",         label: "Password",         type: "password", placeholder: "••••••••" },
  { name: "confirm_password", label: "Confirm Password", type: "password", placeholder: "••••••••" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]       = useState(Object.fromEntries(FIELDS.map((f) => [f.name, ""])));
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await registerUser(form);
      const { data: tokens }   = await loginUser({ email: form.email, password: form.password });
      localStorage.setItem("access",  tokens.access);
      localStorage.setItem("refresh", tokens.refresh);
      const { data: userData } = await getMe();
      login(tokens, userData);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      const errors = err.response?.data;
      const msg = errors
        ? Object.values(errors).flat().join(" ")
        : "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm font-mono">FB</span>
            </div>
            <span className="text-xl font-bold tracking-tight">FlowBoard</span>
          </div>
          <p className="text-gray-400 text-sm">Create your account</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {FIELDS.slice(0, 2).map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                    {f.label}
                  </label>
                  <input
                    name={f.name}
                    type={f.type}
                    value={form[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    required
                    className="input-field"
                  />
                </div>
              ))}
            </div>

            {FIELDS.slice(2).map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                  {f.label}
                </label>
                <input
                  name={f.name}
                  type={f.type}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  required
                  className="input-field"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Account
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-500 hover:text-brand-400 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}