import { useEffect, useState } from 'react';
import { BookOpen, Shield, Award, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LayoutConfig {
  hero: {
    title: string;
    subtitle: string;
    showButtons: boolean;
    videoUrl: string;
  };
  features: {
    show: boolean;
    items: Array<{
      icon: string;
      title: string;
      desc: string;
    }>;
  };
}

export default function Home() {
  const [layout, setLayout] = useState<LayoutConfig | null>(null);

  useEffect(() => {
    fetch('/api/layout/home')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLayout(data.layout);
        }
      })
      .catch(err => console.error('Failed to load layout', err));
  }, []);

  if (!layout) return <div>Loading...</div>;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'PlayCircle': return <PlayCircle className="h-10 w-10 text-blue-600 mb-4" />;
      case 'Shield': return <Shield className="h-10 w-10 text-blue-600 mb-4" />;
      case 'Award': return <Award className="h-10 w-10 text-blue-600 mb-4" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">MSO Learning</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link to="/courses" className="text-gray-500 hover:text-gray-900">Courses</Link>
            <Link to="/practice" className="text-gray-500 hover:text-gray-900">Practice</Link>
            <Link to="/certificates" className="text-gray-500 hover:text-gray-900">Certificates</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-500 hover:text-gray-900">Log in</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">{layout.hero.title}</h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              {layout.hero.subtitle}
            </p>
            {layout.hero.showButtons && (
              <div className="mt-8 flex justify-center gap-4">
                <Link to="/courses" className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700">Browse Courses</Link>
                <Link to="/practice" className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-50">
                  Try Practice Exam
                </Link>
              </div>
            )}

            {/* Featured Video Section */}
            {layout.hero.videoUrl && (
              <div className="mt-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900 aspect-video group">
                  <video 
                    className="w-full h-full object-cover"
                    controls
                    poster="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  >
                    <source src={layout.hero.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <PlayCircle className="w-20 h-20 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <p className="mt-4 text-gray-500 text-sm">
                  Watch our platform introduction to learn more about our features.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        {layout.features.show && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {layout.features.items.map((item, idx) => (
                <div key={idx} className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                  {renderIcon(item.icon)}
                  <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-gray-500">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 MSO Learning Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
