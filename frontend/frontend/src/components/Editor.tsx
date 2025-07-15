import React, { useState } from 'react';
import axios from 'axios';

const Editor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(
        'http://localhost:8000/detect',
        formData,
        { responseType: 'blob' }
      );
      const imageUrl = URL.createObjectURL(response.data);
      setResultImage(imageUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>YOLO Detection Upload</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload & Detect</button>
      <div style={{ marginTop: '20px' }}>
        {resultImage && <img style={{width: '600px', height: 'auto'}} src={resultImage} alt="Result" />}
      </div>
    </div>
  );
};

export default Editor;