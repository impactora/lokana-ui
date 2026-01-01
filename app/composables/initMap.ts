// import L from "leaflet";
import artifactsData from "~/assets/data/artifactsData";

// STATE
let map: any;
let userLocation: { lat: number; lng: number } | null = null;
let markers: Record<string, any> = {};
let activeFilter = "all";
let searchQuery = "";

// MAIN FUNCTION
export default async function initMap() {
  if (typeof window === "undefined") return;

  renderArtifactList();

  const L = (await import("leaflet")).default;
  map = L.map("map").setView([-2.5489, 118.0149], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(map);

  addMuseumMarkers();
  requestGeolocation();
  initUI();
}

// LOGIC & GEOLOCATION
async function requestGeolocation() {
  const L = (await import("leaflet")).default;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        map.setView([userLocation.lat, userLocation.lng], 15);

        L.marker([userLocation.lat, userLocation.lng], {
          icon: L.divIcon({
            className: "user-location-marker",
            html: '<div style="width: 16px; height: 16px; background: #3B82F6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
            iconSize: [16, 16],
          }),
        })
          .addTo(map)
          .bindPopup("Your Location");

        updateLocationText("Location detected");
        addMuseumMarkers();
        renderArtifactList();
        hideLoading();
      },
      (error) => {
        updateLocationText("Showing All");
        addMuseumMarkers();
        renderArtifactList();
        hideLoading();
      },
    );
  } else {
    updateLocationText("Geolocation not supported");
    addMuseumMarkers();
    renderArtifactList();
    hideLoading();
  }
}

// EVENT LISTENER
function initUI() {
  const filterChips = document.querySelectorAll(".filter-chip");
  const searchInput = document.getElementById("searchInput");
  const mobileToggle = document.getElementById("mobileToggle");
  const sidebarHeader = document.querySelector(".sidebar-header");

  // Safety check
  if (!searchInput && filterChips.length === 0) return;

  filterChips.forEach((c) => {
    const chip = c as HTMLElement;
    chip.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-chip")
        .forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      activeFilter = chip.dataset.filter || "all";
      addMuseumMarkers();
      renderArtifactList();
    });
  });

  searchInput?.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    searchQuery = target.value;
    addMuseumMarkers();
    renderArtifactList();
  });

  mobileToggle?.addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar?.classList.toggle("open");
  });

  sidebarHeader?.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      const sidebar = document.getElementById("sidebar");
      sidebar?.classList.toggle("open");
    }
  });
}

// HELPER FUNCTION
function calculateDistance(lat1: any, lon1: any, lat2: any, lon2: any) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function addMuseumMarkers() {
  const L = (await import("leaflet")).default;

  Object.values(markers).forEach((marker) => {
    map.removeLayer(marker);
  });
  markers = {};

  const filteredArtifacts = getFilteredArtifacts();

  interface MuseumGroup {
    museum: any;
    artifacts: any;
  }

  const museumGroups: Record<string, MuseumGroup> = {};
  filteredArtifacts.forEach((artifact: any) => {
    const key = `${artifact.museum.lat}-${artifact.museum.lng}`;
    if (!museumGroups[key]) {
      museumGroups[key] = {
        museum: artifact.museum,
        artifacts: [],
      };
    }
    museumGroups[key].artifacts.push(artifact);
  });

  Object.entries(museumGroups).forEach(([key, data]) => {
    const customIcon = L.divIcon({
      className: "custom-marker-wrapper",
      html: `<div class="custom-marker ${data.artifacts.length > 1 ? "has-multiple" : ""}" data-count="${data.artifacts.length}"></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });

    const marker = L.marker([data.museum.lat, data.museum.lng], {
      icon: customIcon,
    }).addTo(map);

    // Popup showing all artifacts at this museum
    const popupContent = `
        <div class="min-w-[240px] max-w-[280px]">
            <div class="flex items-center gap-2 border-b border-gray-100 pb-3 mb-2">
                <span class="text-xl">🏛️</span>
                <div>
                    <h3 class="font-bold text-gray-900 text-sm leading-tight">
                        ${data.museum.name}
                    </h3>
                    <p class="text-[10px] text-gray-500 mt-0.5">
                        ${data.museum.province || "Lokasi Museum"}
                    </p>
                </div>
            </div>

            <div>
                <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">
                    Koleksi di sini (${data.artifacts.length})
                </div>

                <div class="flex flex-col gap-1 max-h-[220px] overflow-y-auto pr-1">
                    ${data.artifacts
                      .map(
                        (artifact: any) => `
                        <div
                            class="group flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-50 cursor-pointer transition-all border border-transparent hover:border-emerald-100"
                            onclick="highlightArtifactCard(${artifact.id})"
                        >
                            <div class="relative w-10 h-10 shrink-0 overflow-hidden rounded-md bg-gray-100 shadow-sm">
                                <img
                                    src="${artifact.image}"
                                    alt="${artifact.name}"
                                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                >
                            </div>

                            <div class="flex flex-col min-w-0">
                                <div class="text-xs font-semibold text-gray-800 truncate group-hover:text-emerald-700">
                                    ${artifact.name}
                                </div>
                                <div class="text-[10px] text-gray-500 truncate mt-0.5">
                                    <span class="bg-gray-100 px-1 rounded text-gray-600 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                                        ${artifact.type.toUpperCase()}
                                    </span>
                                    <span class="mx-1">•</span>
                                    ${artifact.period}
                                </div>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        </div>
    `;

    marker.bindPopup(popupContent, { maxWidth: 320 });
    markers[key] = marker;
  });
}

function renderArtifactList() {
  const listContainer = document.getElementById("artifactList");
  const statsInfo = document.getElementById("statsInfo");
  const filteredArtifacts = getFilteredArtifacts();

  if (!listContainer || !statsInfo) return;

  // Calculate distances and sort
  const artifactsWithDistance = filteredArtifacts.map((artifact) => {
    const distance = userLocation
      ? calculateDistance(
          userLocation.lat,
          userLocation.lng,
          artifact.museum.lat,
          artifact.museum.lng,
        )
      : null;
    return { ...artifact, distance };
  });

  artifactsWithDistance.sort((a, b) => {
    if (!a.distance) return 1;
    if (!b.distance) return -1;
    return a.distance - b.distance;
  });

  // Update stats
  statsInfo.innerHTML = `
        <span><span class="stats-number">${artifactsWithDistance.length}</span> peninggalan ditemukan</span>
        <span id="locationText">${userLocation ? "Terdekat dulu" : "Semua lokasi"}</span>
    `;

  // Render cards
  listContainer.innerHTML = artifactsWithDistance
    .map(
      (artifact) => `
          <div
              class="group relative flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
              data-id="${artifact.id}"
              onclick="window.focusOnArtifact(${artifact.id})"
          >
              <div class="flex gap-4">
                  <div class="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                      <img
                          src="${artifact.image}"
                          alt="${artifact.name}"
                          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      >
                  </div>

                  <div class="flex flex-col flex-1 min-w-0 justify-between py-0.5">
                      <div>
                          <h3 class="font-bold text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors line-clamp-2">
                              ${artifact.name}
                          </h3>
                      </div>

                      <div class="flex flex-wrap gap-1.5 mt-1">
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wide">
                              ${artifact.type}
                          </span>
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                              ${artifact.period}
                          </span>
                      </div>
                  </div>
              </div>

              <p class="text-xs text-gray-600 leading-relaxed line-clamp-4 border-b border-dashed border-gray-100 pb-3">
                  ${artifact.description}
              </p>

              <div class="flex items-center justify-between gap-2 mt-auto">
                  <div class="flex items-center gap-2 min-w-0">
                      <span class="text-lg shrink-0">🏛️</span>
                      <div class="flex flex-col min-w-0">
                          <span class="text-[10px] font-bold text-gray-900 truncate">
                              ${artifact.museum.name}
                          </span>
                          <span class="text-[10px] text-emerald-600 font-medium truncate flex items-center gap-1">
                              ${
                                artifact.distance
                                  ? `<span class="w-1 h-1 rounded-full bg-emerald-500"></span> ${artifact.distance.toFixed(1)} km`
                                  : `<span class="w-1 h-1 rounded-full bg-gray-400"></span> ${artifact.museum.province}`
                              }
                          </span>
                      </div>
                  </div>

                  <button
                      class="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-95 z-10"
                      onclick="window.showMuseumOnMap(${artifact.id}); event.stopPropagation();"
                  >
                      LIHAT PETA
                  </button>
              </div>
          </div>
      `,
    )
    .join("");
}

function updateLocationText(text: string) {
  const elem = document.getElementById("locationText");
  if (elem) elem.textContent = `$${text}`;
}

function getFilteredArtifacts() {
  return artifactsData.filter((artifact) => {
    const matchesFilter =
      activeFilter === "all" || artifact.type === activeFilter;
    const matchesSearch =
      searchQuery === "" ||
      artifact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artifact.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artifact.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artifact.origin.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
}

export function focusOnArtifact(id: any) {
  const artifact = artifactsData.find((a) => a.id === id);
  if (artifact) {
    showMuseumOnMap(id);
    highlightArtifactCard(id);
  }
}

export function showMuseumOnMap(artifactId: any) {
  const artifact = artifactsData.find((a) => a.id === artifactId);
  if (artifact) {
    map.setView([artifact.museum.lat, artifact.museum.lng], 14);

    const key = `${artifact.museum.lat}-${artifact.museum.lng}`;
    const marker = markers[key];

    if (marker) {
      marker.openPopup();
    }
  }
}

if (typeof window !== "undefined") {
  (window as any).showMuseumOnMap = showMuseumOnMap;
  (window as any).focusOnArtifact = focusOnArtifact;
  (window as any).highlightArtifactCard = highlightArtifactCard;
}

function highlightArtifactCard(id: any) {
  document.querySelectorAll(".artifact-card").forEach((card) => {
    card.classList.remove("active");
  });

  const activeCard = document.querySelector(`[data-id="${id}"]`);
  if (activeCard) {
    activeCard.classList.add("active");
    activeCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function hideLoading() {
  const loading = document.getElementById("loading");
  if (loading) loading.style.display = "none";
}
