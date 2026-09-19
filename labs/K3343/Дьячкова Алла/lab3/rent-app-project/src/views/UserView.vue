<template>
  <h1 class="text-center">Личный кабинет</h1>

  <h2 class="mt-5">Личная информация</h2>
  <div class="form-container-register" v-if="profile">
    <p><strong>Имя:</strong> {{ profile.firstName }}</p>
    <p><strong>Отчество:</strong> {{ profile.lastName }}</p>
    <p><strong>Дата рождения:</strong> {{ profile.dob }}</p>
    <p><strong>Телефон:</strong> {{ profile.phone }}</p>
    <p><strong>Email:</strong> {{ profile.email }}</p>
    <button class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#editUserInfoModal" @click="loadEditForm">Редактировать информацию</button>
    <button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#changePasswordModal">Изменить пароль</button>
  </div>

  <div class="modal fade" id="editUserInfoModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Редактирование информации</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="onSaveInfo">
            <div class="mb-3"><label class="form-label">Имя</label><input v-model="editForm.firstName" class="form-control" required></div>
            <div class="mb-3"><label class="form-label">Отчество</label><input v-model="editForm.lastName" class="form-control" required></div>
            <div class="mb-3"><label class="form-label">Дата рождения</label><input v-model="editForm.dob" type="date" class="form-control" required></div>
            <div class="mb-3"><label class="form-label">Телефон</label><input v-model="editForm.phone" type="tel" pattern="^\+?[0-9\s\-\(\)]{10,15}$" class="form-control" required></div>
            <div class="mb-3"><label class="form-label">Email</label><input v-model="editForm.email" type="email" class="form-control" required></div>
            <button type="submit" class="btn btn-primary">Сохранить изменения</button>
          </form>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="changePasswordModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Изменение пароля</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="onSavePassword">
            <div class="mb-3"><label class="form-label">Новый пароль</label><input v-model="newPassword" type="password" minlength="6" class="form-control" required></div>
            <button type="submit" class="btn btn-primary">Обновить пароль</button>
          </form>
        </div>
      </div>
    </div>
  </div>

  <h2 class="mt-5">История аренды</h2>
  <div class="card mb-3">
    <div class="card-body" style="display:flex; overflow-x:auto; gap:1rem;">
      <p v-if="rentals.length === 0">История аренды пуста.</p>
      <div v-for="rental in rentals" :key="rental.id" class="card mb-3" style="min-width:300px; flex:0 0 auto;">
        <div class="card-body">
          <h5 class="card-title"><router-link :to="`/property/${rental.propertyId}`">{{ rental.propertyTitle }}</router-link></h5>
          <p :style="{ color: rental.isApproved ? 'green' : 'red' }">Статус: {{ rental.isApproved ? 'Одобрено' : 'В ожидании' }}</p>
          <p>Дата начала аренды: {{ rental.startOfRent }}</p>
          <p>Дата окончания аренды: {{ rental.endOfRent }}</p>
          <router-link :to="`/messages/${rental.propertyId}`" class="btn btn-primary">Перейти к чату</router-link>
          <button class="btn btn-danger" @click="handleDelete(rental.id)">Удалить бронь</button>
        </div>
      </div>
    </div>
  </div>

  <h2 class="mt-5">Мои диалоги</h2>
  <div class="card mb-3">
    <div class="card-body">
      <p v-if="dialogs.length === 0">У вас нет диалогов.</p>
      <router-link v-for="d in dialogs" :key="d.propertyId" :to="`/messages/${d.propertyId}`" class="btn btn-primary d-block mb-2">
        Чат: {{ d.propertyTitle }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useUserProfile } from '@/composables/useUser';

const { profile, rentals, dialogs, updateInfo, updatePassword, deleteBooking } = useUserProfile();

const editForm = reactive({ firstName: '', lastName: '', dob: '', phone: '', email: '' });
const newPassword = ref('');

function loadEditForm() {
    if (!profile.value) return;
    Object.assign(editForm, {
        firstName: profile.value.firstName,
        lastName: profile.value.lastName,
        dob: profile.value.dob,
        phone: profile.value.phone,
        email: profile.value.email
    });
}

async function onSaveInfo() {
    await updateInfo({ ...editForm });
    alert('Информация успешно обновлена');
}

async function onSavePassword() {
    await updatePassword(newPassword.value);
    newPassword.value = '';
    alert('Пароль успешно обновлен');
}

async function handleDelete(id) {
    await deleteBooking(id);
    alert('Бронирование успешно удалено.');
}
</script>