(() => {
  const { activeUserName } = Aoldeya;
  const progress = window.AoldeyaProgress;
  const select = document.querySelector("#exercise-filter");
  const chart = document.querySelector("#report-chart");
  const empty = document.querySelector("#report-empty");
  const history = document.querySelector("#load-history");
  document.querySelector(".avatar-initial").textContent = activeUserName[0];
  document.querySelectorAll('a[href="dashboard.html"]').forEach((link) => { link.href = `dashboard.html?usuario=${encodeURIComponent(activeUserName)}`; });
  document.querySelectorAll('a[href="meus-treinos.html"]').forEach((link) => { link.href = `meus-treinos.html?usuario=${encodeURIComponent(activeUserName)}`; });

  const formatDate = (date) => new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  const renderSelected = (records) => {
    const series = records.filter((item) => item.exercise_name === select.value);
    if (!series.length) {
      chart.removeAttribute("viewBox");
      chart.innerHTML = "";
      empty.hidden = false;
      document.querySelector("#record-count").textContent = "0";
      document.querySelector("#record-best").textContent = "—";
      document.querySelector("#record-change").textContent = "—";
      document.querySelector("#exercise-insight").textContent = "";
      return;
    }
    empty.hidden = true;
    progress.renderChart(chart, series);
    const first = Number(series[0].weight_kg);
    const latest = Number(series.at(-1).weight_kg);
    const best = Math.max(...series.map((item) => Number(item.weight_kg)));
    const delta = latest - first;
    const sign = delta > 0 ? "+" : "";
    document.querySelector("#record-count").textContent = String(series.length);
    document.querySelector("#record-best").textContent = `${best.toLocaleString("pt-BR")} kg`;
    document.querySelector("#record-change").textContent = `${sign}${delta.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg`;
    document.querySelector("#exercise-insight").textContent = `Primeiro registro: ${first.toLocaleString("pt-BR")} kg (${formatDate(series[0].performed_at)}). Registro mais recente: ${latest.toLocaleString("pt-BR")} kg (${formatDate(series.at(-1).performed_at)}).`;
  };

  progress.getRecords().then((records) => {
    if (!records.length) {
      empty.hidden = false;
      history.innerHTML = '<p class="history-empty">Nenhuma carga registrada ainda.</p>';
      return;
    }
    const groups = progress.groupByExercise(records);
    Object.keys(groups).sort((a, b) => a.localeCompare(b, "pt-BR")).forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.append(option);
    });
    select.value = records.at(-1).exercise_name;
    select.addEventListener("change", () => renderSelected(records));
    renderSelected(records);
    history.innerHTML = [...records].reverse().slice(0, 100).map((record) => `<article class="history-row"><div><strong>${record.exercise_name}</strong><small>${formatDate(record.performed_at)}${record.workout_day ? ` · ${record.workout_day.toUpperCase()}` : ""}</small></div><b>${Number(record.weight_kg).toLocaleString("pt-BR")} kg</b></article>`).join("");
    document.querySelector("#report-period").textContent = `${records.length} registros de carga · ${activeUserName}`;
  }).catch(() => {
    empty.hidden = false;
    history.innerHTML = '<p class="history-empty">Nao foi possivel carregar o historico agora.</p>';
  });
  document.querySelector("#print-report").addEventListener("click", () => window.print());
})();