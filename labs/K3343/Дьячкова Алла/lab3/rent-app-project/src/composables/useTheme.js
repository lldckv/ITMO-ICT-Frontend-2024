import { ref, watch } from 'vue';

const theme = ref(localStorage.getItem('theme') || 'light');

function applyTheme(value) {
    document.body.classList.toggle('dark-mode', value === 'dark');
}

applyTheme(theme.value);

watch(theme, (value) => {
    localStorage.setItem('theme', value);
    applyTheme(value);
});

export function useTheme() {
    function toggleTheme() {
        theme.value = theme.value === 'dark' ? 'light' : 'dark';
    }
    return { theme, toggleTheme };
}