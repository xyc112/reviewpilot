import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Course.css";

const CreateCourse: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    level: "BEGINNER",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const courseData = {
        title: formData.title,
        description: formData.description,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        level: formData.level,
      };

      await courseAPI.createCourse(courseData);
      navigate("/courses");
    } catch (err: any) {
      setError(err.response?.data?.message || "创建课程失败");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container">
        <div className="error-message">无权限访问此页面</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="content-section">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">课程标题 *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">课程描述</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">标签 (用逗号分隔)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="例如: 数学, 基础, 入门"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="level">难度等级</label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="form-control"
            >
              <option value="BEGINNER">初级</option>
              <option value="INTERMEDIATE">中级</option>
              <option value="ADVANCED">高级</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "创建中..." : "创建课程"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
