<template>
  <h2 class="text-center">Поиск недвижимости</h2>
  <div class="mb-3">
    <input v-model="filters.titleSearch" @input="handleSearch" class="form-control" placeholder="Введите название..">
  </div>
  <div class="row">
    <aside class="col-md-3 sidebar">
      <form @submit.prevent="handleSearch">
        <div class="mb-3">
          <label class="form-label">Тип недвижимости</label>
          <select v-model="filters.propertyType" class="form-select">
            <option value="">Все</option>
            <option value="Квартира">Квартира</option>
            <option value="Дом">Дом</option>
          </select>
        </div>
        <fieldset class="mb-3">
          <legend class="form-label">Количество комнат</legend>
          <div v-for="room in ['1', '2', '3', '4']" :key="room">
            <input type="checkbox" :id="'room' + room" :value="room" v-model="filters.rooms">
            <label :for="'room' + room">{{ room === '4' ? '4+' : room }}</label>
          </div>
        </fieldset>
        <div class="mb-3">
          <label class="form-label">Расположение</label>
          <input v-model="filters.location" class="form-control" placeholder="Введите город или район">
        </div>
        <div class="mb-3 slider-container">
          <label class="form-label">Диапазон цены</label>
          <div ref="sliderEl"></div>
          <input :value="filters.minPrice" readonly class="form-control mt-2" placeholder="Мин">
          <input :value="filters.maxPrice" readonly class="form-control mt-2" placeholder="Макс">
        </div>
        <div class="mb-3">
          <label class="form-label">Сортировка</label>
          <select v-model="filters.sortBy" class="form-select">
            <option value="price_Asc">По умолчанию</option>
            <option value="price_Asc">По цене (возрастание)</option>
            <option value="price_Desc">По цене (убывание)</option>
            <option value="roomCount_Asc">По комнатам (возрастание)</option>
            <option value="roomCount_Desc">По комнатам (убывание)</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Найти</button>
      </form>
    </aside>

    <section class="col-md-9 results-container">
      <p v-if="loading">Загрузка...</p>
      <p v-else-if="error">Ошибка при загрузке данных.</p>
      <p v-else-if="results.length === 0">Ничего не найдено.</p>
      <div v-for="property in results" :key="property.id" class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">
            <router-link :to="`/property/${property.id}`">{{ property.title }}</router-link>
          </h5>
          <p class="card-text"><strong>Цена:</strong> {{ property.price }} ₽/мес</p>
          <p class="card-text"><strong>Расположение:</strong> {{ property.location }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import { useProperties } from '@/composables/useProperties';

const { results, loading, error, search } = useProperties();
const sliderEl = ref(null);

const filters = reactive({
    titleSearch: '', propertyType: '', location: '', rooms: [],
    minPrice: 15000, maxPrice: 55000, sortBy: 'price_Asc'
});

function handleSearch() {
    search(filters);
}

onMounted(() => {
    noUiSlider.create(sliderEl.value, {
        start: [15000, 55000],
        connect: true,
        range: { min: 0, max: 200000 }
    });

    sliderEl.value.noUiSlider.on('update', (values) => {
        filters.minPrice = Math.round(values[0]);
        filters.maxPrice = Math.round(values[1]);
    });

    handleSearch(); // initial load, matches old DOMContentLoaded behavior
});
</script>