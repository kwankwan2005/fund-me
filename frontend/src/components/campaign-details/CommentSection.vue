<template>
    <div class="mb-1">
        <!-- Not found -->
        <div v-if="comments.length === 0">
            <NotFound title="No comments" description="Be the first to comment on this campaign!" />
        </div>
        <!-- Comment display-->
        <div v-else>
            <h5 class="mb-3">Comments ({{ comments.length }})</h5>
            <!-- Comment area -->
            <div class="mb-3" v-for="comment in paginatedComments" :key="comment.id">
                <div class="d-flex align-items-start">
                    <img
                        v-lazy="generateAvatar(comment.name)"
                        class="rounded-circle me-2"
                        width="40"
                        height="40"
                        alt="Avatar"
                    />
                    <div>
                        <div class="fw-bold">{{ comment.name }}</div>
                        <small class="text-muted">{{ formatDateTime(comment.timestamp) }}</small>
                        <p class="mb-0">{{ comment.message }}</p>
                    </div>
                </div>
                <hr />
            </div>

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
    name: 'CommentSection',
    components: { Paginate, NotFound },
    props: ['comments', 'itemsPerPage'],
    data() {
        return {
            page: 1
        }
    },
    computed: {
        totalPages() {
            return Math.ceil(this.comments.length / this.itemsPerPage)
        },
        paginatedComments() {
            const start = (this.page - 1) * this.itemsPerPage
            return this.comments.slice(start, start + this.itemsPerPage)
        }
    },
    methods: {
        generateAvatar(name) {
            return helper.generateAvatar(name)
        },
        formatDateTime(dateStr) {
            return helper.formatDateTime(dateStr)
        }
    }
}
</script>
