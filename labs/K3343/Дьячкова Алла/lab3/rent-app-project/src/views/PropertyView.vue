<template>
  <article v-if="property" class="row">
    <section class="col-md-6">
      <div id="propertyCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
          <div v-for="(img, i) in images" :key="img" :class="['carousel-item', { active: i === 0 }]">
            <img :src="`/images/${img}`" class="d-block w-100" :alt="`Фото объекта: ${property.title}`">
          </div>
        </div>
        <template v-if="images.length > 1">
          <button class="carousel-control-prev" data-bs-target="#propertyCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon"></span>
          </button>
          <button class="carousel-control-next" data-bs-target="#propertyCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon"></span>
          </button>
        </template>
      </div>
    </section>

    <section class="col-md-6">
      <h2>{{ property.title }}</h2>
      <p><strong>Цена:</strong> {{ property.price?.toLocaleString() }} ₽/мес</p>
      <p><strong>Расположение:</strong> {{ property.location }}</p>
      <p><strong>Количество комнат:</strong> {{ property.roomCount }}</p>
      <p>{{ property.description }}</p>

      <router-link to="/search" class="btn btn-secondary mt-3">Назад к поиску</router-link>
      <button class="btn btn-primary mt-3" @click="onDialogClick">Диалог с арендодателем</button>
      <button class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#bookingModal">Заявка на бронь</button>
    </section>
  </article>
  <p v-else-if="error">{{ error }}</p>

  <!-- Booking Modal -->
  <div class="modal fade" id="bookingModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Забронировать недвижимость</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="onBookingSubmit">
            <div class="mb-3">
              <label class="form-label">Дата начала аренды</label>
              <input v-model="bookingForm.startDate" type="date" class="form-control" :min="dateLimits.startMin" :max="dateLimits.startMax" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Дата окончания аренды</label>
              <input v-model="bookingForm.endDate" type="date" class="form-control" :min="dateLimits.endMin" :max="dateLimits.endMax" required>
            </div>
            <button type="submit" class="btn btn-primary">Подтвердить</button>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Login Modal -->
  <div class="modal fade" id="loginModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Авторизация</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div v-if="loginError" class="alert alert-danger">{{ loginError }}</div>
          <form @submit.prevent="onLoginSubmit">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="loginForm.email" type="email" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Пароль</label>
              <input v-model="loginForm.password" type="password" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary">Войти</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Modal } from 'bootstrap';
import { useProperty } from '@/composables/useProperty';
import { useAuthStore } from '@/stores';

const props = defineProps({ id: String });
const router = useRouter();
const auth = useAuthStore();

const { property, error, book } = useProperty(props.id);

const images = computed(() => property.value?.images?.length ? property.value.images : ['none.png']);

const bookingForm = reactive({ startDate: '', endDate: '' });
const loginForm = reactive({ email: '', password: '' });
const loginError = ref('');
let pendingAction = null;

const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
const sixMonths = new Date(today); sixMonths.setMonth(today.getMonth() + 6);
const sixMonthsTmr = new Date(tomorrow); sixMonthsTmr.setMonth(tomorrow.getMonth() + 6);

const dateLimits = reactive({
    startMin: today.toISOString().split('T')[0],
    startMax: sixMonths.toISOString().split('T')[0],
    endMin: tomorrow.toISOString().split('T')[0],
    endMax: sixMonthsTmr.toISOString().split('T')[0]
});

watch(() => bookingForm.startDate, (val) => {
    if (!val) return;
    const nextDay = new Date(val);
    nextDay.setDate(nextDay.getDate() + 1);
    dateLimits.endMin = nextDay.toISOString().split('T')[0];
    if (bookingForm.endDate && bookingForm.endDate < dateLimits.endMin) {
        bookingForm.endDate = '';
    }
});

function onDialogClick() {
    if (auth.isLoggedIn) {
        router.push(`/messages/${props.id}`);
    } else {
        pendingAction = 'message';
        new Modal(document.getElementById('loginModal')).show();
    }
}

async function onLoginSubmit() {
    loginError.value = '';
    try {
        await auth.login(loginForm.email, loginForm.password);
        Modal.getInstance(document.getElementById('loginModal'))?.hide();

        if (pendingAction === 'booking') {
            new Modal(document.getElementById('bookingModal')).show();
        } else {
            router.push(`/messages/${props.id}`);
        }
        pendingAction = null;
    } catch (err) {
        loginError.value = err.response?.data?.error || 'Неверный email или пароль';
    }
}

async function onBookingSubmit() {
    if (!auth.isLoggedIn) {
        pendingAction = 'booking';
        Modal.getInstance(document.getElementById('bookingModal'))?.hide();
        new Modal(document.getElementById('loginModal')).show();
        return;
    }

    try {
        await book(bookingForm.startDate, bookingForm.endDate);
        alert('Заявка подана успешно!');
        Modal.getInstance(document.getElementById('bookingModal'))?.hide();
        window.location.reload();
    } catch (err) {
        alert(err.response?.data?.error || 'Ошибка при бронировании');
    }
}
</script>