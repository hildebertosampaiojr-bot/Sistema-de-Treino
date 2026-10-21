(() => {
const { activeProfile, activeUserName, apiBase, dayNames } = Aoldeya;
const seedProfile = window.AoldeyaWorkoutSeed?.profiles?.[activeUserName] || {};
const weightOutput = document.querySelector("#profile-weight");
const heightOutput = document.querySelector("#profile-height");
const bmiOutput = document.querySelector("#profile-bmi");
const dialog = document.querySelector("#measures-dialog");
const form = document.querySelector("#measures-form");
const weightInput = document.querySelector("#weight-input");
const heightInput = document.querySelector("#height-input");
const feedback = document.querySelector("#measure-feedback");
const bmiPreview = document.querySelector("#bmi-preview");
let userId = null;
const profileNameKey = `aoldeya-display-name-${activeUserName}`;
const profileNamePendingKey = `${profileNameKey}-pending`;
const profilePhotoKey = `aoldeya-profile-photo-${activeUserName}`;
const profilePhotoPendingKey = `${profilePhotoKey}-pending`;
let profileDisplayName = activeUserName;
try { profileDisplayName = localStorage.getItem(profileNameKey) || activeUserName; } catch { /* Local profile name is optional. */ }
const renderProfileName = () => {
  document.querySelector("#welcome-greeting").textContent = `Ol\u00e1, ${profileDisplayName}`;
  document.querySelector(".avatar-initial").textContent = profileDisplayName.trim()[0]?.toLocaleUpperCase("pt-BR") || activeUserName[0];
};
let measurements = {
  weight: Number(activeProfile.weight.replace(",", ".")),
  height: Number(activeProfile.height.replace(" m", "").replace(",", "."))
};
try {
  const saved = JSON.parse(localStorage.getItem(`aoldeya-measures-${activeUserName}`) || "null");
  if (saved?.weight > 0 && saved?.height > 0) measurements = saved;
} catch { /* Local storage may be unavailable. */ }

const renderMeasurements = () => {
  weightOutput.textContent = measurements.weight.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  heightOutput.textContent = `${measurements.height.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;
  const bmi = measurements.weight / (measurements.height ** 2);
  bmiOutput.textContent = Number.isFinite(bmi) ? bmi.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—";
};
const updateBmiPreview = () => {
  const weight = Number(weightInput.value.replace(",", "."));
  const height = Number(heightInput.value.replace(",", "."));
  bmiPreview.textContent = Number.isFinite(weight) && Number.isFinite(height) && height > 0 ? `IMC calculado: ${(weight / (height ** 2)).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}` : "Informe peso e altura para calcular o IMC.";
};
weightInput.addEventListener("input", updateBmiPreview);
heightInput.addEventListener("input", updateBmiPreview);
const openEditor = () => {
  weightInput.value = String(measurements.weight);
  heightInput.value = String(measurements.height);
  feedback.textContent = "";
  updateBmiPreview();
  dialog.showModal();
};
renderMeasurements();
document.querySelectorAll(".measure-edit").forEach((button) => button.addEventListener("click", openEditor));
document.querySelector("#close-measures").addEventListener("click", () => dialog.close());
renderProfileName();
document.querySelector("#welcome-title").textContent = activeProfile.greeting;
document.querySelector("#profile-goal").textContent = activeProfile.goal;
const menuToggle = document.querySelector("#profile-menu-toggle");
const profileMenu = document.querySelector("#profile-menu");
const photoInput = document.querySelector("#profile-photo-input");
const photoElement = document.querySelector("#profile-avatar-photo");
const profileDialog = document.querySelector("#profile-dialog");
const profileForm = document.querySelector("#profile-form");
const profileNameInput = document.querySelector("#profile-name-input");
const profileFeedback = document.querySelector("#profile-feedback");
const menuFeedback = document.querySelector("#profile-menu-feedback");
const applyProfilePhoto = (photo) => {
  photoElement.src = photo;
  photoElement.hidden = false;
  menuToggle.classList.add("has-photo");
};
try {
  const savedPhoto = localStorage.getItem(profilePhotoKey);
  if (savedPhoto) applyProfilePhoto(savedPhoto);
} catch { /* Photo can be loaded from the database later. */ }
const closeProfileMenu = () => {
  profileMenu.hidden = true;
  menuToggle.setAttribute("aria-expanded", "false");
};
menuToggle.addEventListener("click", () => {
  profileMenu.hidden = !profileMenu.hidden;
  menuToggle.setAttribute("aria-expanded", String(!profileMenu.hidden));
});
document.addEventListener("click", (event) => { if (!event.target.closest(".profile-menu-wrap")) closeProfileMenu(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeProfileMenu(); });
profileMenu.addEventListener("click", (event) => {
  const action = event.target.closest("[data-profile-action]")?.dataset.profileAction;
  if (action === "photo") { closeProfileMenu(); photoInput.click(); }
  if (action === "details") {
    closeProfileMenu(); profileNameInput.value = profileDisplayName; profileFeedback.textContent = ""; profileDialog.showModal();
  }
  if (action === "logout") {
    try { localStorage.removeItem("aoldeya-user"); } catch { /* Continue to the welcome screen. */ }
    window.location.href = "index.html";
  }
});
document.querySelector("#close-profile-dialog").addEventListener("click", () => profileDialog.close());
profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = profileNameInput.value.trim();
  if (!name || name.length > 80) { profileFeedback.textContent = "Informe um nome de até 80 caracteres."; return; }
  profileDisplayName = name; renderProfileName();
  try { localStorage.setItem(profileNameKey, name); } catch { /* Keep the name for this page session. */ }
  try {
    const id = await window.AoldeyaProgress.getUserId();
    if (!id) throw new Error("API offline");
    const response = await fetch(`${apiBase}/api/users/${id}/profile`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ display_name: name }) });
    if (!response.ok) throw new Error("API offline");
    try { localStorage.removeItem(profileNamePendingKey); } catch { /* Ignore unavailable storage. */ }
    profileDialog.close();
  } catch {
    try { localStorage.setItem(profileNamePendingKey, "true"); } catch { /* The visible name is still updated. */ }
    profileFeedback.textContent = "Nome salvo neste dispositivo; sincroniza quando o servidor estiver disponível.";
  }
});
photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0]; photoInput.value = "";
  if (!file) return;
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 8 * 1024 * 1024) {
    menuFeedback.textContent = "Escolha uma foto JPEG, PNG ou WebP menor que 8 MB."; profileMenu.hidden = false; menuToggle.setAttribute("aria-expanded", "true"); return;
  }
  const imageUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = async () => {
    const canvas = document.createElement("canvas");
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    canvas.width = 256; canvas.height = 256;
    canvas.getContext("2d").drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, 256, 256);
    URL.revokeObjectURL(imageUrl);
    const photo = canvas.toDataURL("image/jpeg", 0.82); applyProfilePhoto(photo);
    try { localStorage.setItem(profilePhotoKey, photo); } catch { /* Database save can still keep the photo. */ }
    try {
      const id = await window.AoldeyaProgress.getUserId(); if (!id) throw new Error("API offline");
      const response = await fetch(`${apiBase}/api/users/${id}/profile-photo`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ photo_data: photo }) });
      if (!response.ok) throw new Error("API offline");
      try { localStorage.removeItem(profilePhotoPendingKey); } catch { /* Ignore unavailable storage. */ }
      menuFeedback.textContent = "Foto de perfil atualizada.";
    } catch {
      try { localStorage.setItem(profilePhotoPendingKey, "true"); } catch { /* Keep the current avatar. */ }
      menuFeedback.textContent = "Foto salva neste dispositivo; sincroniza quando o servidor estiver disponível.";
    }
    profileMenu.hidden = false; menuToggle.setAttribute("aria-expanded", "true");
  };
  image.onerror = () => { URL.revokeObjectURL(imageUrl); menuFeedback.textContent = "Não foi possível abrir essa imagem."; profileMenu.hidden = false; };
  image.src = imageUrl;
});
renderProfileName();
const weekdays = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
const orderedDays = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
const today = weekdays[new Date().getDay()];
const userQuery = `usuario=${encodeURIComponent(activeUserName)}`;
document.querySelector(".today-button").href = `meus-treinos.html?dia=${today}&${userQuery}`;
document.querySelectorAll('a[href="meus-treinos.html"]').forEach((link) => { link.href = `meus-treinos.html?${userQuery}`; });
document.querySelectorAll('a[href="usuario.html"]').forEach((link) => { link.href = `usuario.html?${userQuery}`; });

const showWorkouts = (dayMap) => {
  const days = new Set(Object.keys(dayMap));
  document.querySelectorAll(".week-day").forEach((item, index) => item.classList.toggle("has-workout", days.has(orderedDays[index])));
  const workout = dayMap[today];
  document.querySelector("#today-workout-title").textContent = workout?.name || "Dia de descanso";
  document.querySelector("#today-workout-day").textContent = dayNames[today];
  document.querySelector(".today-button").hidden = !workout;
};
showWorkouts(seedProfile);

document.querySelectorAll('a[href^="evolucao.html"]').forEach((link) => { link.href = `evolucao.html?${userQuery}`; });
const calendarDays = document.querySelector("#calendar-days");
const calendarMonthLabel = document.querySelector("#calendar-month");
const calendarCount = document.querySelector("#calendar-count");
const trainingDialog = document.querySelector("#training-dialog");
const trainingForm = document.querySelector("#training-form");
const trainingNameInput = document.querySelector("#training-name-input");
const trainingFeedback = document.querySelector("#training-feedback");
let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedTrainingDate = "";
let monthTrainingRecords = [];
const isoDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const monthKey = () => `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}`;
const refreshCalendar = async () => {
  const key = monthKey();
  calendarMonthLabel.textContent = calendarMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  monthTrainingRecords = await window.AoldeyaProgress.getTrainingDays(key);
  const recordsByDate = new Map(monthTrainingRecords.map((item) => [item.trained_on, item]));
  calendarCount.textContent = `${monthTrainingRecords.length} ${monthTrainingRecords.length === 1 ? "dia treinado" : "dias treinados"}`;
  const offset = (new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() + 6) % 7;
  const count = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const today = isoDate(new Date());
  calendarDays.innerHTML = "";
  for (let blank = 0; blank < offset; blank += 1) calendarDays.append(document.createElement("span"));
  for (let day = 1; day <= count; day += 1) {
    const date = isoDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
    const record = recordsByDate.get(date);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `calendar-day${record ? " is-trained" : ""}${date === today ? " is-today" : ""}`;
    button.textContent = String(day);
    button.dataset.date = date;
    button.disabled = date > today;
    button.setAttribute("aria-pressed", String(Boolean(record)));
    button.setAttribute("aria-label", `${new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}${record ? `, treino: ${record.workout_name}` : ", registrar treino"}`);
    if (record) button.title = record.workout_name;
    calendarDays.append(button);
  }
};
refreshCalendar();
document.querySelector("#calendar-previous").addEventListener("click", () => { calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1); refreshCalendar(); });
document.querySelector("#calendar-next").addEventListener("click", () => { calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1); refreshCalendar(); });
calendarDays.addEventListener("click", (event) => {
  const button = event.target.closest(".calendar-day");
  if (!button || button.disabled) return;
  selectedTrainingDate = button.dataset.date;
  const priorRecord = monthTrainingRecords.find((item) => item.trained_on === selectedTrainingDate);
  document.querySelector("#training-date-label").textContent = new Date(`${selectedTrainingDate}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  trainingNameInput.value = priorRecord?.workout_name || "Treino registrado";
  trainingFeedback.textContent = "";
  trainingDialog.showModal();
});
document.querySelector("#close-training-dialog").addEventListener("click", () => trainingDialog.close());
trainingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const [year, month, day] = selectedTrainingDate.split("-").map(Number);
  const weekday = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"][new Date(year, month - 1, day).getDay()];
  trainingFeedback.textContent = "Salvando registro...";
  const result = await window.AoldeyaProgress.saveTrainingDay({ date: selectedTrainingDate, workoutName: trainingNameInput.value.trim(), workoutDay: weekday, source: "manual" });
  if (result.synced) trainingDialog.close();
  else trainingFeedback.textContent = "Registrado neste dispositivo; será sincronizado quando a API estiver disponível.";
  await refreshCalendar();
});
const chart = document.querySelector("#load-evolution-chart");
const chartEmpty = document.querySelector("#load-chart-empty");
window.AoldeyaProgress.getRecords().then((records) => {
  if (!records.length) return;
  const latest = records.at(-1);
  const series = records.filter((item) => item.exercise_name === latest.exercise_name);
  document.querySelector("#load-chart-exercise").textContent = `${latest.exercise_name} · ${Number(latest.weight_kg).toLocaleString("pt-BR")} kg`;
  window.AoldeyaProgress.renderChart(chart, series);
  chartEmpty.hidden = true;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const weight = Number(weightInput.value.replace(",", "."));
  const height = Number(heightInput.value.replace(",", "."));
  if (!Number.isFinite(weight) || !Number.isFinite(height) || weight < 20 || weight > 400 || height < 0.8 || height > 2.5) {
    feedback.textContent = "Informe peso entre 20 e 400 kg e altura entre 0,80 e 2,50 m.";
    return;
  }
  measurements = { weight, height };
  renderMeasurements();
  try { localStorage.setItem(`aoldeya-measures-${activeUserName}`, JSON.stringify(measurements)); } catch { /* Continue with the current screen values. */ }
  if (userId) {
    try {
      const response = await fetch(`${apiBase}/api/users/${userId}/measurements`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight_kg: weight, height_m: height })
      });
      if (!response.ok) throw new Error("API unavailable");
      const saved = await response.json();
      measurements = { weight: saved.weight_kg, height: saved.height_m };
      renderMeasurements();
      try { localStorage.setItem(`aoldeya-measures-${activeUserName}`, JSON.stringify(measurements)); } catch { /* Ignore unavailable storage. */ }
      dialog.close();
      return;
    } catch {
      feedback.textContent = "Atualizado neste dispositivo. Nao foi possivel sincronizar com o banco.";
      return;
    }
  }
  feedback.textContent = "Atualizado neste dispositivo. O banco sera sincronizado quando estiver conectado.";
});

fetch(`${apiBase}/api/users`)
  .then((response) => response.ok ? response.json() : [])
  .then(async (users) => {
    const user = users.find((item) => item.name === activeUserName);
    if (!user) return;
userId = user.id;
    const localName = (() => { try { return localStorage.getItem(profileNameKey); } catch { return null; } })();
    const nameIsPending = (() => { try { return localStorage.getItem(profileNamePendingKey) === "true"; } catch { return false; } })();
    if (nameIsPending && localName) {
      profileDisplayName = localName; renderProfileName();
      fetch(`${apiBase}/api/users/${userId}/profile`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ display_name: localName }) })
        .then((response) => { if (response.ok) localStorage.removeItem(profileNamePendingKey); }).catch(() => {});
    } else {
      profileDisplayName = user.display_name || localName || user.name; renderProfileName();
      try { if (user.display_name) localStorage.setItem(profileNameKey, user.display_name); } catch { /* Keep the profile name in memory. */ }
    }
    try {
    const profileResponse = await fetch(`${apiBase}/api/users/${userId}/profile`);
    if (profileResponse.ok) {
      const remoteProfile = await profileResponse.json();
      const localPhoto = (() => { try { return localStorage.getItem(profilePhotoKey); } catch { return null; } })();
      const photoIsPending = (() => { try { return localStorage.getItem(profilePhotoPendingKey) === "true"; } catch { return false; } })();
      if (photoIsPending && localPhoto) {
        applyProfilePhoto(localPhoto);
        const photoResponse = await fetch(`${apiBase}/api/users/${userId}/profile-photo`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ photo_data: localPhoto }) });
        if (photoResponse.ok) localStorage.removeItem(profilePhotoPendingKey);
      } else if (remoteProfile.profile_photo_data) {
        applyProfilePhoto(remoteProfile.profile_photo_data);
        try { localStorage.setItem(profilePhotoKey, remoteProfile.profile_photo_data); } catch { /* Photo remains in the database. */ }
      } else if (localPhoto) applyProfilePhoto(localPhoto);
    }
    if (user.weight_kg && user.height_m) {
      const hasLocalOverride = (() => { try { return Boolean(localStorage.getItem(`aoldeya-measures-${activeUserName}`)); } catch { return false; } })();
      if (!hasLocalOverride) {
        measurements = { weight: user.weight_kg, height: user.height_m };
        renderMeasurements();
      }
    }

    } catch { /* Profile customization can be offline while workout data loads. */ }
    const response = await fetch(`${apiBase}/api/users/${user.id}/workouts`);
    if (!response.ok) return;
    const rows = await response.json();
    if (!rows.length) return;
    const dayMap = {};
    rows.forEach((row) => { dayMap[row.day_of_week] ||= { name: row.workout_name }; });
    showWorkouts(dayMap);
  })
  .catch(() => {});
})();