<template>
    <div class="container py-4">
        <!-- Navigation -->
        <router-link
            to="/profile"
            class="btn text-muted text-decoration-none p-0 d-inline-flex align-items-center small mb-3"
        >
            <i class="bi bi-arrow-left me-2"></i> Back to profile
        </router-link>

        <!-- Loading -->
        <div v-if="isLoading" class="text-center py-5">
            <LoadingSplash title="Loading campaign" description="Please wait while we fetch the campaign details." />
        </div>

        <!-- Error/not found -->
        <div v-else-if="hasError" class="text-center py-5">
            <NotFound
                :title="errorTitle"
                :description="errorMessage"
                :link="`/profile`"
                link-text="Back to profile"
            />
        </div>

        <!-- Form card -->
        <div v-else class="card">
            <div class="card-body">
                <h3 class="card-title mb-4">
                    {{ isEditMode ? 'Edit campaign' : 'Create new campaign' }}
                </h3>

                <!-- Form -->
                <Form :key="formKey" @submit="handleSubmit" :initial-values="initialCampaignData" :validation-schema="campaignSchema">
                    <div class="mb-3 form-group">
                        <label for="title" class="form-label">
                            Title <span class="text-danger">*</span>
                        </label>
                        <Field :disabled="formDisabled" id="title" name="title" class="form-control" />
                        <ErrorMessage name="title" class="text-danger small" />
                    </div>

                    <div class="mb-3 form-group">
                        <label for="description" class="form-label">
                            Description <span class="text-danger">*</span>
                        </label>
                        <Field :disabled="formDisabled" id="description" name="description" as="textarea" rows="3" class="form-control" />
                        <ErrorMessage name="description" class="text-danger small" />
                    </div>

                    <div class="mb-3 form-group">
                        <label for="endDate" class="form-label">
                            End date <span class="text-danger">*</span>
                        </label>
                        <Field :disabled="formDisabled" id="endDate" type="date" name="endDate" class="form-control" />
                        <ErrorMessage name="endDate" class="text-danger small" />
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3 form-group">
                            <label for="target" class="form-label">
                                Target amount (VND) <span class="text-danger">*</span>
                            </label>
                            <Field :disabled="formDisabled" id="target" type="number" name="target" class="form-control" />
                            <ErrorMessage name="target" class="text-danger small" />
                        </div>

                        <div class="col-md-6 mb-3 form-group">
                            <label for="image" class="form-label">
                                Campaign image URL <span class="text-danger">*</span>
                            </label>
                            <Field :disabled="formDisabled" id="image" name="image" class="form-control" />
                            <ErrorMessage name="image" class="text-danger small" />
                        </div>
                    </div>

                    <!-- Tags checkbox group -->
                    <div class="mb-3 form-group">
                        <label class="form-label">Tags</label>
                        <div class="form-check" v-for="tag in tags" :key="tag">
                            <input
                                class="form-check-input"
                                type="checkbox"
                                :id="'tag-' + tag"
                                :value="tag"
                                :disabled="formDisabled"
                                v-model="initialCampaignData.tags"
                            />
                            <label class="form-check-label" :for="'tag-' + tag">{{ tag }}</label>
                        </div>
                    </div>

                    <!-- Active campaign checkbox (in edit mode) -->
                    <div v-if="isEditMode" class="mb-3 form-check">
                        <input
                            type="checkbox"
                            id="isActive"
                            class="form-check-input"
                            :disabled="formDisabled"
                            v-model="initialCampaignData.isActive"
                        />
                        <label for="isActive" class="form-check-label">Campaign is active?</label>
                    </div>

                    <!-- Update campaign -->
                    <button :disabled="formDisabled" class="btn w-100 btn-primary mt-3">
                        <span v-if="formDisabled" class="spinner-border spinner-border-sm"></span>
                        {{ formDisabled ? 'Please wait...' : (isEditMode ? 'Update campaign' : 'Create campaign') }}
                    </button>
                </Form>

                <!-- Delete campaign -->
                <div v-if="isEditMode" class="mt-3">
                    <button type="button" class="btn btn-danger w-100" @click="deleteCampaign">
                        Delete this campaign
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import * as yup from 'yup'
import { Form, Field, ErrorMessage } from 'vee-validate'
import api from '@/utils/api'
import { toast } from 'vue3-toastify'
import { useAuthStore } from '@/stores/authStore'
import LoadingSplash from '@/components/common/LoadingSplash.vue'
import NotFound from '@/components/common/NotFound.vue'

export default {
    name: 'CampaignForm',
    components: { Form, Field, ErrorMessage, LoadingSplash, NotFound },
    data() {
        return {
            authStore: useAuthStore(),
            formDisabled: false,
            isLoading: true,
            hasError: false,
            errorTitle: '',
            errorMessage: '',
            formKey: Date.now(), // to re-render the form with the initial values we got when fetch campaign details
            campaignLoaded: false,
            tags: [
                'Children',
                'Elderly',
                'Medical assistance',
                'Education',
                'Environment',
                'Disaster relief',
                'Animal welfare',
                'Community development'
            ],
            initialCampaignData: {
                title: '',
                description: '',
                endDate: null,
                target: 0,
                image: '',
                tags: [],
                isActive: true
            },
            campaignSchema: yup.object({
                title: yup.string().required('Title is required.'),
                description: yup.string().required('Description is required.'),
                endDate: yup.date()
                    .required('End date is required.')
                    .min(new Date(), 'End date must be in the future.')
                    .typeError('Please select a valid end date.'),
                target: yup.number()
                    .positive('Target amount must be positive.')
                    .min(5000, 'Target amount must be at least 5,000 VND.')
                    .required('Target amount is required.')
                    .typeError('Target amount must be a number.'),
                image: yup.string().url('Image must be a valid URL.').required('Image URL is required.'),
                tags: yup.array().of(yup.string()),
                isActive: yup.boolean()
            })
        }
    },
    computed: {
        isEditMode() {
            return this.campaignLoaded
        }
    },
    watch: { // watch the changes of campaignId in the URL params to reload
        '$route.params.campaignId': 'loadCampaign'
    },
    methods: {
        async loadCampaign() { // load campaign data
            // "create" mode
            if (this.$route.params.campaignId === 'create') {
                this.initialCampaignData = {
                    title: '',
                    description: '',
                    endDate: null,
                    target: 0,
                    image: '',
                    tags: [],
                    isActive: true
                }
                this.campaignLoaded = false
                this.isLoading = false
                this.hasError = false
                this.formKey = Date.now()
                return
            }

            // "edit" mode
            // fetch campaign by id
            // then re-render the form with new values
            this.formDisabled = true
            try {
                const campaignId = this.$route.params.campaignId
                const response = await api.getCampaignById(campaignId)
                this.initialCampaignData = response.data

                if(this.initialCampaignData.orgId !== this.authStore.user.uid) {
                    this.hasError = true
                    this.errorTitle = 'Unauthorized'
                    this.errorMessage = 'You do not have permission to edit this campaign.'
                    return
                }

                if (!response.data.tags) {
                    this.initialCampaignData.tags = []
                }
                this.campaignLoaded = true
                this.hasError = false
                this.formKey = Date.now()
            } catch (error) {
                this.hasError = true
                this.errorTitle = 'Something went wrong'
                this.errorMessage = 'Failed to load campaign. Please try again later.'
            } finally {
                this.formDisabled = false
                this.isLoading = false
            }
        },
        async handleSubmit(values) {
            this.formDisabled = true
            try {
                const idToken = await this.authStore.getIdToken()
                const { title, description, endDate, target, image } = values

                if (this.isEditMode) {
                    await api.updateCampaign(this.$route.params.campaignId, { title, description, endDate, target, image, tags: this.initialCampaignData.tags, isActive: this.initialCampaignData.isActive }, idToken)
                    toast.success('Campaign updated successfully.')

                    
                } else {
                    const response = await api.addCampaign({ title, description, endDate, target, image, tags: this.initialCampaignData.tags }, idToken)
                    toast.success('Campaign created successfully.')

                    setTimeout(() => { // automatically redirect to campaign page
                        this.$router.push('/campaigns/' + response.data.id)
                    }, 2000)
                }    
            } catch (error) {
                toast.error(error.message || 'An unexpected error occurred. Please try again later.')
            } finally {
                this.formDisabled = false
            }
        },
        async deleteCampaign() { // delete campaign
            if (confirm('Are you sure you want to delete this campaign?')) {
                try {
                    const idToken = await this.authStore.getIdToken()
                    await api.deleteCampaign(this.$route.params.campaignId, idToken)
                    toast.success('Campaign deleted successfully.')

                    setTimeout(() => { // automatically redirect to profile page
                        this.$router.push('/profile')
                    }, 2000)
                } catch (error) {
                    toast.error(error.response?.data?.error || 'Failed to delete campaign.')
                }
            }
        }
    },
    mounted() { // load campaign on mounted
        const campaignId = this.$route.params.campaignId
        this.loadCampaign(campaignId)
    },
}
</script>

<style scoped>
    .card {
        max-width: 800px;
        margin: auto;
    }
</style>
