<template>
    <div class="card shadow-sm mb-3">
        <!-- Status -->
        <div class="card-body">
            <p class="form-label fw-semibold">{{ title }}</p>

            <!-- Filter items -->
            <div class="form-check" v-for="item in availableItems" :key="item">
                <input class="form-check-input" type="checkbox" :id="item" :value="item" v-model="selectedItems" />
                <label class="form-check-label" :for="item">{{ item }}</label>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'CampaignFilter',
    props: ['title', 'initialItems', 'listItems'],
    data() {
        return {
            selectedItems: this.initialItems || [],
            availableItems: this.listItems,
        }
    },
    watch: { // watch for changes when user select/deselect items
        selectedItems: 'emitFilterChange'
    },
    methods: {
        emitFilterChange() { // emit the selected items to the component use this filter
            this.$emit('tagChange', this.selectedItems)
        }
    }
}
</script>
