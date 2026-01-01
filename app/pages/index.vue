<script setup lang="ts">
import { onMounted } from "vue";
import initMap from "~/composables/initMap";

onMounted(async () => {
    await initMap();
});
</script>

<template>
    <div class="h-full flex relative">
        <!-- <aside
            id="sidebar"
            class="w-80 h-full overflow-y-auto shrink-0 bg-white p-4 rounded-lg shadow z-10"
        >
            <div id="loading">Loading...</div>
            <div id="artifactList" class="flex flex-col gap-4"></div>
        </aside> -->

        <div id="map" class="flex-1 h-full rounded-lg z-0"></div>
    </div>
</template>
