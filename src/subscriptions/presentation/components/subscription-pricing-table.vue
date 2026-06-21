<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { VueStripePricingTable, VueStripeProvider } from '@vue-stripe/vue-stripe';
import useSessionStore from '../../../shared/application/session.store.js';
import { useIamStore } from '../../../iam/application/iam-store.js';

const { t } = useI18n();
const sessionStore = useSessionStore();
const iamStore = useIamStore();
const { subscriptionPlan, userRole } = storeToRefs(sessionStore);
const { currentUser } = storeToRefs(iamStore);

const pricingTableLoaded = ref(false);
const pricingTableError = ref('');

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '';
const pricingTableId = import.meta.env.VITE_STRIPE_PRICING_TABLE_ID ?? '';

const planCatalog = [
    {
        id: 'Premium',
        name: 'Premium',
        users: 8,
        locations: 1,
        sensors: 12
    },
    {
        id: 'Enterprise',
        name: 'Enterprise',
        users: 20,
        locations: 4,
        sensors: 40
    }
];

const stripeConfigured = computed(() => Boolean(publishableKey && pricingTableId));

const currentPlanData = computed(() => {
    return planCatalog.find((plan) => plan.id === subscriptionPlan.value) ?? planCatalog[0];
});

const currentPlanSummary = computed(() => ([
    { label: t('shared.subscriptionPage.summary.currentPlan'), value: currentPlanData.value.name },
    { label: t('shared.subscriptionPage.summary.users'), value: currentPlanData.value.users },
    { label: t('shared.subscriptionPage.summary.locations'), value: currentPlanData.value.locations },
    { label: t('shared.subscriptionPage.summary.sensors'), value: currentPlanData.value.sensors }
]));

const customerEmail = computed(() => currentUser.value?.email ?? '');

const clientReferenceId = computed(() => {
    const role = currentUser.value?.role ?? userRole.value ?? 'anonymous';
    const userId = currentUser.value?.id ?? currentUser.value?.email ?? 'guest';
    return `${role}:${userId}`;
});

function handlePricingTableLoad() {
    pricingTableLoaded.value = true;
    pricingTableError.value = '';
}

function handlePricingTableError(error) {
    pricingTableLoaded.value = false;
    pricingTableError.value = error?.message ?? t('shared.subscriptionPage.stripe.error');
}
</script>

<template>
    <section class="subscription-page">
        <header class="subscription-page__header">
            <span class="subscription-page__kicker">{{ t('shared.subscriptionPage.kicker') }}</span>
            <h1 class="subscription-page__title">{{ t('shared.subscriptionPage.title') }}</h1>
            <p class="subscription-page__description">
                {{ t('shared.subscriptionPage.description') }}
            </p>
        </header>

        <div class="subscription-page__summary">
            <article v-for="item in currentPlanSummary" :key="item.label" class="summary-card">
                <span class="summary-card__label">{{ item.label }}</span>
                <strong class="summary-card__value">{{ item.value }}</strong>
            </article>
        </div>

        <section class="checkout-panel" aria-live="polite">
            <div class="checkout-panel__header">
                <div>
                    <span class="checkout-panel__eyebrow">{{ t('shared.subscriptionPage.stripe.eyebrow') }}</span>
                    <h2>{{ t('shared.subscriptionPage.stripe.title') }}</h2>
                </div>
                <span class="checkout-panel__status" :class="{ 'checkout-panel__status--ready': pricingTableLoaded }">
                    {{ pricingTableLoaded ? t('shared.subscriptionPage.stripe.ready') : t('shared.subscriptionPage.stripe.pending') }}
                </span>
            </div>

            <VueStripeProvider v-if="stripeConfigured" :publishable-key="publishableKey">
                <VueStripePricingTable
                    :pricing-table-id="pricingTableId"
                    :customer-email="customerEmail || undefined"
                    :client-reference-id="clientReferenceId"
                    @load="handlePricingTableLoad"
                    @error="handlePricingTableError"
                >
                    <template #loading>
                        <div class="stripe-state stripe-state--loading">
                            {{ t('shared.subscriptionPage.stripe.loading') }}
                        </div>
                    </template>

                    <template #error="{ error }">
                        <div class="stripe-state stripe-state--error">
                            {{ error?.message ?? pricingTableError }}
                        </div>
                    </template>
                </VueStripePricingTable>
            </VueStripeProvider>

            <div v-else class="stripe-state stripe-state--setup">
                <strong>{{ t('shared.subscriptionPage.stripe.setupTitle') }}</strong>
                <p>{{ t('shared.subscriptionPage.stripe.setupDescription') }}</p>
                <code>VITE_STRIPE_PUBLISHABLE_KEY</code>
                <code>VITE_STRIPE_PRICING_TABLE_ID</code>
            </div>

            <p v-if="pricingTableError" class="checkout-panel__error">
                {{ pricingTableError }}
            </p>
        </section>
    </section>
</template>

<style scoped>
.subscription-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.subscription-page__header {
    padding: 24px 28px;
    border: 1px solid #eadfd5;
    border-radius: 8px;
    background: #fffaf5;
}

.subscription-page__kicker,
.checkout-panel__eyebrow {
    display: inline-block;
    color: #9a6a22;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.subscription-page__title {
    margin: 8px 0 10px;
    color: #2f241d;
    font-size: 2.35rem;
    line-height: 1.1;
}

.subscription-page__description {
    max-width: 760px;
    margin: 0;
    color: #6e6157;
    line-height: 1.6;
}

.subscription-page__summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
}

.summary-card,
.checkout-panel {
    background: #ffffff;
    border: 1px solid #eadfd5;
    border-radius: 8px;
    box-shadow: 0 14px 34px rgba(47, 36, 29, 0.07);
}

.summary-card {
    padding: 20px;
}

.summary-card__label {
    color: #8b7a6d;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.summary-card__value {
    display: block;
    margin-top: 12px;
    color: #2f241d;
    font-size: 2rem;
}

.checkout-panel {
    padding: 24px;
}

.checkout-panel__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 22px;
}

.checkout-panel__header h2 {
    margin: 8px 0 0;
    color: #2f241d;
    font-size: 1.55rem;
}

.checkout-panel__status {
    display: inline-flex;
    min-height: 32px;
    align-items: center;
    border-radius: 8px;
    padding: 0 12px;
    background: #f2e8dd;
    color: #6e6157;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
}

.checkout-panel__status--ready {
    background: #e6f5e9;
    color: #1f7a3a;
}

.checkout-panel__error {
    margin: 16px 0 0;
    color: #9b1c13;
    font-weight: 600;
}

.stripe-state {
    border-radius: 8px;
    padding: 18px;
    line-height: 1.55;
}

.stripe-state--loading {
    background: #f8f1e8;
    color: #6e6157;
}

.stripe-state--error,
.stripe-state--setup {
    border: 1px solid #f1c7c3;
    background: #fff6f5;
    color: #7c241d;
}

.stripe-state--setup {
    display: grid;
    gap: 10px;
}

.stripe-state--setup p {
    margin: 0;
}

.stripe-state--setup code {
    width: fit-content;
    border-radius: 6px;
    background: #ffffff;
    padding: 5px 8px;
    color: #2f241d;
}

@media (max-width: 960px) {
    .subscription-page__summary {
        grid-template-columns: 1fr 1fr;
    }
}

@media (max-width: 640px) {
    .subscription-page__summary {
        grid-template-columns: 1fr;
    }

    .subscription-page__title {
        font-size: 2rem;
    }

    .checkout-panel__header {
        flex-direction: column;
    }
}
</style>
