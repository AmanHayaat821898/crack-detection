// src/App.tsx
import React, { useRef, useState } from 'react';

type MainProps = {
  onReportReady: (data: { image: string; report: any }) => void;
};

function Main({ onReportReady }: MainProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [context, setContext] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAsk = async () => {
    if (!uploadedFile) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('context', context);

      const res = await fetch('http://localhost:8000/crack-detect', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to get report');
      const data = await res.json();

      await new Promise((resolve) => setTimeout(resolve, 2000));


      const sdss = {
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII',
        report:'No additional information provided.',
      }
      
      onReportReady(data);
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-gray-50 relative px-2 sm:px-4">
      {/* Title and Subtitle */}
      <div className="text-center max-w-xl">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">Crack Detection System</h1>
        <p className="text-base sm:text-lg text-gray-600 mt-2 sm:mt-4">
          Upload your <span className="font-medium text-gray-800">images or videos</span> showing surface cracks.<br />
          Optionally, let us know <span className="italic text-blue-600">how long you've faced the issue</span> for a better diagnosis.
        </p>
      </div>

      {/* Upload Box at Bottom */}
      <div className="absolute bottom-4 sm:bottom-12 flex flex-col items-center space-y-3 sm:space-y-4 w-full max-w-md">
        <div
          onClick={!uploadedFile ? handleUploadClick : undefined}
          className={`bg-white shadow-md border border-dashed border-gray-400 px-3 py-3 sm:px-6 sm:py-5 rounded-xl cursor-pointer text-center hover:shadow-lg transition relative ${uploadedFile ? 'cursor-default' : ''}`}
        >
          {uploadedFile && previewUrl ? (
            <div className="relative flex justify-center items-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-40 max-w-full rounded-md object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-1 right-1 bg-white rounded-full text-gray-700 hover:bg-gray-200 w-6 h-6 flex items-center justify-center shadow"
                aria-label="Remove"
              >
                &times;
              </button>
            </div>
          ) : uploadedFile ? (
            <div className="relative flex flex-col items-center">
              <span className="text-gray-700">{uploadedFile.name}</span>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-1 right-1 bg-white rounded-full text-gray-700 hover:bg-gray-200 w-6 h-6 flex items-center justify-center shadow"
                aria-label="Remove"
              >
                &times;
              </button>
            </div>
          ) : (
            <p className="text-sm sm:text-base text-gray-600">
              Drop your file here or <span className="text-blue-600 font-semibold">click to upload</span>
            </p>
          )}
          <input
            type="file"
            accept="image/*,video/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <textarea
          placeholder="Optional: Describe how long the issue has existed..."
          className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
        <button
          className="mt-2 bg-black text-white rounded-full px-6 sm:px-8 py-2 text-sm sm:text-base font-semibold transition hover:bg-gray-900"
          onClick={handleAsk}
          disabled={!uploadedFile || loading}
        >
          {loading ? 'Processing...' : 'Ask'}
        </button>
        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      </div>
    </div>
  );
}

export default Main;