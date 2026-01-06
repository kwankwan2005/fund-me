<template>
    <div class="d-flex flex-column align-items-center justify-content-center text-center py-5">
        <i class="bi icon bi-emoji-frown" style="font-size: 3rem; color: #ccc;"></i>

        <!-- Title -->
        <h4 class="mt-3">{{ title }}</h4>

        <!-- Description -->
        <p class="text-muted">{{ description }}</p>

        <!-- Router link -->
        <div v-if="link" class="mt-3">
            <router-link :to="link" class="btn btn-primary">
                {{ linkText || 'Go back' }}
            </router-link>
        </div>
    </div>
</template>

<script>
export default {
    name: 'NotFound',
    props: ['title', 'description', 'link', 'linkText']
}
</script>

<style scoped>
    .icon {
        font-size: 3rem;
        color: #ccc;
    }
</style>