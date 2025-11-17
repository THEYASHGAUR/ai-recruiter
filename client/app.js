document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  const dropzone = document.getElementById("resume-dropzone");
  const resumeInput = document.getElementById("resume-input");
  const preview = document.getElementById("resume-preview");
  const fileNameEl = preview.querySelector(".file-name");
  const fileSizeEl = preview.querySelector(".file-size");
  const removeBtn = document.getElementById("resume-remove");
  const analyzeBtn = document.getElementById("analyze-btn");
  const jdTextarea = document.getElementById("jd-text");
  const jdFileInput = document.getElementById("jd-file");

  const ANALYZE_ENDPOINT = "http://127.0.0.1:8000/analyze";
  const DEFAULT_TOP_K = 5;

  /* ---------------- Tabs ---------------- */
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
  });

  function activateTab(selected) {
    const target = selected.dataset.tab;

    tabs.forEach((tab) => tab.classList.toggle("active", tab === selected));
    panels.forEach((panel) => {
      panel.classList.toggle("hidden", panel.dataset.panel !== target);
    });
  }

  /* ---------------- Resume Upload ---------------- */
  function formatBytes(bytes) {
    if (!bytes) return "";
    const units = ["B", "KB", "MB", "GB"];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const size = bytes / 1024 ** exponent;
    return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[exponent]}`;
  }

  function handleFile(file) {
    if (!file) return;
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatBytes(file.size);
    preview.hidden = false;
    dropzone.classList.add("has-file");
  }

  resumeInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    handleFile(file);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add("dragover");
    });
  });

  ["dragleave", "dragend", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, () => {
      dropzone.classList.remove("dragover");
    });
  });

  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    handleFile(file);
  });

  dropzone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      resumeInput.click();
    }
  });

  removeBtn.addEventListener("click", () => {
    resumeInput.value = "";
    preview.hidden = true;
    dropzone.classList.remove("has-file");
  });

  /* ---------------- Analyze CTA ---------------- */
  analyzeBtn.addEventListener("click", async () => {
    analyzeBtn.classList.add("active");
    setTimeout(() => analyzeBtn.classList.remove("active"), 600);

    const resumeFile = resumeInput.files?.[0];
    const jdFile = jdFileInput?.files?.[0];
    const jdText = jdTextarea.value.trim();

    if (!resumeFile) {
      showToast("Please upload your resume to proceed.");
      return;
    }

    if (!jdFile && !jdText) {
      showToast("Provide a JD file or paste the JD text to continue.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("top_k", String(DEFAULT_TOP_K));
    if (jdFile) {
      formData.append("jd", jdFile);
    } else {
      formData.append("jd_text", jdText);
    }

    const originalLabel = analyzeBtn.textContent;
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";
    showToast("Analyzing resume...");

    try {
      const response = await fetch(ANALYZE_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        const message = payload?.error || "Unable to analyze resume.";
        throw new Error(message);
      }

      console.log("Analysis response:", payload);
      showToast("Analysis complete!", "success");
      // TODO: render payload.analysis in the UI when design is ready.
    } catch (error) {
      console.error("Failed to analyze resume", error);
      showToast(error.message || "Failed to analyze resume.");
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = originalLabel;
    }
  });

  /* ---------------- Toast helper ---------------- */
  function showToast(message, variant = "warn") {
    const toast = document.createElement("div");
    toast.className = `toast toast--${variant}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("visible"));
    setTimeout(() => {
      toast.classList.remove("visible");
      toast.addEventListener("transitionend", () => toast.remove(), {
        once: true,
      });
    }, 2800);
  }

  /* ---------------- Button ripple animations ---------------- */
  document.querySelectorAll("button, .upload-dropzone").forEach((target) => {
    target.addEventListener("pointerdown", (event) => {
      const circle = document.createElement("span");
      const diameter = Math.max(target.clientWidth, target.clientHeight);
      const radius = diameter / 2;
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${event.clientX - (target.getBoundingClientRect().left + radius)}px`;
      circle.style.top = `${event.clientY - (target.getBoundingClientRect().top + radius)}px`;
      circle.classList.add("ripple");

      const ripple = target.getElementsByClassName("ripple")[0];
      if (ripple) {
        ripple.remove();
      }
      target.appendChild(circle);
    });
  });
});
