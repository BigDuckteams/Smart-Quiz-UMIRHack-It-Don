const STORAGE_KEY = "smart_quiz_state";
const steps = [...document.querySelectorAll(".step")];
const progressBar = document.getElementById("progressBar");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const errorBox = document.getElementById("errorBox");
const areaRange = document.getElementById("areaRange");
const areaValue = document.getElementById("areaValue");

const initialState = {
  room_type: "",
  zones: [],
  area: 60,
  style: "",
  budget: "",
  name: "",
  phone: "",
  email: "",
  comment: "",
  consent: false
};

const saved = localStorage.getItem(STORAGE_KEY);
const quizState = saved ? { ...initialState, ...JSON.parse(saved) } : { ...initialState };
let currentStep = 1;
let isSubmitting = false;

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quizState));
}

function setStep(stepNum) {
  currentStep = stepNum;
  steps.forEach((step) => step.classList.toggle("active", Number(step.dataset.step) === stepNum));
  progressBar.style.width = `${(stepNum / steps.length) * 100}%`;
  prevBtn.disabled = stepNum === 1;
  nextBtn.textContent = stepNum === steps.length ? "Отправить" : "Далее";
  refreshStepUI();
  validateCurrentStep();
}

function validateCurrentStep() {
  let valid = false;
  if (currentStep === 1) valid = Boolean(quizState.room_type);
  if (currentStep === 2) valid = quizState.zones.length > 0;
  if (currentStep === 3) valid = quizState.area >= 20 && quizState.area <= 300;
  if (currentStep === 4) valid = Boolean(quizState.style);
  if (currentStep === 5) valid = Boolean(quizState.budget);
  if (currentStep === 6) {
    valid = Boolean(quizState.phone.trim()) && quizState.consent;
  }
  nextBtn.disabled = !valid || isSubmitting;
}

function refreshStepUI() {
  document.querySelectorAll(".options.single").forEach((group) => {
    const field = group.dataset.field;
    group.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("selected", quizState[field] === btn.dataset.value);
    });
  });

  document.querySelectorAll(".options.multi").forEach((group) => {
    const field = group.dataset.field;
    group.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("selected", quizState[field].includes(btn.dataset.value));
    });
  });

  areaRange.value = quizState.area;
  areaValue.textContent = String(quizState.area);
  document.getElementById("name").value = quizState.name;
  document.getElementById("phone").value = quizState.phone;
  document.getElementById("email").value = quizState.email;
  document.getElementById("comment").value = quizState.comment;
  document.getElementById("consent").checked = quizState.consent;
}

function showError(message = "") {
  errorBox.textContent = message;
}

document.querySelectorAll(".options.single button").forEach((button) => {
  button.addEventListener("click", () => {
    const field = button.parentElement.dataset.field;
    quizState[field] = button.dataset.value;
    persistState();
    refreshStepUI();
    validateCurrentStep();
  });
});

document.querySelectorAll(".options.multi button").forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;
    const zones = new Set(quizState.zones);
    if (zones.has(value)) zones.delete(value);
    else zones.add(value);
    quizState.zones = [...zones];
    persistState();
    refreshStepUI();
    validateCurrentStep();
  });
});

areaRange.addEventListener("input", () => {
  quizState.area = Number(areaRange.value);
  areaValue.textContent = String(quizState.area);
  persistState();
  validateCurrentStep();
});

["name", "phone", "email", "comment", "consent"].forEach((field) => {
  const el = document.getElementById(field);
  el.addEventListener("input", () => {
    quizState[field] = field === "consent" ? el.checked : el.value;
    persistState();
    validateCurrentStep();
  });
  el.addEventListener("change", () => {
    quizState[field] = field === "consent" ? el.checked : el.value;
    persistState();
    validateCurrentStep();
  });
});

prevBtn.addEventListener("click", () => {
  showError();
  if (currentStep > 1) setStep(currentStep - 1);
});

nextBtn.addEventListener("click", async () => {
  showError();
  if (currentStep < steps.length) {
    setStep(currentStep + 1);
    return;
  }

  if (isSubmitting) return;
  isSubmitting = true;
  validateCurrentStep();

  try {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
    const response = await fetch("/api/submit-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken
      },
      body: JSON.stringify(quizState)
    });

    const data = await response.json();
    if (!response.ok || data.status !== "success") {
      showError(data.message || "Ошибка отправки");
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/success";
  } catch (_err) {
    showError("Сетевая ошибка. Попробуйте позже.");
  } finally {
    isSubmitting = false;
    validateCurrentStep();
  }
});

refreshStepUI();
setStep(1);
