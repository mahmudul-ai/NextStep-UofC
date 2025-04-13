import React, { useState } from 'react';

function ApplyButton({ jobId }) {
  const [resume, setResume] = useState(null);

  const handleApply = async () => {
    const formData = new FormData();
    formData.append("job", jobId);
    formData.append("resume", resume);

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:8000/api/applications/", {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      alert("Applied successfully!");
    } else {
      alert("Failed to apply");
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setResume(e.target.files[0])}
      />
      <button onClick={handleApply}>Apply</button>
    </div>
  );
}

export default ApplyButton;
