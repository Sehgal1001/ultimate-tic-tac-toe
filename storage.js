// Reads and writes local game statistics safely.
const Storage = {
  key: "playroom-ultimate-tic-tac-toe-v1",
  defaults() { return { wins: 0, losses: 0, draws: 0, history: [] }; },
  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.key));
      return saved && typeof saved === "object" ? { ...this.defaults(), ...saved } : this.defaults();
    } catch { return this.defaults(); }
  },
  save(data) {
    try { localStorage.setItem(this.key, JSON.stringify(data)); }
    catch (error) { console.warn("Could not save game data:", error); }
  },
  clear() { localStorage.removeItem(this.key); }
};
