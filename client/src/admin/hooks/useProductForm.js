import { useState, useCallback } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/products`;

const INITIAL_FORM = {
  name: "",
  slug: "",
  description: "",
  category: "",
  basePrice: "",
  stock: "",
  status: "new",
  displaySection: "",
  tags: [],
};

function validate(form, imageFiles) {
  const errors = {};

  if (!form.name.trim()) errors.name = "Product name is required";
  if (!form.slug.trim()) errors.slug = "Slug is required";
  if (!form.category.trim()) errors.category = "Category is required";
  if (!form.basePrice) errors.basePrice = "Price is required";
  if (!form.stock) errors.stock = "Stock is required";
  if (!imageFiles || imageFiles.length === 0)
    errors.image = "At least one product image is required";
  if (!form.displaySection)
    errors.displaySection = "Select where to display product";
  if (!form.status) errors.status = "Select product status";
  if (!form.tags.length) errors.tags = "At least one tag is required";

  return errors;
}

export function useProductForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleReset = useCallback(() => {
    setForm(INITIAL_FORM);
    setImageFiles([]); // ✅ fixed
    setErrors({});
    setStatus("idle");
    setMessage("");
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name === "tags" && Array.isArray(value)) {
      setForm((prev) => ({ ...prev, tags: value }));
      setErrors((prev) => ({ ...prev, tags: undefined }));
      return;
    }

    if (name === "name") {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

      setForm((prev) => ({ ...prev, name: value, slug }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const MAX_IMAGES = 8;

    setImageFiles((prev) => {
      const combined = [...prev, ...files];

      if (combined.length > MAX_IMAGES) {
        alert("Maximum 8 images allowed");
        return combined.slice(0, MAX_IMAGES);
      }

      return combined;
    });

    e.target.value = "";
  }, []);

  const removeImage = useCallback((index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reorderImages = useCallback((start, end) => {
    setImageFiles((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(start, 1);
      arr.splice(end, 0, item);
      return arr;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const validationErrors = validate(form, imageFiles);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const token = localStorage.getItem("adminToken");

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (key === "tags") {
          formData.append(key, JSON.stringify(form.tags));
        } else {
          formData.append(key, form[key]);
        }
      });

      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      try {
        setStatus("loading");

        const res = await fetch(API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        setStatus("success");
        setMessage("Product added successfully!");
        handleReset();
      } catch {
        setStatus("error");
        setMessage("Upload failed");
      }
    },
    [form, imageFiles, handleReset],
  );

  const isFormValid = Object.keys(validate(form, imageFiles)).length === 0; // ✅ fixed

  return {
    form,
    errors,
    status,
    message,
    isFormValid,
    handleChange,
    handleSubmit,
    handleFileChange,
    imageFiles,
    removeImage,
    reorderImages,
    handleReset,
    deletedImages,
    setDeletedImages,
  };
}
