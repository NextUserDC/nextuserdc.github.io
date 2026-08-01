const STORAGE_KEY = 'nextedit_projects';
const MAX_RECENT = 12;

export function getProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveProject(project) {
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = { ...projects[idx], ...project, updatedAt: Date.now() };
  } else {
    projects.unshift({ ...project, createdAt: Date.now(), updatedAt: Date.now() });
  }
  if (projects.length > MAX_RECENT) projects.length = MAX_RECENT;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function deleteProject(id) {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
