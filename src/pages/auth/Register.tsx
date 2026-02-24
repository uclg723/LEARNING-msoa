import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserPlus, Upload, AlertCircle } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    realNameDeclaration: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
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

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            chinese_family_name: formData.chineseFamilyName,
            chinese_given_name: formData.chineseGivenName,
            english_surname: formData.englishSurname,
            english_given_name: formData.englishGivenName,
            company: formData.company,
            financial_institution_category: formData.financialInstitutionCategory,
            phone: formData.phone,
            mso_association_number: formData.msoAssociationNumber,
          }
        }
      });

      if (authError) throw authError;

      // 2. Insert into profiles table (using existing schema)
      if (authData.user) {
        // Construct full name from parts
        const fullName = `${formData.chineseFamilyName}${formData.chineseGivenName} ${formData.englishGivenName} ${formData.englishSurname}`;
        
        const { error: dbError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: fullName,
            phone: formData.phone,
            company: formData.company,
            license_no: formData.msoAssociationNumber,
            industry: formData.financialInstitutionCategory,
            // Store detailed name parts in metadata or specific columns if added later
            // For now, mapping to existing 'profiles' columns
          });

        if (dbError) {
            console.error('Error creating user profile:', dbError);
            // If the trigger handles it, this might fail with duplicate key. 
            // We'll log it but not block navigation if auth succeeded.
        }
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
                  required
                  value={formData.chineseFamilyName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="chineseGivenName" className="block text-sm font-medium text-gray-700">Chinese Given Name</label>
                <input
                  type="text"
                  name="chineseGivenName"
                  required
                  value={formData.chineseGivenName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
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
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={8}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Document Upload (Mock UI) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">ID / Company Proof (Optional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" />
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
