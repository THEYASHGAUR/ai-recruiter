window.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === "NumpadEnter") && e.target.tagName !== "TEXTAREA") {
    e.preventDefault();
  }
});


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
  const resultsPanel = document.getElementById("results-panel");
  const resultScore = document.getElementById("result-score");
  const resultChunks = document.getElementById("result-chunks");
  const resultSummary = document.getElementById("result-summary");
  const resultStrengths = document.getElementById("result-strengths");
  const resultGaps = document.getElementById("result-gaps");
  const resultJdSummary = document.getElementById("result-jd-summary");
  const resultRaw = document.getElementById("result-raw");

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

  function renderResults(payload) {
    if (!payload) return;
    const analysis = typeof payload.analysis === "string" ? safeJsonParse(payload.analysis) : payload.analysis;
    const jdSummary = typeof payload.jd_summary === "string" ? payload.jd_summary : JSON.stringify(payload.jd_summary, null, 2);

    resultScore.textContent = analysis?.match_score ?? "--";
    resultChunks.textContent = payload?.selected_chunks_count ?? "--";
    resultSummary.textContent = analysis?.summary || "No summary returned.";

    populateList(resultStrengths, analysis?.strengths);
    populateList(resultGaps, analysis?.missing_skills);

    resultJdSummary.textContent = jdSummary || "";
    resultRaw.textContent = JSON.stringify(payload, null, 2);

    resultsPanel.hidden = false;
    resultsPanel.scrollIntoView({ behavior: "smooth" });
  }

  function populateList(container, items) {
    container.innerHTML = "";
    if (!Array.isArray(items) || !items.length) {
      const li = document.createElement("li");
      li.textContent = "None";
      container.appendChild(li);
      return;
    }
    items.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      container.appendChild(li);
    });
  }

  function safeJsonParse(value) {
    try {
      return JSON.parse(value);
    } catch (_) {
      return null;
    }
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
  analyzeBtn.addEventListener("click", async (event) => {
    console.log("hi ")
    event.preventDefault();
    analyzeBtn.classList.add("active");
    setTimeout(() => analyzeBtn.classList.remove("active"), 600);
    console.log("yash")

    const resumeFile = resumeInput.files?.[0];
    // const jdFile = jdFileInput?.files?.[0];
    const jdText = jdTextarea.value.trim();

    if (!resumeFile) {
      showToast("Please upload your resume to proceed.");
      return;
    }

    if (!jdText) {
      showToast("Provide a JD file or paste the JD text to continue.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("top_k", String(DEFAULT_TOP_K));
    if (jdText) {
      formData.append("jd_text", jdText);
    } 

    console.log("inside")
    const originalLabel = analyzeBtn.textContent;
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";
    showToast("Analyzing resume...");

    try {
      console.log("inside try")
      console.info("Submitting analyze request", {
        resumeName: resumeFile.name,
        hasJdText: Boolean(jdText),
        topK: DEFAULT_TOP_K,
      });
      console.log("trigger the api ");
      console.log(formData)
      // const axiosResponse = await axios.post(ANALYZE_ENDPOINT, formData);
      // console.log("axiosResponse:", axiosResponse);

      // const payload = axiosResponse.data;
      // if (axiosResponse.status < 200 || axiosResponse.status >= 300) {
      //   const message = payload?.error || "Unable to analyze resume.";
      //   throw new Error(message);
      // }

      // console.info("Analyze request succeeded", payload);
      showToast("Analysis complete!", "success");
      // renderResults(payload);
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
