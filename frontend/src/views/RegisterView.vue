<template>
    <div class="container-fluid vh-100">
        <div class="row h-100">
            <!-- Register form -->
            <div class="col-12 col-lg-6 d-flex align-items-center justify-content-center">
                <div class="w-100" style="max-width: 400px;">
                    <!-- Back to home button -->
                    <div class="mb-5">
                        <router-link
                            to="/"
                            class="btn text-muted text-decoration-none p-0 d-inline-flex align-items-center small"
                        >
                            <i class="bi bi-arrow-left me-2"></i> Back to Home
                        </router-link>
                    </div>

                    <!-- Logo and title -->
                    <div class="mb-4 text-center">
                        <img src="@/assets/logo.png" alt="FundMe Logo" class="mb-3" style="max-width: 150px; height: auto;" />
                        <h2 class="fw-bold">Register</h2>
                        <p class="text-muted">Please fill in the details to create an account</p>
                    </div>

                    <!-- Form -->
                    <Form @submit="handleRegister" :validation-schema="registerSchema">
                        <div class="mb-3 form-group">
                            <label for="name" class="form-label">Name <span class="text-danger">*</span></label>
                            <Field placeholder="Enter your name..." :disabled="formDisabled" name="name" type="text" id="name" class="form-control" required />
                            <ErrorMessage name="name" class="text-danger small" />
                        </div>

                        <div class="mb-3 form-group">
                            <label for="email" class="form-label">Email address <span class="text-danger">*</span></label>
                            <Field placeholder="Enter your email..." :disabled="formDisabled" name="email" type="email" id="email" class="form-control" required />
                            <ErrorMessage name="email" class="text-danger small" />
                        </div>

                        <div class="mb-3 form-group">
                            <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
                            <Field placeholder="Enter your password..." :disabled="formDisabled" name="password" type="password" id="password" class="form-control" required />
                            <ErrorMessage name="password" class="text-danger small" />
                        </div>

                        <div class="mb-3 form-group">
                            <label for="confirmPassword" class="form-label">Confirm password <span class="text-danger">*</span></label>
                            <Field placeholder="Confirm your password..." :disabled="formDisabled" name="confirmPassword" type="password" id="confirmPassword" class="form-control" required />
                            <ErrorMessage name="confirmPassword" class="text-danger small" />
                        </div>

                        <div class="mb-4 form-group">
                            <label for="role" class="form-label">Role <span class="text-danger">*</span></label>
                            <Field :disabled="formDisabled" name="role" as="select" id="role" class="form-select" required>
                                <option disabled value="">Select role</option>
                                <option value="donator">Donator</option>
                                <option value="organization">Organization</option>
                            </Field>
                            <ErrorMessage name="role" class="text-danger small" />
                        </div>

                        <button :disabled="formDisabled" class="btn btn-primary w-100 mb-3" type="submit">
                            <span v-if="formDisabled" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            {{ formDisabled ? 'Creating account...' : 'Register' }}
                        </button>

                        <p class="text-center small">
                            Already have an account?
                            <router-link to="/login">Sign in</router-link>
                        </p>
                    </Form>
                </div>
            </div>

            <!-- Right-side illustration -->
            <div class="col-lg-6 auth-banner position-relative d-none d-lg-block"></div>
        </div>
    </div>
</template>

<script>
import * as yup from 'yup'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { toast } from 'vue3-toastify'
import { auth, db } from '@/services/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { ref as dbRef, set } from 'firebase/database'
import { useAuthStore } from '@/stores/authStore'

const registerSchema = yup.object({
    name: yup.string().required('Name is required.'),
    email: yup.string().required('Email address is required.').email('Invalid email format.'),
    password: yup.string().required('Password is required.').min(6, 'Password must be at least 6 characters.'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required.'),
    role: yup.string().required('Please select a role.')
})

export default {
    name: 'RegisterView',
    components: { Form, Field, ErrorMessage },
    data() {
        return {
            formDisabled: false,
            registerSchema,
            authStore: useAuthStore()
        }
    },
    methods: {
        async handleRegister(values) {
            this.formDisabled = true
            const { email, password, role, name } = values

            try {
                // create user with email and password
                const userCredential = await createUserWithEmailAndPassword(auth, email, password)
                const user = userCredential.user

                // add user data to the database
                await set(dbRef(db, 'users/' + user.uid), { email, role, name })

                toast.success(`Your account has been created.`)

                // set user in auth store
                // redirect to home page
                this.authStore.setUser({ email, name, role })
                this.$router.push('/')
            } catch (error) {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        toast.error(`Email is already in use.`);
                        break
                    case 'auth/invalid-email':
                        toast.error(`Invalid email format.`);
                        break
                    default:
                        toast.error(`Unexpected error. Please try again.`);
                }
            } finally {
                this.formDisabled = false
            }
        }
    }
}
</script>

<style scoped>
    .auth-banner {
        background-image: url('@/assets/auth-banner.jpg');
        background-size: cover;
        background-position: center;
    }
</style>