<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { SupplierSettings } from '../../domain/model/supplier-settings.entity.js';
import useSupplierManagementStore from '../../application/supply-management.store.js';

const { t } = useI18n();
const store = useSupplierManagementStore();
const { supplierSettings, supplierSettingsLoaded, settingsError } = storeToRefs(store);
const { fetchSupplierSettings, updateSupplierSettings } = store;

const form = reactive({
    supplierName: '',
    supportContact: '',
    notifyEmail: false,
    notifySms: false,
    serviceZones: [],
    contacts: []
});
const newZone = ref('');
const isSaving = ref(false);
const saveMessage = ref('');

const canAddZone = computed(() => newZone.value.trim().length > 0);

function addZone() {
    const zone = newZone.value.trim();

    if (!zone || form.serviceZones.includes(zone)) {
        newZone.value = '';
        return;
    }

    form.serviceZones = [...form.serviceZones, zone];
    newZone.value = '';
}

function removeZone(zone) {
    form.serviceZones = form.serviceZones.filter((currentZone) => currentZone !== zone);
}

async function saveSettings() {
    if (!supplierSettings.value?.id) {
        return;
    }

    isSaving.value = true;
    saveMessage.value = '';
    const saved = await updateSupplierSettings(new SupplierSettings({
        id: supplierSettings.value.id,
        supplierName: form.supplierName,
        supportContact: form.supportContact,
        notifications: {
            email: form.notifyEmail,
            sms: form.notifySms
        },
        serviceZones: form.serviceZones,
        contacts: form.contacts
    }));

    isSaving.value = false;
    if (saved) {
        saveMessage.value = t('supplier-management.settings.profile.saved');
    } else {
        saveMessage.value = t('supplier-management.settings.profile.error');
    }
}

watch(supplierSettings, (settings) => {
    if (!settings) return;
    form.supplierName = settings.supplierName;
    form.supportContact = settings.supportContact;
    form.notifyEmail = Boolean(settings.notifications?.email);
    form.notifySms = Boolean(settings.notifications?.sms);
    form.serviceZones = [...(settings.serviceZones ?? [])];
    form.contacts = [...(settings.contacts ?? [])];
}, { immediate: true });

onMounted(() => {
    if (!supplierSettingsLoaded.value && !settingsError.value) {
        fetchSupplierSettings();
    }
});
</script>

<template>
    <section class="settings-page">
        <header class="settings-page__header">
            <p class="settings-page__eyebrow">{{ t('supplier-management.settings.breadcrumb') }}</p>
            <h1 class="settings-page__title">{{ t('supplier-management.settings.title') }}</h1>
            <p class="settings-page__subtitle">{{ t('supplier-management.settings.subtitle') }}</p>
        </header>

        <div v-if="!supplierSettingsLoaded && !settingsError" class="settings-page__status">
            {{ t('supplier-management.settings.loading') }}
        </div>

        <div v-else-if="settingsError" class="settings-page__status settings-page__status--error">
            {{ settingsError }}
        </div>

        <div v-else class="settings-page__grid">
            <article class="settings-card">
                <h2 class="settings-card__title">{{ t('supplier-management.settings.profile.title') }}</h2>

                <label class="settings-field">
                    <span>{{ t('supplier-management.settings.profile.supplier-name') }}</span>
                    <input v-model="form.supplierName" type="text">
                </label>

                <label class="settings-field">
                    <span>{{ t('supplier-management.settings.profile.support-contact') }}</span>
                    <input v-model="form.supportContact" type="text">
                </label>

                <label class="settings-toggle">
                    <span>{{ t('supplier-management.settings.profile.email') }}</span>
                    <input v-model="form.notifyEmail" type="checkbox">
                    <span class="settings-toggle__slider"></span>
                </label>

                <label class="settings-toggle">
                    <span>{{ t('supplier-management.settings.profile.sms') }}</span>
                    <input v-model="form.notifySms" type="checkbox">
                    <span class="settings-toggle__slider"></span>
                </label>

                <button
                    type="button"
                    class="settings-save"
                    :disabled="isSaving || !supplierSettingsLoaded"
                    @click="saveSettings"
                >
                    {{ isSaving ? t('supplier-management.settings.profile.saving') : t('supplier-management.settings.profile.save') }}
                </button>

                <p v-if="saveMessage" class="settings-message" :class="{ 'settings-message--error': saveMessage === t('supplier-management.settings.profile.error') }">{{ saveMessage }}</p>
            </article>

            <article class="settings-card">
                <h2 class="settings-card__title">{{ t('supplier-management.settings.zones.title') }}</h2>

                <div class="zones-list">
                    <span v-for="zone in form.serviceZones" :key="zone" class="zone-chip">
                        {{ zone }}
                        <button type="button" :aria-label="t('supplier-management.settings.zones.remove')" @click="removeZone(zone)">
                            <i class="pi pi-times"></i>
                        </button>
                    </span>
                </div>

                <form class="zone-form" @submit.prevent="addZone">
                    <input v-model="newZone" type="text" :placeholder="t('supplier-management.settings.zones.add-placeholder')">
                    <button type="submit" :disabled="!canAddZone">
                        <i class="pi pi-plus"></i>
                    </button>
                </form>

                <div class="contacts-list">
                    <div v-for="contact in form.contacts" :key="contact.name" class="contacts-row">
                        <span class="contacts-row__name">{{ contact.name }}</span>
                        <span class="contacts-row__state">{{ t(`supplier-management.settings.zones.${contact.state}`) }}</span>
                    </div>
                </div>
            </article>
        </div>
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
    font-family: 'Poppins', system-ui, sans-serif;
    font-size: 48px;
    line-height: 1;
}

.settings-page__subtitle {
    margin: 10px 0 0;
    color: #6f665d;
    font-size: 14px;
}

.settings-page__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}

.settings-card {
    padding: 22px;
    background: #fffdf9;
    border: 1px solid #efe4d4;
    border-radius: 14px;
    box-shadow: 0 16px 34px rgba(58, 42, 20, 0.08);
}

.settings-card__title {
    margin: 0 0 14px;
    font-size: 22px;
    color: #3d4c5f;
}

.settings-field {
    display: grid;
    gap: 8px;
    margin-bottom: 12px;
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
}

.settings-toggle {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin: 6px 0;
    color: #554a40;
    font-weight: 600;
}

.settings-toggle input {
    display: none;
}

.settings-toggle__slider {
    position: relative;
    width: 38px;
    height: 22px;
    border-radius: 999px;
    background: #d8d4d0;
    transition: background 0.2s ease;
}

.settings-toggle__slider::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #ffffff;
    transition: transform 0.2s ease;
}

.settings-toggle input:checked + .settings-toggle__slider {
    background: #e6a317;
}

.settings-toggle input:checked + .settings-toggle__slider::after {
    transform: translateX(16px);
}

.settings-save {
    margin-top: 14px;
    min-height: 44px;
    padding: 0 22px;
    border: none;
    border-radius: 12px;
    background: #b07b2b;
    color: #ffffff;
    font-weight: 700;
    cursor: pointer;
}

.settings-save:disabled,
.zone-form button:disabled {
    opacity: 0.55;
    cursor: default;
}

.settings-message {
    margin: 10px 0 0;
    color: #238148;
    font-size: 13px;
    font-weight: 700;
}

.settings-message--error {
    color: #c21204;
}

.settings-page__status {
    padding: 40px 22px;
    text-align: center;
    color: #6f665d;
    font-size: 14px;
}

.settings-page__status--error {
    color: #c21204;
    font-weight: 600;
}

.zones-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}

.zone-chip {
    display: inline-flex;
    align-items: center;
    min-height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    background: #eba21a;
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
    gap: 6px;
}

.zone-chip button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: none;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.22);
    color: #ffffff;
    cursor: pointer;
}

.zone-chip i {
    font-size: 10px;
}

.zone-form {
    display: grid;
    grid-template-columns: 1fr 40px;
    gap: 8px;
    margin-bottom: 18px;
}

.zone-form input,
.zone-form button {
    height: 40px;
    border: 1px solid #d9dfe8;
    border-radius: 12px;
}

.zone-form input {
    padding: 0 12px;
    color: #344457;
}

.zone-form button {
    background: #2d241e;
    color: #ffffff;
    cursor: pointer;
}

.contacts-list {
    border-top: 1px solid #ece4db;
}

.contacts-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid #ece4db;
}

.contacts-row__name {
    color: #5c6f83;
    font-size: 30px;
    line-height: 1;
}

.contacts-row__state {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    background: #34a9e0;
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
}

@media (max-width: 980px) {
    .settings-page__grid {
        grid-template-columns: 1fr;
    }

    .settings-page__title,
    .contacts-row__name {
        font-size: 34px;
    }
}
</style>
