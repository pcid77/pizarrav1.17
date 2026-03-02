const STORAGE_KEY = "infinite-board-v1";

const state = {
  boards: {},
  activeBoardId: null,
  viewport: { x: 0, y: 0, scale: 1 },
  connectMode: false,
  connectFrom: null,
};

const els = {
  boardName: document.getElementById("boardName"),
  addBoard: document.getElementById("addBoard"),
  boardList: document.getElementById("boardList"),
  workspace: document.getElementById("workspace"),
  canvas: document.getElementById("canvas"),
  connections: document.getElementById("connections"),
  nodeTemplate: document.getElementById("nodeTemplate"),
  connectMode: document.getElementById("connectMode"),
  toolButtons: [...document.querySelectorAll("[data-tool]")],
};

init();

function init() {
  load();
  if (!Object.keys(state.boards).length) createBoard("Proyecto principal");
  bindUI();
  renderBoards();
  renderBoard();
}

function bindUI() {
  els.addBoard.addEventListener("click", () => {
    const name = els.boardName.value.trim() || `Proyecto ${Object.keys(state.boards).length + 1}`;
    createBoard(name);
    els.boardName.value = "";
  });

  els.toolButtons.forEach((btn) => btn.addEventListener("click", () => addNode(btn.dataset.tool)));

  els.connectMode.addEventListener("click", () => {
    state.connectMode = !state.connectMode;
    state.connectFrom = null;
    els.connectMode.classList.toggle("active", state.connectMode);
  });

  let panning = false;
  let start = { x: 0, y: 0 };

  els.workspace.addEventListener("mousedown", (e) => {
    if (!e.shiftKey || e.target.closest(".node")) return;
    panning = true;
    start = { x: e.clientX - state.viewport.x, y: e.clientY - state.viewport.y };
    els.workspace.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", (e) => {
    if (!panning) return;
    state.viewport.x = e.clientX - start.x;
    state.viewport.y = e.clientY - start.y;
    applyViewport();
  });

  window.addEventListener("mouseup", () => {
    panning = false;
    els.workspace.style.cursor = "grab";
    save();
  });

  els.workspace.addEventListener("wheel", (e) => {
    e.preventDefault();
    const scaleDelta = e.deltaY > 0 ? -0.08 : 0.08;
    state.viewport.scale = Math.min(2.3, Math.max(0.35, state.viewport.scale + scaleDelta));
    applyViewport();
    save();
  });
}

function addNode(type) {
  const board = activeBoard();
  if (!board) return;

  const id = crypto.randomUUID();
  const base = {
    id,
    type,
    x: 140 + board.nodes.length * 20,
    y: 120 + board.nodes.length * 20,
    title: {
      note: "Nota",
      image: "Imagen",
      video: "Video",
      timeline: "Línea de tiempo",
    }[type],
    data: {},
  };

  if (type === "note") base.data.text = prompt("Escribe tu nota:", "Idea principal") || "";
  if (type === "image") base.data.url = prompt("URL de imagen:", "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800") || "";
  if (type === "video") base.data.url = prompt("URL de YouTube o Vimeo:", "https://www.youtube.com/watch?v=dQw4w9WgXcQ") || "";
  if (type === "timeline") {
    const raw = prompt("Eventos (separados por coma):", "Idea, Diseño, Desarrollo, Lanzamiento") || "";
    base.data.events = raw.split(",").map((s) => s.trim()).filter(Boolean);
  }

  board.nodes.push(base);
  save();
  renderBoard();
}

function renderBoards() {
  els.boardList.innerHTML = "";
  Object.values(state.boards).forEach((board) => {
    const li = document.createElement("li");
    if (board.id === state.activeBoardId) li.classList.add("active");

    const name = document.createElement("span");
    name.textContent = board.name;
    name.className = "name";
    name.onclick = () => {
      state.activeBoardId = board.id;
      save();
      renderBoards();
      renderBoard();
    };

    const remove = document.createElement("button");
    remove.textContent = "🗑";
    remove.onclick = () => {
      if (Object.keys(state.boards).length === 1) return;
      delete state.boards[board.id];
      if (state.activeBoardId === board.id) {
        state.activeBoardId = Object.keys(state.boards)[0];
      }
      save();
      renderBoards();
      renderBoard();
    };

    li.append(name, remove);
    els.boardList.append(li);
  });
}

function renderBoard() {
  const board = activeBoard();
  if (!board) return;
  els.canvas.innerHTML = "";
  els.connections.innerHTML = "";

  board.nodes.forEach((node) => {
    const el = els.nodeTemplate.content.firstElementChild.cloneNode(true);
    el.dataset.id = node.id;
    el.style.left = `${node.x}px`;
    el.style.top = `${node.y}px`;
    el.querySelector(".title").textContent = node.title;

    const content = el.querySelector(".content");
    if (node.type === "note") content.textContent = node.data.text || "";
    if (node.type === "image") content.innerHTML = `<img src="${node.data.url}" alt="Imagen" />`;
    if (node.type === "video") content.innerHTML = videoEmbed(node.data.url);
    if (node.type === "timeline") content.append(timeline(node.data.events || []));

    el.querySelector(".delete").addEventListener("click", () => {
      board.nodes = board.nodes.filter((n) => n.id !== node.id);
      board.connections = board.connections.filter((c) => c.from !== node.id && c.to !== node.id);
      save();
      renderBoard();
    });

    el.addEventListener("mousedown", (ev) => {
      if (ev.button !== 0) return;
      dragNode(ev, node);
    });

    el.addEventListener("click", () => {
      if (!state.connectMode) return;
      if (!state.connectFrom) {
        state.connectFrom = node.id;
        el.style.outline = "2px solid #7aa2ff";
      } else if (state.connectFrom !== node.id) {
        board.connections.push({ id: crypto.randomUUID(), from: state.connectFrom, to: node.id });
        state.connectFrom = null;
        save();
        renderBoard();
      }
    });

    els.canvas.append(el);
  });

  board.connections.forEach((conn) => drawConnection(conn, board));
  applyViewport();
}

function timeline(events) {
  const wrap = document.createElement("div");
  const track = document.createElement("div");
  track.className = "timeline-track";
  events.forEach((evt, i) => {
    const mark = document.createElement("div");
    mark.className = "timeline-event";
    mark.textContent = evt;
    mark.style.left = `${(i / Math.max(events.length - 1, 1)) * 100}%`;
    track.append(mark);
  });
  wrap.append(track);
  return wrap;
}

function videoEmbed(url = "") {
  if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v");
    return `<iframe height="150" src="https://www.youtube.com/embed/${id}" allowfullscreen></iframe><a href="${url}" target="_blank">Abrir video</a>`;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1].split("?")[0];
    return `<iframe height="150" src="https://www.youtube.com/embed/${id}" allowfullscreen></iframe><a href="${url}" target="_blank">Abrir video</a>`;
  }
  return `<a href="${url}" target="_blank">${url}</a>`;
}

function dragNode(ev, node) {
  ev.preventDefault();
  const board = activeBoard();
  const start = {
    x: ev.clientX - node.x * state.viewport.scale,
    y: ev.clientY - node.y * state.viewport.scale,
  };

  function onMove(e) {
    node.x = (e.clientX - start.x) / state.viewport.scale;
    node.y = (e.clientY - start.y) / state.viewport.scale;
    renderBoard();
  }

  function onUp() {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
    save();
  }

  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
}

function drawConnection(conn, board) {
  const from = board.nodes.find((n) => n.id === conn.from);
  const to = board.nodes.find((n) => n.id === conn.to);
  if (!from || !to) return;

  const x1 = from.x + 130;
  const y1 = from.y + 50;
  const x2 = to.x + 130;
  const y2 = to.y + 50;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("class", "connection-line");
  path.setAttribute("d", `M ${x1} ${y1} C ${x1 + 120} ${y1}, ${x2 - 120} ${y2}, ${x2} ${y2}`);
  els.connections.append(path);
}

function createBoard(name) {
  const id = crypto.randomUUID();
  state.boards[id] = { id, name, nodes: [], connections: [] };
  state.activeBoardId = id;
  save();
  renderBoards();
  renderBoard();
}

function activeBoard() {
  return state.boards[state.activeBoardId];
}

function applyViewport() {
  const t = `translate(${state.viewport.x}px, ${state.viewport.y}px) scale(${state.viewport.scale})`;
  els.canvas.style.transform = t;
  els.connections.style.transform = t;
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const parsed = JSON.parse(raw);
  state.boards = parsed.boards || {};
  state.activeBoardId = parsed.activeBoardId || null;
  state.viewport = parsed.viewport || state.viewport;
}

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      boards: state.boards,
      activeBoardId: state.activeBoardId,
      viewport: state.viewport,
    })
  );
}
