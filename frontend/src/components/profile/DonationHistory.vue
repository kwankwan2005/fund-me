<template>
    <!-- Loading -->
    <div v-if="loading">
        <LoadingSplash 
            title="Loading donation history..."
            description="Please wait for a moment." 
        />
    </div>
    <!-- Error states -->
    <div v-else-if="error">
        <NotFound
            title="Error loading donations"
            description="There was an error loading your donation history."
            link="/"
            linkText="Go to homepage"
        />
    </div>
    <div v-else-if="!donations.length">
        <NotFound
            title="No donations found"
            description="You haven't made any donations yet."
            link="/campaigns"
            linkText="Browse campaigns"
        />
    </div>
    <!-- Donation history table -->
    <div v-else>
        <div class="table-responsive">
            <table class="table table-bordered">
                <caption>Showing page {{ page }} of {{ totalPages || 1 }}</caption>
                <thead class="table-light">
                    <tr>
                        <th scope="col" id="donation_index">#</th>
                        <th scope="col" id="donation_campaign">Campaign ID</th>
                        <th scope="col" id="donation_amount">Amount</th>
                        <th scope="col" id="donation_message">Message</th>
                        <th scope="col" id="donation_date">Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(donation, index) in paginatedDonations" :key="donation.uid">
                        <td headers="donation_index">
                            {{ (page - 1) * itemsPerPage + index + 1 }}
                        </td>
                        <td headers="donation_campaign">
                            {{ donation.campaignId }}
                        </td>
                        <td headers="donation_amount" class="fw-bold text-success">
                            {{ formatCurrency(donation.amount) }}
                        </td>
                        <td headers="donation_message">
                            {{ donation.message || '-' }}
                        </td>
                        <td headers="donation_date">
                            {{ donation.transactionDate }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-center mt-4">
            <paginate
                v-model="page"
                :page-count="totalPages"
                prev-text="Previous"
                next-text="Next"
                container-class="pagination"
                page-class="page-item"
                active-class="active"
            />
        </div>
    </div>
</template>

<script>
import NotFound from '@/components/common/NotFound.vue';
import LoadingSplash from '@/components/common/LoadingSplash.vue';
import { useAuthStore } from '@/stores/authStore';
import Paginate from 'vuejs-paginate-next';
import api from '@/utils/api';
import helper from '@/utils/helper';

export default {
    name: 'DonationHistory',
    components: {
        NotFound,
        LoadingSplash,
        Paginate
    },
    data() {
        return {
            authStore: useAuthStore(), // auth store for user data
            donations: [],
            page: 1,
            itemsPerPage: 10,
            loading: true,
            error: false
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.donations.length / this.itemsPerPage);
        },
        paginatedDonations() {
            const start = (this.page - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.donations.slice(start, end);
        }
    },
    methods: {
        formatCurrency(value) {
            return helper.formatCurrency(value);
        },
        formatDate(dateStr) {
            return helper.formatDate(dateStr);
        },
        async fetchDonationHistory() { // fetch donation history
            try {
                const token = await this.authStore.getIdToken(); // get JWT token
                const response = await api.getDonationHistory(token);
                this.donations = response.data || [];
            } catch (error) {
                this.error = true;
                this.errorMessage = 'Failed to load donation history.';
            } finally {
                this.loading = false;
            }
        }
    },
    mounted() {
        this.fetchDonationHistory();
    }
};
</script>
