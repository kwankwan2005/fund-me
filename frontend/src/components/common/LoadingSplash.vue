<template>
    <div class="d-flex flex-column align-items-center justify-content-center text-center py-5">
        <!-- Spinner -->
        <div class="spinner-border text-primary mb-5" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>

        <!-- Title -->
        <h4 class="mb-1">{{ title }}</h4>

        <!-- Description -->
        <p class="text-muted">{{ description }}</p>
    </div>
</template>

<script>
export default {
    name: 'LoadingSplash',
    props: ['title', 'description']
}
</script>

<style scoped>
    .spinner-border {
        width: 5rem;
        height: 5rem;
    }
    .text-primary {
        color: var(--primary-color) !important;
    }
</style>
