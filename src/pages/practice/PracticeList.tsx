import { useState, useEffect } from 'react';
import { Shield, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { PracticeQuestion } from '../../types';

export default function PracticeList() {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, { is_correct: boolean; explanation: string; correct_option_index: number }>>({});

  useEffect(() => {
    fetch('/api/practice/questions')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setQuestions(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmitAnswer = async (questionId: string, optionIndex: number) => {
    if (results[questionId]) return; // Already answered

    try {
      const res = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, selectedOptionIndex: optionIndex }),
      });
      const data = await res.json();
      if (data.success) {
        setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
        setResults((prev) => ({ ...prev, [questionId]: data.result }));
      }
    } catch (err) {
      console.error('Failed to submit answer', err);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading questions...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold text-gray-900">Practice Exams</h1>
        <p className="mt-4 text-xl text-gray-500">Test your knowledge with our sample questions.</p>
      </div>

      <div className="space-y-8">
        {questions.map((q, index) => {
          const result = results[q.id];
          const userAnswer = answers[q.id];
          const isAnswered = result !== undefined;

          return (
            <div key={q.id} className="bg-white shadow rounded-lg p-6 border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                    {q.category || 'General'}
                  </span>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {index + 1}. {q.question_text}
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {q.options.map((option, optIndex) => {
                  let optionClass = "w-full text-left p-3 rounded-md border transition-colors ";
                  
                  if (isAnswered) {
                    if (optIndex === result.correct_option_index) {
                      optionClass += "bg-green-50 border-green-500 text-green-700 font-medium";
                    } else if (optIndex === userAnswer && !result.is_correct) {
                      optionClass += "bg-red-50 border-red-500 text-red-700";
                    } else {
                      optionClass += "bg-gray-50 border-gray-200 text-gray-500";
                    }
                  } else {
                    optionClass += "hover:bg-gray-50 border-gray-200";
                  }

                  return (
                    <button
                      key={optIndex}
                      disabled={isAnswered}
                      onClick={() => handleSubmitAnswer(q.id, optIndex)}
                      className={optionClass}
                    >
                      <div className="flex items-center">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 mr-3 text-sm text-gray-500 bg-white">
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        {option}
                        {isAnswered && optIndex === result.correct_option_index && (
                          <CheckCircle className="ml-auto h-5 w-5 text-green-600" />
                        )}
                        {isAnswered && optIndex === userAnswer && !result.is_correct && (
                          <XCircle className="ml-auto h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className={`mt-4 p-4 rounded-md ${result.is_correct ? 'bg-green-50' : 'bg-blue-50'}`}>
                  <p className="text-sm font-medium mb-1">
                    {result.is_correct ? 'Correct!' : 'Explanation:'}
                  </p>
                  <p className="text-sm text-gray-700">{result.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
