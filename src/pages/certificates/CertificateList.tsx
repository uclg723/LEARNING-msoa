import { useState, useEffect } from 'react';
import { Award, Download, AlertCircle } from 'lucide-react';
import { Certificate } from '../../types';

export default function CertificateList() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    // fetch('/api/certificates')...
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <Award className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold text-gray-900">Your Certificates</h1>
        <p className="mt-4 text-xl text-gray-500">View and download your earned credentials.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certificates.length > 0 ? certificates.map((cert) => (
          <div key={cert.id} className="bg-white shadow rounded-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{cert.course_title}</h3>
            <p className="text-sm text-gray-500 mb-4">Issued: {cert.issue_date}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 font-mono">{cert.unique_code}</span>
              <a href={cert.pdf_url} className="text-blue-600 hover:text-blue-800 flex items-center">
                <Download className="h-4 w-4 mr-1" /> PDF
              </a>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No certificates earned yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
