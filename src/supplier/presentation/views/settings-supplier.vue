<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useIamStore } from '../../../iam/application/iam-store.js';
import { ProfilesApi } from '../../../profiles/infrastructure/profiles-api.js';

const { t } = useI18n();
const iamStore = useIamStore();
const profilesApi = new ProfilesApi();

const profileId = ref(null);
const loading = ref(true);
const saving = ref(false);
const errorMessage = ref('');
const saveMessage = ref('');

const form = reactive({
    businessName: '',
    firstName: '',
    lastName: '',
    contactEmail: '',
    phone: '',
    category: '',
    street: '',
    district: '',
    city: '',
    country: 'Peru'
});

async function loadProfile() {
    loading.value = true;
    errorMessage.value = '';

    try {
        const userId = iamStore.currentUser?.id;
        if (!userId) throw new Error('No authenticated user found.');

        const response = await profilesApi.getSupplierProfileByUserId(userId);
        const profile = response.data;

        profileId.value = profile.id;
        form.businessName = profile.businessName ?? '';
        form.firstName = profile.firstName ?? '';
        form.lastName = profile.lastName ?? '';
        form.contactEmail = profile.contactEmail ?? '';
        form.phone = profile.phone ?? '';
        form.category = profile.category ?? '';
        form.street = profile.street ?? '';
        form.district = profile.district ?? '';
        form.city = profile.city ?? '';
        form.country = profile.country ?? 'Peru';
    } catch (error) {
        errorMessage.value = error?.response?.data ?? error?.message ?? 'Supplier profile could not be loaded.';
    } finally {
        loading.value = false;
    }
}

async function saveProfile() {
    if (!profileId.value || saving.value) return;

    saving.value = true;
    saveMessage.value = '';
    errorMessage.value = '';

    try {
        await profilesApi.updateSupplierProfile({
            id: profileId.value,
            businessName: form.businessName,
            firstName: form.firstName,
            lastName: form.lastName,
            street: form.street,
            district: form.district,
            city: form.city,
            country: form.country || 'Peru',
            contactEmail: form.contactEmail,
            phone: form.phone,
            category: form.category
        });

        saveMessage.value = t('supplier-management.settings.profile.saved');
    } catch (error) {
        errorMessage.value = error?.response?.data ?? error?.message ?? t('supplier-management.settings.profile.error');
    } finally {
        saving.value = false;
    }
}

onMounted(loadProfile);
</script>

<template>
    <section class="settings-page">
        <header class="settings-page__header">
            <p class="settings-page__eyebrow">{{ t('supplier-management.settings.breadcrumb') }}</p>
            <h1 class="settings-page__title">{{ t('supplier-management.settings.title') }}</h1>
            <p class="settings-page__subtitle">{{ t('supplier-management.settings.subtitle') }}</p>
        </header>

        <div v-if="loading" class="settings-page__status">
            {{ t('supplier-management.settings.loading') }}
        </div>

        <article v-else class="settings-card">
            <div class="settings-card__header">
                <h2 class="settings-card__title">{{ t('supplier-management.settings.profile.title') }}</h2>
                <button
                    type="button"
                    class="settings-save"
                    :disabled="saving || !profileId"
                    @click="saveProfile"
                >
                    {{ saving ? t('supplier-management.settings.profile.saving') : t('supplier-management.settings.profile.save') }}
                </button>
            </div>

            <div class="settings-grid">
                <label class="settings-field">
                    <span>{{ t('supplier-management.settings.profile.supplier-name') }}</span>
                    <input v-model="form.businessName" type="text">
                </label>

                <label class="settings-field">
                    <span>{{ t('supplier-management.settings.profile.support-contact') }}</span>
                    <input v-model="form.contactEmail" type="email">
                </label>

                <label class="settings-field">
                    <span>First name</span>
                    <input v-model="form.firstName" type="text">
                </label>

                <label class="settings-field">
                    <span>Last name</span>
                    <input v-model="form.lastName" type="text">
                </label>

                <label class="settings-field">
                    <span>Phone</span>
                    <input v-model="form.phone" type="text">
                </label>

                <label class="settings-field">
                    <span>Category</span>
                    <input v-model="form.category" type="text">
                </label>

                <label class="settings-field">
                    <span>Street</span>
                    <input v-model="form.street" type="text">
                </label>

                <label class="settings-field">
                    <span>District</span>
                    <input v-model="form.district" type="text">
                </label>

                <label class="settings-field">
                    <span>City</span>
                    <input v-model="form.city" type="text">
                </label>

                <label class="settings-field">
                    <span>Country</span>
                    <input v-model="form.country" type="text" disabled>
                </label>
            </div>

            <p v-if="saveMessage" class="settings-message">{{ saveMessage }}</p>
            <p v-if="errorMessage" class="settings-message settings-message--error">{{ errorMessage }}</p>
        </article>
    </section>
</template>

<style scoped>
.settings-page {
    color: #2d241e;
}

.settings-page__header {
    margin-bottom: 20px;
}

.settings-page__eyebrow {
    margin: 0 0 8px;
    color: #b0762a;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.settings-page__title {
    margin: 0;
    color: #221b2a;
    font-family: 'Poppins', system-ui, sans-serif;
    font-size: clamp(2.6rem, 4vw, 3.3rem);
    line-height: 1;
    letter-spacing: -0.04em;
}

.settings-page__subtitle {
    margin: 10px 0 0;
    color: #6f665d;
    font-size: 14px;
}

.settings-page__status {
    padding: 40px 22px;
    text-align: center;
    color: #6f665d;
    font-size: 14px;
}

.settings-card {
    padding: 22px;
    background: #fffdf9;
    border: 1px solid #efe4d4;
    border-radius: 14px;
    box-shadow: 0 16px 34px rgba(58, 42, 20, 0.08);
}

.settings-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 18px;
}

.settings-card__title {
    margin: 0;
    font-size: 22px;
    color: #3d4c5f;
}

.settings-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
}

.settings-field {
    display: grid;
    gap: 8px;
}

.settings-field span {
    font-size: 13px;
    font-weight: 700;
    color: #554a40;
}

.settings-field input {
    height: 40px;
    border: 1px solid #d9dfe8;
    border-radius: 12px;
    padding: 0 12px;
    color: #344457;
    background: #ffffff;
}

.settings-field input:disabled {
    background: #f4f0eb;
    color: #8a8178;
}

.settings-save {
    min-height: 44px;
    padding: 0 22px;
    border: none;
    border-radius: 12px;
    background: #b07b2b;
    color: #ffffff;
    font-weight: 700;
    cursor: pointer;
}

.settings-save:disabled {
    opacity: 0.55;
    cursor: default;
}

.settings-message {
    margin: 16px 0 0;
    color: #238148;
    font-size: 13px;
    font-weight: 700;
}

.settings-message--error {
    color: #c21204;
}

@media (max-width: 980px) {
    .settings-grid {
        grid-template-columns: 1fr;
    }

    .settings-page__title {
        font-size: clamp(2.2rem, 8vw, 2.8rem);
    }
}
</style>
