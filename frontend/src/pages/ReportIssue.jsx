import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function LocationPicker({ latitude, longitude, setLocation }) {
  useMapEvents({
    click(e) {
      setLocation(e.latlng.lat, e.latlng.lng);
    },
  });

  if (!latitude || !longitude) {
    return null;
  }

  return <Marker position={[latitude, longitude]} />;
}

function RecenterMap({ latitude, longitude }) {
  const map = useMap();

  if (latitude && longitude) {
    map.setView([latitude, longitude], 16);
  }

  return null;
}

function ReportIssue() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    priority: "medium",
    latitude: "",
    longitude: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { id: 1, name: "Road Damage" },
    { id: 2, name: "Street Lighting" },
    { id: 3, name: "Garbage" },
    { id: 4, name: "Drainage" },
    { id: 5, name: "Water Supply" },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5 MB.");
      return;
    }

    setImage(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
  };

  const setLocation = (latitude, longitude) => {
  setFormData((previousData) => ({
    ...previousData,
    latitude: latitude.toFixed(6),
    longitude: longitude.toFixed(6),
  }));
};

const handleUseMyLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setLocation(
        position.coords.latitude,
        position.coords.longitude
      );
    },
    (error) => {
      console.error(error);
      alert("Could not get your location. Please allow location access.");
    }
  );
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      const uploadData = new FormData();

      uploadData.append("category_id", formData.category_id);
      uploadData.append("title", formData.title);
      uploadData.append("description", formData.description);
      uploadData.append("priority", formData.priority);

      if (formData.latitude) {
        uploadData.append("latitude", formData.latitude);
      }

      if (formData.longitude) {
        uploadData.append("longitude", formData.longitude);
      }

      if (image) {
        uploadData.append("image", image);
      }

      const response = await fetch(
        "http://localhost:5000/api/issues",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: uploadData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to submit issue");
        return;
      }

      console.log("Created issue:", data);

      alert("Issue submitted successfully!");

      setFormData({
        title: "",
        description: "",
        category_id: "",
        priority: "medium",
        latitude: "",
        longitude: "",
      });

      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error(error);

      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="report-container">
        <h1>Report an Issue</h1>

        <p className="report-subtitle">
          Tell CivicPulse about a problem in your community.
        </p>

        <form onSubmit={handleSubmit} className="report-form">
          <label>Issue Title</label>

          <input
            type="text"
            name="title"
            placeholder="Example: Large pothole on main road"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label>Description</label>

          <textarea
            name="description"
            placeholder="Describe the problem..."
            value={formData.description}
            onChange={handleChange}
            rows="5"
            required
          />

          <label>Category</label>

          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
          >
            <option value="">Select category</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <label>Priority</label>

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label>Issue Location</label>

<button
  type="button"
  onClick={handleUseMyLocation}
  style={{
    marginBottom: "15px",
    padding: "10px 16px",
    cursor: "pointer",
  }}
>
  📍 Use My Location
</button>

<div className="location-row">
  <div>
    <label>Latitude</label>

    <input
      type="number"
      step="any"
      name="latitude"
      value={formData.latitude}
      onChange={handleChange}
      placeholder="Select from map"
      readOnly
    />
  </div>

  <div>
    <label>Longitude</label>

    <input
      type="number"
      step="any"
      name="longitude"
      value={formData.longitude}
      onChange={handleChange}
      placeholder="Select from map"
      readOnly
    />
  </div>
</div>

<p style={{ marginBottom: "8px" }}>
  Click the map to select the issue location.
</p>

<MapContainer
  center={[7.8731, 80.7718]}
  zoom={8}
  style={{
    height: "350px",
    width: "100%",
    borderRadius: "10px",
    marginBottom: "20px",
  }}
>
  <TileLayer
    attribution='&copy; OpenStreetMap contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />

  <LocationPicker
    latitude={Number(formData.latitude)}
    longitude={Number(formData.longitude)}
    setLocation={setLocation}
  />

  <RecenterMap
    latitude={Number(formData.latitude)}
    longitude={Number(formData.longitude)}
  />
</MapContainer>

          <label>Issue Photo</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {imagePreview && (
            <div className="image-preview">
              <p>Photo Preview</p>

              <img
                src={imagePreview}
                alt="Issue preview"
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  height: "250px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  marginTop: "10px",
                }}
              />
            </div>
          )}

          <button
            type="submit"
            className="submit-report-btn"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportIssue;