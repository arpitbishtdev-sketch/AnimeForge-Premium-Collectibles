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
  variants: [],
  variantGroup: "", // links this product to others as siblings
};

function validate(form, imageFiles) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Product name is required";
  if (!form.slug.trim()) errors.slug = "Slug is required";
  if (!form.category.trim()) errors.category = "Category is required";
  if (!form.basePrice) errors.basePrice = "Price is required";
  if (!form.stock) errors.stock = "Stock is required";
  if (!imageFiles?.length)
    errors.image = "At least one product image is required";
  if (!form.displaySection)
    errors.displaySection = "Select where to display product";
  if (!form.status) errors.status = "Select product status";
  if (!form.tags.length) errors.tags = "At least one tag is required";

  const badVariant = form.variants.findIndex((v) => !v.value.trim());
  if (badVariant !== -1)
    errors.variants = `Variant #${badVariant + 1} is missing a value`;

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
    setImageFiles([]);
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

  const handleVariantsChange = useCallback((newVariants) => {
    setForm((prev) => ({ ...prev, variants: newVariants }));
    setErrors((prev) => ({ ...prev, variants: undefined }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImageFiles((prev) => {
      const combined = [...prev, ...files];
      if (combined.length > 8) {
        alert("Maximum 8 images allowed");
        return combined.slice(0, 8);
      }
      return combined;
    });
    e.target.value = "";
  }, []);

  const removeImage = useCallback(
    (index) => setImageFiles((prev) => prev.filter((_, i) => i !== index)),
    [],
  );

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
          formData.append("tags", JSON.stringify(form.tags));
        } else if (key === "variants") {
          const variantsMeta = form.variants.map((v) => ({
            type: v.type,
            value: v.value,
            priceModifier: Number(v.priceModifier) || 0,
            stock: Number(v.stock) || 0,
            ...(v.title?.trim() ? { title: v.title.trim() } : {}),
            ...(v.description?.trim()
              ? { description: v.description.trim() }
              : {}),
            ...(v.tags?.length ? { tags: v.tags } : {}),
            ...(v.adminNotes?.trim()
              ? { adminNotes: v.adminNotes.trim() }
              : {}),
            ...(v.category ? { category: v.category } : {}),
            ...(v.displaySection ? { displaySection: v.displaySection } : {}),
            ...(v.status ? { status: v.status } : {}),
          }));
          formData.append("variants", JSON.stringify(variantsMeta));
        } else if (key === "variantGroup") {
          // Only send if non-empty
          const vg = (form.variantGroup || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
          if (vg) formData.append("variantGroup", vg);
        } else {
          formData.append(key, form[key]);
        }
      });

      // Product images
      imageFiles.forEach((file) => formData.append("images", file));

      // Variant images
      form.variants.forEach((v, vi) => {
        const files = v.imageFiles?.length
          ? v.imageFiles
          : v.imageFile
            ? [v.imageFile]
            : [];
        files.forEach((f, fi) =>
          formData.append(`variantImage_${vi}_${fi}`, f),
        );
      });

      try {
        setStatus("loading");
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) {
          let errMsg = `Server error (${res.status})`;
          try {
            const errData = await res.json();
            errMsg =
              errData.message || errData.error || JSON.stringify(errData);
          } catch {}
          throw new Error(errMsg);
        }
        setStatus("success");
        setMessage("Product added successfully!");
        handleReset();
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "Upload failed");
      }
    },
    [form, imageFiles, handleReset],
  );

  const isFormValid = Object.keys(validate(form, imageFiles)).length === 0;

  return {
    form,
    errors,
    status,
    message,
    isFormValid,
    handleChange,
    handleVariantsChange,
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
