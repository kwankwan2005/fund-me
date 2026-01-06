<template>
    <div class="mb-3 form-group">
        <label v-bind:for="name" class="form-label">{{ label }}</label>
        <input type="text"
            v-bind:id="name"
            class="form-control"
            v-bind:placeholder="placeholder"
            v-model="search"
            v-on:input="handleSearch"
        />
    </div>
</template>

<script>
export default {
    name: 'SearchBar',
    props: ['placeholder', 'name', 'label'],
    data() {
        return {
            search: ''
        }
    },
    methods: {
        handleSearch() { // emit the search term to the component using this search bar
            this.$emit('search', this.search);
        }
    }
}
</script>
