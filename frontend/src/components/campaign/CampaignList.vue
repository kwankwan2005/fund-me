<template>
    <!-- List of campaigns -->
    <div class="row g-4" v-if="campaigns && campaigns.length > 0">
        <div v-bind:class="renderList" v-for="campaign in campaigns" :key="campaign.id">
            <CampaignCard
                :campaign="campaign"
                @handleAction="handleAction"
                :page="page"
            />
        </div>
    </div>
    <!-- Not found -->
    <div v-else>
        <NotFound
            title="No campaigns found"
            description="There are no campaigns available at the moment. Please check back later."
        />
    </div>
</template>

<script>
import CampaignCard from '@/components/campaign/CampaignCard.vue'
import NotFound from '@/components/common/NotFound.vue'

export default {
    name: 'CampaignList',
    props: ['campaigns', 'related', 'page'],
    components: {
        CampaignCard, NotFound
    },
    computed: {
        renderList: function() {
            if(this.related) { // "related campaigns" in the campaign details page -- the card will be full width
                return 'col-12';
            }
            return 'col-12 col-md-6 col-lg-4';
        }
    },
    methods: {
        handleAction(action, campaign) { // handle actions from the campaign card
            this.$emit('handleAction', action, campaign);
        }
    }
}
</script>