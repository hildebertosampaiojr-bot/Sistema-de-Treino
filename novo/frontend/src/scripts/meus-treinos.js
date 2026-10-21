(() => {
const { dayNames, activeUserName, apiBase } = Aoldeya;
const progress = window.AoldeyaProgress;
let loadRecords = [];
const list = document.querySelector("#exercise-list");
const dayButtons = [...document.querySelectorAll(".day-button")];
const dialog = document.querySelector("#exercise-dialog");
const placeholderImage = "../assets/exercise-placeholder.svg";
const imageBase = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
const dashboardUrl = `dashboard.html?usuario=${encodeURIComponent(activeUserName)}`;
document.querySelector(".workouts-topbar .avatar-initial").textContent = activeUserName[0];
document.querySelectorAll('a[href="dashboard.html"]').forEach((link) => { link.href = dashboardUrl; });

// IDs verificados no Free Exercise DB; as imagens do catálogo estão sob Unlicense.
const imageIds = {
  "supino reto com barra": "Barbell_Bench_Press_-_Medium_Grip",
  "supino inclinado com halteres": "Incline_Dumbbell_Press",
  "supino máquina": "Machine_Bench_Press",
  "crucifixo no crossover": "Cable_Crossover",
  "peck deck": "Butterfly",
  "rosca direta com barra w": "Barbell_Curl",
  "rosca alternada com halteres": "Alternate_Incline_Dumbbell_Curl",
  "rosca alternada": "Alternate_Incline_Dumbbell_Curl",
  "rosca martelo": "Hammer_Curls",
  "rosca scott": "Preacher_Curl",
  "tríceps testa com barra w": "Lying_Triceps_Press",
  "tríceps corda na polia": "Triceps_Pushdown_-_Rope_Attachment",
  "tríceps francês": "Standing_Overhead_Barbell_Triceps_Extension",
  "tríceps unilateral na polia": "Cable_One_Arm_Tricep_Extension",
  "barra fixa ou puxada alta": "Pullups",
  "puxada alta na frente": "Wide-Grip_Lat_Pulldown",
  "remada curvada com barra": "Bent_Over_Barbell_Row",
  "remada baixa": "Seated_Cable_Rows",
  "remada unilateral com halter": "One-Arm_Dumbbell_Row",
  "remada unilateral": "One-Arm_Dumbbell_Row",
  "pulldown com braços estendidos": "Straight-Arm_Pulldown",
  "crucifixo inverso": "Reverse_Flyes",
  "agachamento livre": "Barbell_Squat",
  "agachamento com peso corporal": "Bodyweight_Squat",
  "leg press 45°": "Leg_Press",
  "cadeira extensora": "Leg_Extensions",
  "agachamento búlgaro": "Split_Squat_with_Dumbbells",
  "desenvolvimento com halteres": "Dumbbell_Shoulder_Press",
  "elevação lateral": "Side_Lateral_Raise",
  "elevação lateral na polia": "Cable_Seated_Lateral_Raise",
  "stiff com barra": "Stiff-Legged_Barbell_Deadlift",
  "stiff com halteres": "Stiff-Legged_Dumbbell_Deadlift",
  "mesa flexora": "Lying_Leg_Curls",
  "cadeira flexora": "Lying_Leg_Curls",
  "elevação pélvica": "Barbell_Hip_Thrust",
  "elevação pélvica com barra": "Barbell_Hip_Thrust",
  "glúteo no cabo (coice)": "Glute_Kickback",
  "rosca de punho": "Seated_Palms-Up_Barbell_Wrist_Curl",
  "rosca de punho inversa": "Seated_Palms-Down_Barbell_Wrist_Curl",
  "flexão de braços": "Pushups",
  "prancha abdominal": "Plank",
  "mountain climber": "Mountain_Climbers"
};
const normalized = (text) => text.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const findImageId = (name) => Object.entries(imageIds).find(([key]) => normalized(key) === normalized(name))?.[1];
const getImage = (name) => {
  const id = findImageId(name);
  return id ? `${imageBase}${encodeURIComponent(id)}/0.jpg` : placeholderImage;
};
const directionsFor = (name) => {
  const exercise = normalized(name);
  if (exercise.includes("supino") || exercise.includes("bench press")) return "Deite-se no banco com os pés apoiados e as costas estáveis. Desça a carga em direção ao peito com controle e empurre até estender os braços sem travar os cotovelos.";
  if (exercise.includes("crossover") || exercise.includes("peck deck") || exercise.includes("crucifixo")) return "Mantenha o peito aberto e os cotovelos levemente flexionados. Feche os braços à frente do corpo, contraindo o peitoral, e retorne devagar até sentir um alongamento confortável.";
  if (exercise.includes("rosca")) return "Mantenha os cotovelos próximos ao tronco. Flexione os braços para subir a carga sem balançar o corpo e desça devagar até quase estender os cotovelos.";
  if (exercise.includes("triceps")) return "Estabilize os cotovelos junto à posição indicada pelo exercício. Estenda os braços contra a resistência sem movimentar os ombros e volte devagar à posição inicial.";
  if (exercise.includes("barra fixa") || exercise.includes("puxada") || exercise.includes("pulldown")) return "Segure a barra com firmeza e mantenha o tronco estável. Puxe levando os cotovelos para baixo até a barra chegar à parte alta do peito; retorne com controle.";
  if (exercise.includes("remada")) return "Estabilize o tronco e mantenha a coluna neutra. Puxe a carga em direção ao abdômen, aproximando as escápulas, e estenda os braços novamente sem deixar o peso despencar.";
  if (exercise.includes("agachamento")) return "Afaste os pés aproximadamente na largura dos ombros. Leve o quadril para trás e para baixo, mantendo os joelhos alinhados com os pés; suba empurrando o chão e mantendo o tronco firme.";
  if (exercise.includes("leg press")) return "Apoie as costas no encosto e posicione os pés na plataforma. Desça até uma amplitude confortável sem tirar o quadril do banco e empurre sem travar os joelhos.";
  if (exercise.includes("extensora")) return "Ajuste o encosto e o apoio sobre a parte inferior das pernas. Estenda os joelhos de forma controlada, faça uma breve contração e retorne sem deixar a carga cair.";
  if (exercise.includes("stiff")) return "Mantenha os joelhos levemente flexionados e a coluna neutra. Leve o quadril para trás enquanto a carga desce próxima às pernas; suba contraindo glúteos e posteriores.";
  if (exercise.includes("flexora")) return "Ajuste o equipamento para que o apoio fique próximo aos tornozelos. Flexione os joelhos contraindo a parte posterior das coxas e retorne devagar à posição inicial.";
  if (exercise.includes("pélvica") || exercise.includes("hip thrust")) return "Apoie a parte superior das costas no banco e mantenha os pés firmes no chão. Eleve o quadril contraindo os glúteos, sem arquear a lombar, e desça com controle.";
  if (exercise.includes("coice")) return "Estabilize o tronco e mantenha o abdômen contraído. Leve uma perna para trás sem girar o quadril nem arquear a lombar; retorne devagar e repita do outro lado.";
  if (exercise.includes("abdutora")) return "Sente-se com a coluna apoiada e os joelhos posicionados nas almofadas. Afaste as pernas contra a resistência, faça uma breve contração e retorne lentamente.";
  if (exercise.includes("punho")) return "Apoie os antebraços e movimente apenas os punhos. Flexione ou estenda conforme a variação, faça o movimento sem impulso e retorne à posição inicial.";
  if (exercise.includes("prancha")) return "Apoie os antebraços e as pontas dos pés no chão. Mantenha o corpo alinhado, o abdômen contraído e respire sem deixar o quadril cair ou subir demais.";
  if (exercise.includes("flexao")) return "Comece com as mãos apoiadas um pouco além da largura dos ombros e o corpo alinhado. Desça o peito com controle e empurre o chão para voltar, mantendo o abdômen firme.";
  if (exercise.includes("polichinelo")) return "Comece em pé com os pés juntos e os braços ao lado do corpo. Salte abrindo as pernas enquanto eleva os braços; salte novamente para retornar, mantendo um ritmo confortável.";
  if (exercise.includes("mountain climber")) return "Na posição de prancha alta, mantenha as mãos sob os ombros e o tronco firme. Alterne trazendo um joelho de cada vez em direção ao peito, sem levantar o quadril.";
  if (exercise.includes("caminhada") || exercise.includes("bicicleta")) return "Escolha um ritmo leve a moderado que permita manter a postura e a respiração controladas durante todo o período previsto.";
  if (exercise.includes("mobilidade")) return "Faça os movimentos lentamente, explorando uma amplitude confortável e sem forçar a articulação. Mantenha a respiração contínua e interrompa se houver dor.";
  if (exercise.includes("alongamento")) return "Entre na posição gradualmente até sentir uma tensão leve, sem dor. Mantenha a respiração tranquila e evite movimentos bruscos ou balanços.";
  return "Prepare a posição com estabilidade, execute cada repetição sem impulso e controle também a volta à posição inicial. Use uma amplitude confortável e mantenha a respiração contínua.";
};

const seedProfile = window.AoldeyaWorkoutSeed?.profiles?.[activeUserName] || {};
let workoutsByDay = seedProfile;
const openDescription = (exercise, workout) => {
  const hasCatalogImage = Boolean(findImageId(exercise.name));
  document.querySelector("#exercise-dialog-title").textContent = exercise.name;
  document.querySelector("#exercise-dialog-category").textContent = workout.name;
  document.querySelector("#exercise-dialog-summary").textContent = `${exercise.sets} séries · ${exercise.reps} repetições${exercise.rest_seconds ? ` · descanso ${exercise.rest_seconds}s` : ""}`;
  document.querySelector("#exercise-dialog-description").textContent = directionsFor(exercise.name);
  document.querySelector(".exercise-dialog-credit").hidden = !hasCatalogImage;
  document.querySelector("#exercise-dialog-image").src = getImage(exercise.name);
  document.querySelector("#exercise-dialog-image").onerror = (event) => { event.currentTarget.onerror = null; event.currentTarget.src = placeholderImage; };
  dialog.showModal();
};
const latestLoadFor = (exerciseName) => loadRecords.filter((record) => normalized(record.exercise_name) === normalized(exerciseName)).at(-1)?.weight_kg || "";
const renderDay = (day) => {
  const workout = workoutsByDay[day];
  const exercises = workout?.exercises || [];
  dayButtons.forEach((button) => {
    const selected = button.dataset.day === day;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  document.querySelector("#selected-day-label").textContent = dayNames[day];
  document.querySelector("#selected-workout-title").textContent = workout?.name || "Dia de descanso";
  document.querySelector("#exercise-count").textContent = exercises.length ? `${exercises.length} exercícios` : "Descanso";
  document.querySelector("#rest-card").hidden = exercises.length > 0;
  list.hidden = exercises.length === 0;
  list.innerHTML = exercises.map((exercise, index) => {
    const details = `${exercise.sets} x ${exercise.reps}${exercise.rest_seconds ? ` - descanso ${exercise.rest_seconds}s` : ""}`;
    const src = getImage(exercise.name);
    return `<article class="exercise-row"><span class="exercise-number">${index + 1}</span><button class="exercise-open" type="button" data-exercise-index="${index}" aria-label="Ver descrição de ${exercise.name}"><img class="exercise-thumb" src="${src}" alt="Demonstração de ${exercise.name}" loading="lazy" onerror="this.onerror=null;this.src='${placeholderImage}'"/><span class="exercise-copy"><strong>${exercise.name}</strong><small>${details}</small></span></button><div class="exercise-actions"><label class="load-entry"><input class="exercise-load" type="number" min="0.1" max="1000" step="0.5" placeholder="kg" value="${latestLoadFor(exercise.name)}" aria-label="Carga usada em ${exercise.name}, em quilogramas" /><span>kg</span></label><span class="load-status" aria-live="polite"></span><button class="exercise-done" type="button" aria-label="Marcar ${exercise.name} como concluído" aria-pressed="false"><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg></button></div></article>`;
  }).join("");
  document.querySelector(".finish-workout").hidden = exercises.length === 0;
};

const requestedDay = new URLSearchParams(window.location.search).get("dia");
let selectedDay = Object.hasOwn(dayNames, requestedDay) ? requestedDay : "seg";
dayButtons.forEach((button) => button.addEventListener("click", () => { selectedDay = button.dataset.day; renderDay(selectedDay);
 }));
renderDay(selectedDay);
progress.getRecords().then((records) => { loadRecords = records; renderDay(selectedDay); });
document.querySelector("#exercise-dialog-close").addEventListener("click", () => dialog.close());
list.addEventListener("change", async (event) => {
  const input = event.target.closest(".exercise-load");
  if (!input) return;
  const weight = Number(input.value.replace(",", "."));
  const status = input.closest(".exercise-actions").querySelector(".load-status");
  if (!Number.isFinite(weight) || weight < 0.1 || weight > 1000) { status.textContent = "Informe kg"; return; }
  const exercise = workoutsByDay[selectedDay]?.exercises[Number(input.closest(".exercise-row").querySelector(".exercise-open").dataset.exerciseIndex)];
  if (!exercise) return;
  status.textContent = "Salvando";
  const result = await progress.saveRecord({ exerciseName: exercise.name, weight, workoutDay: selectedDay });
  loadRecords.push(result.record);
  loadRecords.sort((a, b) => new Date(a.performed_at) - new Date(b.performed_at));
  input.closest(".load-entry").classList.toggle("is-saved", result.synced);
  input.closest(".load-entry").classList.toggle("is-local", !result.synced);
  status.textContent = result.synced ? "Salvo" : "Salvo neste dispositivo";
});

list.addEventListener("click", (event) => {
  const check = event.target.closest(".exercise-done");
  if (event.target.closest(".exercise-load")) return;
  if (check) {
    const done = check.getAttribute("aria-pressed") === "true";
    check.setAttribute("aria-pressed", String(!done));
    check.closest(".exercise-row").classList.toggle("is-done", !done);
    return;
  }
  const openButton = event.target.closest(".exercise-open");
  if (openButton) openDescription(workoutsByDay[selectedDay].exercises[Number(openButton.dataset.exerciseIndex)], workoutsByDay[selectedDay]);
});

fetch(`${apiBase}/api/users`)
  .then((response) => response.ok ? response.json() : [])
  .then(async (users) => {
    const user = users.find((item) => item.name === activeUserName);
    if (!user) return;
    const response = await fetch(`${apiBase}/api/users/${user.id}/workouts`);
    if (!response.ok) return;
    const rows = await response.json();
    if (!rows.length) return;
    const databasePlan = {};
    rows.forEach((row) => {
      databasePlan[row.day_of_week] ||= { name: row.workout_name, exercises: [] };
      if (row.exercise_name) databasePlan[row.day_of_week].exercises.push({
        name: row.exercise_name, sets: row.sets, reps: row.reps, rest_seconds: row.rest_seconds, exercise_id: row.exercise_id
      });
    });
    workoutsByDay = databasePlan;
    renderDay(selectedDay);

  })
  .catch(() => {});

document.querySelector(".finish-workout")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const result = await progress.saveTrainingDay({ date, workoutName: workoutsByDay[selectedDay]?.name || "Treino concluido", workoutDay: selectedDay, source: "completed" });
  button.textContent = result.synced ? "Treino registrado" : "Treino salvo neste dispositivo";
  button.classList.add("completed");
});
})();
