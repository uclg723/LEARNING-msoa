import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Clock, PlayCircle, Lock, CheckCircle, AlertCircle } from 'lucide-react';

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

interface Lesson {
  id: string;
  title: string;
  duration: number;
  order_index: number;
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState(false); // Mock enrollment status

  useEffect(() => {
    if (id) {
      fetchCourseDetails(id);
    }
  }, [id]);

  async function fetchCourseDetails(courseId: string) {
    try {
      setLoading(true);
      
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Check enrollment (TODO: Implement real check)
      // const { data: enrollment } = await supabase.from('enrollments')...

    } catch (err: any) {
      console.error('Error fetching course details:', err);
      setError('Failed to load course details.');
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

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Error</h2>
          <p className="text-gray-600 mt-2">{error || 'Course not found'}</p>
          <Link to="/courses" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Link to="/courses" className="text-sm text-gray-500 hover:text-gray-900">
                  Courses
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-sm text-gray-900">{course.title_en}</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                {course.title_en}
              </h1>
              <p className="mt-4 text-lg text-gray-500">
                {course.description_en}
              </p>
              
              <div className="mt-6 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-400" />
                  {course.duration_hours} hours
                </div>
                <div className="flex items-center">
                  <PlayCircle className="h-5 w-5 mr-2 text-gray-400" />
                  {lessons.length} lessons
                </div>
                {course.level && (
                  <div className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase">
                    {course.level}
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center space-x-4">
                {enrolled ? (
                  <button className="bg-green-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-green-700 flex items-center">
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Continue Learning
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <button className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700">
                      Buy Now (HK${course.price_member})
                    </button>
                    <span className="text-sm text-gray-500">
                      Non-member: HK${course.price_non_member}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-10 lg:mt-0 relative">
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg bg-gray-100">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title_en}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <PlayCircle className="h-20 w-20 text-gray-300" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link to={`/courses/${id}/lessons/${lesson.id}`} className="block hover:bg-gray-50 transition duration-150 ease-in-out">
                      <div className="px-4 py-4 flex items-center sm:px-6">
                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {enrolled ? (
                                <PlayCircle className="h-5 w-5 text-blue-500" />
                              ) : (
                                <PlayCircle className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-blue-600 truncate">{lesson.title}</p>
                              <p className="text-sm text-gray-500">Lesson {lesson.order_index}</p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-5 flex-shrink-0">
                          <div className="text-sm text-gray-500">
                            {lesson.duration} min
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
                {lessons.length === 0 && (
                  <li className="px-4 py-8 text-center text-gray-500">
                    No lessons available yet.
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="mt-8 lg:mt-0">
            <div className="bg-white shadow sm:rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                <li>Stable internet connection</li>
                <li>Audio output device</li>
                <li>Basic understanding of finance</li>
              </ul>
              
              <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">Includes</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <PlayCircle className="h-5 w-5 mr-2 text-green-500" />
                  {course.duration_hours} hours on-demand video
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Certificate of completion
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Full lifetime access (90 days per cycle)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
