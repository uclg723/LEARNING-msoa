import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Clock, BookOpen, AlertCircle } from 'lucide-react';

interface Course {
  id: string;
  title_en: string;
  description_en: string;
  thumbnail_url: string;
  price_member: number;
  price_non_member: number;
  duration_hours: number;
  level: string;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      setLoading(true);
      // Use the API endpoint instead of direct Supabase query
      const response = await fetch('/api/courses');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch courses');
      }
      
      setCourses(result.data || []);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Professional Courses
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Enhance your skills with our industry-recognized training programs.
          </p>
        </div>

        {error ? (
          <div className="mt-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="mt-12 text-center text-gray-500">
            <p>No courses available at the moment.</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-300 flex flex-col">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title_en}
                      className="object-cover w-full h-48"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-48 bg-gray-100">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  {course.level && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full uppercase tracking-wide">
                      {course.level}
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title_en}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                    {course.description_en}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.duration_hours} hours
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t pt-4">
                    <div>
                      <span className="text-gray-500 text-xs block">Member Price</span>
                      <span className="text-lg font-bold text-blue-600">
                        HK${course.price_member}
                      </span>
                    </div>
                    <Link
                      to={`/courses/${course.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
