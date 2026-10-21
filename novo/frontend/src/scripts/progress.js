(() => {
  const { activeUserName, apiBase } = Aoldeya;
  const storageKey = `aoldeya-load-records-${activeUserName}`;
  let userIdPromise;

  const readLocal = () => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  };
  const writeLocal = (records) => {
    try { localStorage.setItem(storageKey, JSON.stringify(records)); } catch { /* The current page can still use in-memory data. */ }
  };
  const getUserId = () => {
    userIdPromise ||= fetch(`${apiBase}/api/users`)
      .then((response) => response.ok ? response.json() : [])
      .then((users) => users.find((user) => user.name === activeUserName)?.id || null)
      .catch(() => null);
    return userIdPromise;
  };
  const sortRecords = (records) => records.sort((a, b) => new Date(a.performed_at) - new Date(b.performed_at));
  const getRecords = async () => {
    const local = readLocal();
    const userId = await getUserId();
    if (!userId) return sortRecords(local);
    try {
      const response = await fetch(`${apiBase}/api/users/${userId}/load-records`);
      if (!response.ok) return sortRecords(local);
      const remote = await response.json();
      const pending = local.filter((item) => !item.synced);
      const uploaded = [];
      const remaining = [];
      for (const item of pending) {
        try {
          const savedResponse = await fetch(`${apiBase}/api/users/${userId}/load-records`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exercise_name: item.exercise_name, weight_kg: item.weight_kg, workout_day: item.workout_day })
          });
          if (savedResponse.ok) uploaded.push(await savedResponse.json());
          else remaining.push(item);
        } catch { remaining.push(item); }
      }
      writeLocal(remaining);
      return sortRecords([...remote, ...uploaded, ...remaining]);
    } catch { return sortRecords(local); }
  };
  const saveRecord = async ({ exerciseName, weight, workoutDay }) => {
    const records = readLocal();
    const localId = `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const pending = {
      local_id: localId, exercise_name: exerciseName, weight_kg: weight,
      performed_at: new Date().toISOString(), workout_day: workoutDay, synced: false
    };
    records.push(pending);
    writeLocal(records);
    const userId = await getUserId();
    if (!userId) return { record: pending, synced: false };
    try {
      const response = await fetch(`${apiBase}/api/users/${userId}/load-records`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercise_name: exerciseName, weight_kg: weight, workout_day: workoutDay })
      });
      if (!response.ok) return { record: pending, synced: false };
      const saved = await response.json();
      writeLocal(readLocal().filter((item) => item.local_id !== localId));
      return { record: saved, synced: true };
    } catch { return { record: pending, synced: false }; }
  };
  const trainingStorageKey = `aoldeya-training-days-${activeUserName}`;
  const readLocalTraining = () => {
    try {
      const value = JSON.parse(localStorage.getItem(trainingStorageKey) || "[]");
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  };
  const writeLocalTraining = (items) => {
    try { localStorage.setItem(trainingStorageKey, JSON.stringify(items)); } catch { /* Keep the entry in memory for this session. */ }
  };
  const getTrainingDays = async (month) => {
    const local = readLocalTraining().filter((item) => item.trained_on.startsWith(month));
    const userId = await getUserId();
    if (!userId) return local;
    try {
      const response = await fetch(`${apiBase}/api/users/${userId}/training-days?month=${encodeURIComponent(month)}`);
      if (!response.ok) return local;
      const remote = await response.json();
      const pending = readLocalTraining().filter((item) => !item.synced);
      const uploaded = [];
      const remaining = [];
      for (const item of pending) {
        try {
          const savedResponse = await fetch(`${apiBase}/api/users/${userId}/training-days`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trained_on: item.trained_on, workout_name: item.workout_name, workout_day: item.workout_day, source: item.source })
          });
          if (savedResponse.ok) uploaded.push(await savedResponse.json());
          else remaining.push(item);
        } catch { remaining.push(item); }
      }
      writeLocalTraining(remaining);
      const byDate = new Map([...remote, ...uploaded, ...remaining].filter((item) => item.trained_on.startsWith(month)).map((item) => [item.trained_on, item]));
      return [...byDate.values()].sort((a, b) => a.trained_on.localeCompare(b.trained_on));
    } catch { return local; }
  };
  const saveTrainingDay = async ({ date, workoutName, workoutDay, source = "manual" }) => {
    const pending = {
      local_id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      trained_on: date, workout_name: workoutName || "Treino concluido",
      workout_day: workoutDay || null, source, synced: false
    };
    const local = readLocalTraining().filter((item) => item.trained_on !== date);
    local.push(pending);
    writeLocalTraining(local);
    const userId = await getUserId();
    if (!userId) return { record: pending, synced: false };
    try {
      const response = await fetch(`${apiBase}/api/users/${userId}/training-days`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trained_on: date, workout_name: pending.workout_name, workout_day: pending.workout_day, source })
      });
      if (!response.ok) return { record: pending, synced: false };
      const record = await response.json();
      writeLocalTraining(readLocalTraining().filter((item) => item.trained_on !== date));
      return { record, synced: true };
    } catch { return { record: pending, synced: false }; }
  };
  const renderChart = (svg, records) => {
    const points = sortRecords([...records]);
    if (!points.length) { svg.innerHTML = ""; return; }
    const width = 360, height = 170, left = 34, right = 12, top = 14, bottom = 28;
    const values = points.map((item) => Number(item.weight_kg));
    const min = Math.min(...values), max = Math.max(...values);
    const padding = Math.max((max - min) * 0.18, 1);
    const low = Math.max(0, min - padding), high = max + padding;
    const x = (index) => points.length === 1 ? (left + width - right) / 2 : left + index * (width - left - right) / (points.length - 1);
    const y = (value) => top + (high - value) / (high - low) * (height - top - bottom);
    const coords = points.map((item, index) => `${x(index)},${y(Number(item.weight_kg))}`);
    const guides = [0, 1, 2].map((index) => {
      const value = high - index * (high - low) / 2; const gy = y(value);
      return `<line x1="${left}" y1="${gy}" x2="${width - right}" y2="${gy}" class="chart-grid"/><text x="${left - 6}" y="${gy + 4}" text-anchor="end" class="chart-axis" style="font-size:9px;font-family:inherit">${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</text>`;
    }).join("");
    const dots = points.map((item, index) => `<circle cx="${x(index)}" cy="${y(Number(item.weight_kg))}" r="3.5" class="chart-dot"><title>${Number(item.weight_kg).toLocaleString("pt-BR")} kg em ${new Date(item.performed_at).toLocaleDateString("pt-BR")}</title></circle>`).join("");
    const labelStep = Math.max(1, Math.ceil(points.length / 6));
    const labels = points.map((item, index) => index % labelStep === 0 || index === points.length - 1 ? `<text x="${x(index)}" y="${height - 7}" text-anchor="middle" class="chart-axis" style="font-size:9px;font-family:inherit">${new Date(item.performed_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</text>` : "").join("");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.innerHTML = `${guides}<polyline points="${coords.join(" ")}" class="chart-line"/>${dots}${labels}`;
  };
  const groupByExercise = (records) => records.reduce((groups, item) => {
    (groups[item.exercise_name] ||= []).push(item); return groups;
  }, {});
  window.AoldeyaProgress = { getRecords, saveRecord, getUserId, renderChart, groupByExercise, getTrainingDays, saveTrainingDay };
})();