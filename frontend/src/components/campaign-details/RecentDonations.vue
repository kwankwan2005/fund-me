<template>
    <div class="mb-5">
        <!-- Not found -->
        <div v-if="transactions.length === 0">
            <NotFound title="No recent donations" description="Be the first to donate to this campaign!" />
        </div>
        <!-- Transactions list -->
        <div v-else>
            <ul class="list-group">
                <li
                    class="list-group-item d-flex justify-content-between align-items-center"
                    v-for="txn in paginatedTransactions"
                    :key="txn.transactionId"
                >
                    <p class="mb-0">
                        <span class="fw-bold">{{ txn.isAnonymous ? "Anonymous" : (txn.name || txn.userId) }}</span>
                        <span class="text-muted"> • {{ formatDateTime(txn.timestamp) }}</span>
                        <br>
                        <span class="text-muted">{{ txn.message || '-' }}</span>
                    </p>
                    <span class="fw-bold text-success">{{ formatCurrency(txn.amount) }}</span>
                </li>
            </ul>

            <!-- Pagination -->
            <div class="d-flex justify-content-center mt-3">
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
    </div>
</template>

<script>
import Paginate from 'vuejs-paginate-next'
import NotFound from '../common/NotFound.vue'
import helper from '@/utils/helper'

export default {
    name: 'RecentDonations',
    components: { Paginate, NotFound },
    props: ['transactions', 'itemsPerPage'],
    data() {
        return {
            page: 1
        }
    },
    computed: {
        totalPages() {
            return Math.ceil(this.transactions.length / this.itemsPerPage)
        },
        paginatedTransactions() {
            const start = (this.page - 1) * this.itemsPerPage
            return this.transactions.slice(start, start + this.itemsPerPage)
        }
    },
    methods: {
        formatCurrency(amount) {
            return helper.formatCurrency(amount);
        },
        formatDateTime(dateStr) {
            return helper.formatDateTime(dateStr);
        }
    }
}
</script>
