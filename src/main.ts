import "./style.css";

// 1. Definisi tipe untuk satu tugas
interface Todo {
  id: number;
  teks: string;
  selesai: boolean;
}

type FilterStatus = "semua" | "aktif" | "selesai";

// 2. State
let todos: Todo[] = muatDariStorage();
let filterAktif: FilterStatus = "semua";

// 3. Ambil elemen DOM
const form = document.getElementById("todo-form") as HTMLFormElement;
const input = document.getElementById("todo-input") as HTMLInputElement;
const list = document.getElementById("todo-list") as HTMLUListElement;
const sisaTugasEl = document.getElementById("sisa-tugas") as HTMLParagraphElement;
const tombolHapusSelesai = document.getElementById(
  "hapus-selesai"
) as HTMLButtonElement;
const tombolFilter = document.querySelectorAll<HTMLButtonElement>(
  "#filter-bar button"
);

// ---------- Penyimpanan (localStorage) ----------
const KUNCI_STORAGE = "todos";

function simpanKeStorage(): void {
  localStorage.setItem(KUNCI_STORAGE, JSON.stringify(todos));
}

function muatDariStorage(): Todo[] {
  try {
    const data = localStorage.getItem(KUNCI_STORAGE);
    if (!data) return [];
    const hasil = JSON.parse(data);
    if (!Array.isArray(hasil)) return [];
    return hasil.filter(
      (item): item is Todo =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "number" &&
        typeof item.teks === "string" &&
        typeof item.selesai === "boolean"
    );
  } catch {
    return [];
  }
}

// ---------- Logika aplikasi ----------
function tambahTodo(teks: string): void {
  const todoBaru: Todo = {
    id: Date.now(),
    teks: teks,
    selesai: false,
  };
  todos.push(todoBaru);
  simpanKeStorage();
  render();
}

function ubahStatus(id: number): void {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, selesai: !todo.selesai } : todo
  );
  simpanKeStorage();
  render();
}

function hapusTodo(id: number): void {
  todos = todos.filter((todo) => todo.id !== id);
  simpanKeStorage();
  render();
}

function editTodo(id: number, teksBaru: string): void {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, teks: teksBaru } : todo
  );
  simpanKeStorage();
  render();
}

function hapusSemuaSelesai(): void {
  todos = todos.filter((todo) => !todo.selesai);
  simpanKeStorage();
  render();
}

// Bonus: cari tugas berdasarkan kata kunci
function cariTodo(kata: string): Todo[] {
  const kunci = kata.toLowerCase();
  return todos.filter((todo) => todo.teks.toLowerCase().includes(kunci));
}
void cariTodo; // tersedia untuk dipakai/di-test manual di console

// ---------- Tampilan ----------
function render(): void {
  list.innerHTML = "";

  const todosTampil = todos.filter((todo) => {
    if (filterAktif === "aktif") return !todo.selesai;
    if (filterAktif === "selesai") return todo.selesai;
    return true;
  });

  todosTampil.forEach((todo) => {
    const li = document.createElement("li");
    li.className = todo.selesai ? "todo-item selesai" : "todo-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.selesai;
    checkbox.addEventListener("change", () => ubahStatus(todo.id));

    const span = document.createElement("span");
    span.className = "teks";
    span.textContent = todo.teks;

    const tombolEdit = document.createElement("button");
    tombolEdit.className = "edit";
    tombolEdit.textContent = "Edit";
    tombolEdit.addEventListener("click", () => {
      const teksBaru = prompt("Ubah tugas:", todo.teks);
      if (teksBaru !== null && teksBaru.trim() !== "") {
        editTodo(todo.id, teksBaru.trim());
      }
    });

    const tombolHapus = document.createElement("button");
    tombolHapus.className = "hapus";
    tombolHapus.textContent = "Hapus";
    tombolHapus.addEventListener("click", () => hapusTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(tombolEdit);
    li.appendChild(tombolHapus);
    list.appendChild(li);
  });

  const sisa = todos.filter((todo) => !todo.selesai).length;
  sisaTugasEl.textContent = `${sisa} tugas tersisa`;
}

// ---------- Event listeners ----------
form.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();
  const teks = input.value.trim();
  if (teks === "") return;
  tambahTodo(teks);
  input.value = "";
  input.focus();
});

tombolFilter.forEach((tombol) => {
  tombol.addEventListener("click", () => {
    filterAktif = tombol.dataset.filter as FilterStatus;
    tombolFilter.forEach((t) => t.classList.remove("aktif"));
    tombol.classList.add("aktif");
    render();
  });
});

tombolHapusSelesai.addEventListener("click", hapusSemuaSelesai);

// Tampilkan data saat halaman pertama dibuka
render();