<template>
    <!-- Not found -->
    <div v-if="donators.length === 0">
        <NotFound title="No donators" description="Be the first to donate to this campaign!" />
    </div>
    <!-- Top donators display -->
    <div v-else class="mb-5 table-responsive">
        <table class="table table-bordered">
            <caption>Showing page {{ page }} of {{ totalPages || 1 }}</caption>
            <thead class="table-light">
                <tr>
                    <th scope="col" id="donator_rank">#</th>
                    <th scope="col" id="donator_name">Name</th>
                    <th scope="col" id="donator_total">Total donated</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(donator, index) in paginatedDonators" :key="donator.userId">
                    <td headers="donator_rank">{{ (page - 1) * itemsPerPage + index + 1 }}</td>
                    <td headers="donator_name">{{ donator.name }}</td>
                    <td headers="donator_total" class="fw-bold text-success">{{ formatCurrency(donator.total) }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Pagination -->
        <div class="d-flex justify-content-center">
            <paginate
                v-model="page"
                :page-count="totalPages"
                :prev-text="'Previous'"
                :next-text="'Next'"
                :container-class="'pagination'"
                :page-class="'page-item'"
                :active-class="'active'"
            />
        </div>
    </div>
</template>

<script>
import Paginate from 'vuejs-paginate-next'
import NotFound from '../common/NotFound.vue'
import helper from '@/utils/helper'

export default {
    name: 'DonatorList',
    components: { Paginate, NotFound },
    props: ['donators', 'itemsPerPage'],
    data() {
        return {
            page: 1
        }
    },
    computed: {
        totalPages() {
            return Math.ceil(this.donators.length / this.itemsPerPage)
        },
        paginatedDonators() {
            const start = (this.page - 1) * this.itemsPerPage
            return this.donators.slice(start, start + this.itemsPerPage)
        }
    },
    methods: {
        formatCurrency(amount) {
            return helper.formatCurrency(amount);
        }
    }
}
</script>
