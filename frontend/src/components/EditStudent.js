import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CameraCapture from "./CameraCapture";
import { getStudents, updateStudent } from "../api";

export default function EditStudent() {

  const { id } = useParams();
  const navigate = useNavigate();
  const cameraRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState(null);

  const [capturedImage, setCapturedImage] = useState(null);

  const [form, setForm] = useState({

    student_id: "",

    name: "",

    password: ""

  });

  useEffect(() => {

    loadStudent();

  }, []);

  async function loadStudent() {

    try {

      const response = await getStudents();

      const student = response.data.find(

        (item) => item.id === Number(id)

      );

      if (!student) {

        alert("Student not found.");

        navigate("/teacher/students");

        return;

      }

      setForm({

        student_id: student.student_id,

        name: student.name,

        password: ""

      });

      setCapturedImage(student.profile_image);

    } catch (error) {

      console.error(error);

      alert("Unable to load student.");

    } finally {

      setLoading(false);

    }

  }

  function handleCapture() {

    const img = cameraRef.current?.capture();

    if (!img) {

      alert("Capture failed.");

      return;

    }

    setCapturedImage(img);
  }
    async function handleSubmit(e) {

    e.preventDefault();

    if (!form.student_id || !form.name) {

      setMessage({
        type: "error",
        text: "Student ID and Name are required."
      });

      return;

    }

    setSaving(true);

    setMessage(null);

    try {

      const payload = {

        student_id: form.student_id,

        name: form.name

      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      if (capturedImage) {
        payload.profile_image = capturedImage;
      }

      await updateStudent(id, payload);

      setMessage({
        type: "success",
        text: "Student updated successfully."
      });

      setTimeout(() => {

        navigate("/teacher/students");

      }, 1200);

    } catch (error) {

      console.error(error);

      setMessage({

        type: "error",

        text:
          error.response?.data?.message ||
          "Update failed."

      });

    } finally {

      setSaving(false);

    }

  }

  if (loading) {

    return (

      <main className="page-card">

        <div className="card">

          <h2>Loading Student...</h2>

        </div>

      </main>

    );

  }
    return (
    <main className="page-card">

      <div className="top-bar">

        <div>
          <h1 className="section-title">
            Edit Student
          </h1>

          <p className="notice">
            Update student information
          </p>
        </div>

        <button
          className="secondary"
          onClick={() => navigate("/teacher/students")}
        >
          Back
        </button>

      </div>

      {message && (
        <div
          className={`notice ${
            message.type === "error"
              ? "error"
              : "success"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid-2">

        <form
          className="card"
          onSubmit={handleSubmit}
        >

          <div className="form-field">
            <label>Student ID</label>

            <input
              value={form.student_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  student_id: e.target.value
                })
              }
            />
          </div>

          <div className="form-field">
            <label>Student Name</label>

            <input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
            />
          </div>

          <div className="form-field">
            <label>New Password</label>

            <input
              type="password"
              placeholder="Leave blank to keep old password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value
                })
              }
            />
          </div>

          <div className="action-row">

            <button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() =>
                navigate("/teacher/students")
              }
            >
              Cancel
            </button>

          </div>

        </form>

        <div className="card">

          <CameraCapture
            ref={cameraRef}
            title="Capture New Face"
          />

          <div className="action-row" style={{ marginTop: 15 }}>

            <button
              type="button"
              onClick={handleCapture}
            >
              Capture Face
            </button>

          </div>

          {capturedImage && (

            <div className="preview-box">

              <h3>Preview</h3>

              <img
                src={capturedImage}
                alt="Student"
                className="preview-image"
              />

            </div>

          )}

        </div>

      </div>

    </main>
  );

}