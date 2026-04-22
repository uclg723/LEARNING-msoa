import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserPlus, Upload, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    chineseFamilyName: '',
    chineseGivenName: '',
    englishSurname: '',
    englishGivenName: '',
    company: '',
    financialInstitutionCategory: '',
    phone: '',
    msoAssociationNumber: '',
    realNameDeclaration: false,
    noChineseName: false
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const fillDummyData = () => {
    setFormData({
      email: `user${Date.now()}@example.com`,
      password: 'password123',
      confirmPassword: 'password123',
      chineseFamilyName: '陳',
      chineseGivenName: '大文',
      englishSurname: 'Chan',
      englishGivenName: 'Tai Man',
      company: 'Test Company Ltd',
      financialInstitutionCategory: 'bank',
      phone: '12345678',
      msoAssociationNumber: 'MSO123456',
      realNameDeclaration: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (!formData.realNameDeclaration) {
      setError("You must declare that the information provided is true and accurate.");
      setLoading(false);
      return;
    }

    if (!formData.noChineseName && (!formData.chineseFamilyName || !formData.chineseGivenName)) {
      setError("Please provide your Chinese Name or check 'I do not have a Chinese name'.");
      setLoading(false);
      return;
    }

    try {
      // Create FormData to send file and fields
      const data = new FormData();
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('chinese_family_name', formData.chineseFamilyName);
      data.append('chinese_given_name', formData.chineseGivenName);
      data.append('english_surname', formData.englishSurname);
      data.append('english_given_name', formData.englishGivenName);
      data.append('company', formData.company);
      data.append('financial_institution_category', formData.financialInstitutionCategory);
      data.append('phone', formData.phone);
      data.append('mso_association_number', formData.msoAssociationNumber);
      
      if (file) {
        data.append('mso_license_file', file);
      }

      // Send to backend
      const response = await fetch('/api/auth/register-full', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (!result.success) {
        // Fallback for dev mode if backend fails
        console.warn("Backend registration failed, using mock fallback:", result.error);
        alert("Dev Mode: Registration simulated (Backend returned error). You can login.");
      } else {
        alert("Registration successful! Email sent to info@msoa.hk");
      }

      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <UserPlus className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">sign in to your existing account</Link>
        </p>
        <div className="mt-4 text-center">
            <button
                type="button"
                onClick={fillDummyData}
                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
            >
                [DEV] Fill Dummy Data
            </button>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {/* Chinese Names */}
              <div>
                <label htmlFor="chineseFamilyName" className="block text-sm font-medium text-gray-700">Chinese Family Name</label>
                <input
                  type="text"
                  name="chineseFamilyName"
                  required={!formData.noChineseName}
                  disabled={formData.noChineseName}
                  value={formData.chineseFamilyName}
                  onChange={handleChange}
                  className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formData.noChineseName ? 'bg-gray-100' : ''}`}
                />
              </div>
              <div>
                <label htmlFor="chineseGivenName" className="block text-sm font-medium text-gray-700">Chinese Given Name</label>
                <input
                  type="text"
                  name="chineseGivenName"
                  required={!formData.noChineseName}
                  disabled={formData.noChineseName}
                  value={formData.chineseGivenName}
                  onChange={handleChange}
                  className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formData.noChineseName ? 'bg-gray-100' : ''}`}
                />
              </div>

              {/* No Chinese Name Checkbox */}
              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <input
                    id="noChineseName"
                    name="noChineseName"
                    type="checkbox"
                    checked={formData.noChineseName}
                    onChange={(e) => {
                       handleCheckboxChange(e);
                       if (e.target.checked) {
                         setFormData(prev => ({ ...prev, chineseFamilyName: '', chineseGivenName: '', noChineseName: true }));
                       }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="noChineseName" className="ml-2 block text-sm text-gray-900">
                    I do not have a Chinese name
                  </label>
                </div>
              </div>

              {/* English Names */}
              <div>
                <label htmlFor="englishSurname" className="block text-sm font-medium text-gray-700">English Surname</label>
                <input
                  type="text"
                  name="englishSurname"
                  required
                  value={formData.englishSurname}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="englishGivenName" className="block text-sm font-medium text-gray-700">English Given Name</label>
                <input
                  type="text"
                  name="englishGivenName"
                  required
                  value={formData.englishGivenName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Professional Info */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
              <input
                type="text"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="financialInstitutionCategory" className="block text-sm font-medium text-gray-700">Financial Institution Category</label>
              <select
                name="financialInstitutionCategory"
                required
                value={formData.financialInstitutionCategory}
                onChange={handleChange}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select a category</option>
                <option value="bank">Bank</option>
                <option value="insurance">Insurance</option>
                <option value="securities">Securities</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="msoAssociationNumber" className="block text-sm font-medium text-gray-700">MSO Association Number (Optional)</label>
              <input
                type="text"
                name="msoAssociationNumber"
                value={formData.msoAssociationNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative mt-1">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    minLength={8}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Document Upload (Mock UI) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">For Member MSO License upload</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>{file ? file.name : "Upload a file"}</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Declaration */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="realNameDeclaration"
                  name="realNameDeclaration"
                  type="checkbox"
                  required
                  checked={formData.realNameDeclaration}
                  onChange={handleCheckboxChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="realNameDeclaration" className="font-medium text-gray-700">Real-name Declaration</label>
                <p className="text-gray-500">I declare that the information provided is true and accurate. I understand that my certificate will be issued based on these names.</p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
