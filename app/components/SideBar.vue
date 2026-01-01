<script setup lang="ts">
import { ref } from "vue";

const filter = [
    "Semua",
    "Arca",
    "Prasasti",
    "Senjata",
    "Tekstil",
    "Keramik",
    "Fosil",
    "Perhiasan",
    "Manuskrip",
    "Alat Musik",
    "Lainnya",
];
const search = ref("");
</script>

<template>
    <div class="flex flex-col gap-4 h-full">
        <!-- Title -->
        <div class="flex flex-col gap-4 shrink-0">
            <div class="flex flex-col gap-4">
                <h1 class="text-lg font-bold">
                    <span class="text-black"> Jelajahi </span>
                    <span class="text-[#FF0000]"> Peninggalan Budaya </span>
                </h1>
                <p>
                    Temukan artefak, arca, prasasti, dan koleksi bersejarah
                    Indonesia
                </p>
            </div>

            <div class="flex flex-col gap-4">
                <UInput
                    id="searchInput"
                    v-model="search"
                    icon="i-heroicons-magnifying-glass-20-solid"
                    placeholder="Cari peninggalan..."
                    class="w-full"
                    :ui="{ base: 'bg-background text-black' }"
                />
                <div class="flex flex-wrap gap-2">
                    <UButton
                        v-for="item in filter"
                        :key="item"
                        class="mr-1 filter-chip cursor-pointer flex-1"
                        :data-filter="
                            item === 'Semua' ? 'all' : item.toLowerCase()
                        "
                        variant="soft"
                    >
                        {{ item }}
                    </UButton>
                </div>
            </div>
            <USeparator />
        </div>

        <!-- Content -->
        <div class="flex flex-col gap-4 flex-1 min-h-0">
            <div
                id="statsInfo"
                class="bg-[#E0DDD5] p-5 flex justify-between text-xs rounded-xl"
            >
                Loading stats...
            </div>

            <div
                id="artifactList"
                class="flex flex-col gap-4 overflow-y-auto pr-2"
            ></div>
        </div>
    </div>
</template>
