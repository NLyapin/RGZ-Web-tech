import React, { useState } from "react";
import axios from "axios";
import "../VideoUpload.css";

function extractErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data === "object") {
    const first = Object.values(data)[0];
    if (Array.isArray(first) && first.length) return String(first[0]);
    if (typeof first === "string") return first;
  }
  return fallback;
}

function getAccessToken() {
  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token") ||
    ""
  );
}

const VideoUpload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadStatus(null);

    const accessToken = getAccessToken();
    if (!accessToken) {
      setIsUploading(false);
      setUploadStatus({
        success: false,
        message: "Сессия не найдена. Войдите в аккаунт снова.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", videoFile);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/videos/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        }
      );

      setUploadStatus({
        success: true,
        message: "Video uploaded successfully!",
      });
      console.log("Video uploaded successfully", response.data);

      setTitle("");
      setDescription("");
      setVideoFile(null);
      setUploadProgress(0);
    } catch (error) {
      const message = extractErrorMessage(error, "Upload failed. Please try again.");
      if (message.toLowerCase().includes("token")) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
      setUploadStatus({
        success: false,
        message,
      });
      console.error("Video upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div className="upload-header">
          <h2 className="upload-title">Импорт видео</h2>
          <p className="upload-subtitle">
            Заполните информацию и загрузите файл
          </p>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="title">Название</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Кратко опишите содержание"
              required
              className="form-textarea"
              rows="4"
            ></textarea>
          </div>

          <div className="form-group file-upload-group">
            <label htmlFor="video-upload" className="file-upload-label">
              {videoFile ? (
                <>
                  <span className="file-name">{videoFile.name}</span>
                  <span className="file-change">Выбрать другой файл</span>
                </>
              ) : (
                <>
                  <svg className="upload-icon" viewBox="0 0 24 24">
                    <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                  </svg>
                  {/* <span>Файл</span> */}
                  <span className="file-hint">Перетащите или выберите</span>
                </>
              )}
            </label>
            <input
              id="video-upload"
              type="file"
              onChange={(e) => setVideoFile(e.target.files[0])}
              required
              accept="video/*"
              className="file-input"
            />
          </div>

          {isUploading && (
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          )}

          {uploadStatus && (
            <div
              className={`status-message ${
                uploadStatus.success ? "success" : "error"
              }`}
            >
              {uploadStatus.message}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isUploading}
          >
            {isUploading ? "Загрузка..." : "Импортировать"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoUpload;
