import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, Save, ArrowLeft } from 'lucide-react';

// Simplified types for admin client
interface PracticeQuestion {
  id: string;
  category: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  is_free: boolean;
}

interface QuestionFormData {
  category: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  is_free: boolean;
}

const initialFormState: QuestionFormData = {
  category: 'General',
  question_text: '',
  options: ['', '', '', ''],
  correct_option_index: 0,
  explanation: '',
  is_free: false,
};

export default function QuestionManager() {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<QuestionFormData>(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = () => {
    setLoading(true);
    // Fetch from backend (proxied to localhost:3001)
    fetch('/api/practice/questions?admin=true', {
        headers: {
            'Authorization': 'Bearer mock-token'
        }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setQuestions(data.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleEdit = (question: any) => {
    setEditingId(question.id);
    setFormData({
      category: question.category,
      question_text: question.question_text,
      options: question.options,
      correct_option_index: question.correct_option_index,
      explanation: question.explanation,
      is_free: question.is_free,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const res = await fetch(`/api/practice/questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer mock-token' }
      });
      const data = await res.json();
      if (data.success) {
        fetchQuestions();
      } else {
        alert('Failed to delete: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingId 
      ? `/api/practice/questions/${editingId}`
      : '/api/practice/questions';
    
    const method = editingId ? 'PUT' : 'POST';

    // Get the mock token we saved in login, or fallback for dev
    const token = localStorage.getItem('admin_token') || 'mock-admin-token';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setIsFormOpen(false);
        setEditingId(null);
        setFormData(initialFormState);
        fetchQuestions();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save question');
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  if (loading && questions.length === 0) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Manager</h1>
          <p className="mt-2 text-gray-500">Add, edit, and remove practice questions.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData(initialFormState);
            setIsFormOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" /> Add Question
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Question' : 'New Question'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    required
                  />
                </div>
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    checked={formData.is_free}
                    onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Is Free Preview?</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Question Text</label>
                <textarea
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                {formData.options.map((option, idx) => (
                  <div key={idx} className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="correct_option"
                      checked={formData.correct_option_index === idx}
                      onChange={() => setFormData({ ...formData, correct_option_index: idx })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-3"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                      required
                    />
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-1">Select the radio button to mark the correct answer.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Explanation <span className="text-gray-400 font-normal">(Optional)</span></label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  rows={2}
                  placeholder="Explain why the answer is correct..."
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" /> Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {questions.map((question) => (
            <li key={question.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 mr-2">
                        {question.category}
                      </span>
                      {question.is_free && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Free
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-blue-600 truncate">{question.question_text}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Answer:</span> {question.options[question.correct_option_index || 0]}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleEdit(question)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {questions.length === 0 && (
             <li className="px-4 py-8 text-center text-gray-500">No questions found. Add one to get started!</li>
          )}
        </ul>
      </div>
    </div>
  );
}
