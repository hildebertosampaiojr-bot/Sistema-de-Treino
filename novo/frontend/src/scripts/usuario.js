(() => {
const profileCards = [...document.querySelectorAll(".profile-card")];
let selectedProfile = profileCards.find((card) => card.dataset.user === Aoldeya.activeUserName) || profileCards[0];

const selectProfile = (selectedCard) => {
  profileCards.forEach((card) => {
    const isSelected = card === selectedCard;
    card.classList.toggle("selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });
  selectedProfile = selectedCard;
  document.body.classList.toggle("profile-pink", selectedCard.dataset.user === "Gabriella");
};

if (selectedProfile) selectProfile(selectedProfile);
profileCards.forEach((card) => card.addEventListener("click", () => selectProfile(card)));

document.querySelector(".enter-button")?.addEventListener("click", () => {
  if (!selectedProfile) return;
  const user = selectedProfile.dataset.user;
  try { localStorage.setItem("aoldeya-user", user); } catch { /* o perfil também segue na URL */ }
  window.location.href = `dashboard.html?usuario=${encodeURIComponent(user)}`;
});
})();
