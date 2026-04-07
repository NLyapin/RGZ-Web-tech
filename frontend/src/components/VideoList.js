import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../VideoList.css";

function getAccessToken() {
  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token") ||
    ""
  );
}

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

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [durations, setDurations] = useState({});
  const [menuVideoId, setMenuVideoId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:8000/api/videos/");
        setVideos(response.data);
      } catch (error) {
        console.error("Failed to fetch videos", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const formatDuration = (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";
    const total = Math.floor(seconds);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString("ru-RU");
  };

  const handleMetadata = (id, duration) => {
    setDurations((prev) => {
      if (prev[id]) return prev;
      return { ...prev, [id]: duration };
    });
  };

  const handleDeleteVideo = async (videoId) => {
    const token = getAccessToken();
    if (!token) {
      setStatusMessage("Войдите в аккаунт, чтобы удалить видео.");
      setMenuVideoId(null);
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/videos/${videoId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVideos((prev) => prev.filter((video) => video.id !== videoId));
      setMenuVideoId(null);
      setStatusMessage("Видео удалено.");
    } catch (error) {
      setMenuVideoId(null);
      setStatusMessage(
        extractErrorMessage(error, "Не удалось удалить видео.")
      );
    }
  };

  const openEditModal = (video) => {
    setEditingVideo(video);
    setEditTitle(video.title || "");
    setEditDescription(video.description || "");
    setMenuVideoId(null);
  };

  const handleEditVideo = async (e) => {
    e.preventDefault();
    if (!editingVideo) return;
    const token = getAccessToken();
    if (!token) {
      setStatusMessage("Войдите в аккаунт, чтобы редактировать видео.");
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/videos/${editingVideo.id}/`,
        {
          title: editTitle,
          description: editDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setVideos((prev) =>
        prev.map((video) =>
          video.id === editingVideo.id ? { ...video, ...response.data } : video
        )
      );
      setEditingVideo(null);
      setStatusMessage("Видео обновлено.");
    } catch (error) {
      setStatusMessage(extractErrorMessage(error, "Не удалось обновить видео."));
    }
  };

  return (
    <div className="video-list-container">
      {statusMessage && <div className="video-list-status">{statusMessage}</div>}

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-icon" viewBox="0 0 24 24">
            <path d="M18,9H16V7H18M18,13H16V11H18M18,17H16V15H18M8,9H6V7H8M8,13H6V11H8M8,17H6V15H8M18,3V5H16V3H8V5H6V3H4V21H6V19H8V21H16V19H18V21H20V3H18Z" />
          </svg>
          <p>No videos found</p>
        </div>
      ) : (
        <div className="video-feed">
          {videos.map((video) => (
            <div key={video.id} className="video-card">
              <button
                type="button"
                className="video-menu-button"
                onClick={() =>
                  setMenuVideoId((prev) => (prev === video.id ? null : video.id))
                }
                aria-label="Меню видео"
              >
                ⋮
              </button>
              {menuVideoId === video.id && (
                <div className="video-menu-dropdown">
                  <button
                    type="button"
                    className="video-menu-item"
                    onClick={() => openEditModal(video)}
                  >
                    Редактировать
                  </button>
                  <button
                    type="button"
                    className="video-menu-item danger"
                    onClick={() => handleDeleteVideo(video.id)}
                  >
                    Удалить
                  </button>
                </div>
              )}
              <Link to={`/video/${video.id}`} className="video-link">
                <div className="thumbnail-container">
                  <video
                    className="video-thumbnail"
                    src={video.file_url}
                    poster={video.thumbnail_url || undefined}
                    preload="metadata"
                    muted
                    playsInline
                    onLoadedMetadata={(e) =>
                      handleMetadata(video.id, e.currentTarget.duration)
                    }
                  />
                  <div className="duration-badge">
                    {formatDuration(durations[video.id])}
                  </div>
                </div>
                <div className="video-info">
                  <h3 className="video-title">{video.title}</h3>
                  <p className="video-description">
                    {video.description || "No description available"}
                  </p>
                  <div className="video-meta">
                    <span className="upload-date">{formatDate(video.created_at)}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {editingVideo && (
        <div className="video-edit-overlay" onClick={() => setEditingVideo(null)}>
          <form
            className="video-edit-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleEditVideo}
          >
            <h3>Редактирование видео</h3>
            <label>
              Название
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </label>
            <label>
              Описание
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows="4"
              />
            </label>
            <div className="video-edit-actions">
              <button type="button" onClick={() => setEditingVideo(null)}>
                Отмена
              </button>
              <button type="submit">Сохранить</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default VideoList;
