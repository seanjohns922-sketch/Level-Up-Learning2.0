# PA6 Home Subscription Decisions

Status: approved commercial direction, deferred implementation.

This document records decisions for PA6. It does not authorise implementation in PA4 or PA5. No checkout, payment provider, webhook, paid entitlement, invoice, subscription, trial conversion or billing UI is currently active.

## Pricing

Australian household pricing:

| Plan | Included children | Monthly | Annual | Annual saving |
| --- | ---: | ---: | ---: | ---: |
| Individual | 1 | $12.50 | $125.00 | $25.00 |
| Family | 2 | $15.00 | $150.00 | $30.00 |
| Family Plus | 3 or more | $17.50 | $175.00 | $35.00 |

Annual pricing provides 12 months of access for the cost of 10 monthly payments.

Before launch, the Platform Owner must confirm whether displayed Australian prices are GST-inclusive. Prices must be configured in the payment provider as integer cents and referenced by immutable provider price IDs. Application clients must never supply or calculate an authoritative charge amount.

## Subscription Ownership

- One subscription belongs to one parent household account, not to a child, email address or school.
- A household subscription grants Home entitlements to specifically linked canonical students up to the plan allowance.
- Family Plus supports all children in the same household, subject to a documented reasonable-use policy.
- School access remains independent from parent billing.
- Multiple parent relationships must not create duplicate child identities or duplicate paid entitlements.

## Billing Intervals

PA6 will require six provider prices:

- `individual_monthly`: 1250 cents
- `individual_annual`: 12500 cents
- `family_monthly`: 1500 cents
- `family_annual`: 15000 cents
- `family_plus_monthly`: 1750 cents
- `family_plus_annual`: 17500 cents

Provider price IDs, not these display keys, become the billing authority after provider configuration.

## Lifecycle Rules

- Successful payment activates or renews derived Home entitlements.
- Failed payment enters an explicit grace period before Home entitlement ends.
- Cancellation retains access until the paid-through date.
- Expiry or cancellation never deletes student identity, learning, assessments, Gems, Cards, Realmies or school history.
- Resubscription reuses the same parent and student identities.
- Monthly-to-annual upgrades may take effect immediately with provider-calculated credit.
- Annual-to-monthly changes take effect at annual renewal.
- Plan upgrades may take effect immediately with provider-calculated proration.
- Plan downgrades take effect at renewal.
- A downgrade below the number of linked children requires the parent to choose which children retain paid Home access before the downgrade completes.
- Refunds follow an explicit Platform Owner policy and are not inferred automatically from unused time.
- Annual renewals receive an advance renewal reminder.

## Integrity Requirements

- Billing webhooks are signature-verified, server-only and idempotent.
- Every provider event is recorded once in an immutable webhook event log.
- Subscription, invoice, payment, refund, cancellation and entitlement history remain reconcilable.
- Entitlement is derived from canonical subscription state; client claims and plan display names are never authoritative.
- Replayed, delayed or out-of-order events must not duplicate access or regress a newer subscription state.
- Parent billing cannot grant parent write access to child progression or rewards.
- School and Home entitlements form a union. Ending one source does not cancel another valid source.

## Platform Admin Requirements

PA6 reporting must expose active, trial, grace, past-due, cancelled and expired subscriptions; renewal dates; household child allowance and assigned children; MRR and ARR; failed payments; refunds; and provider reconciliation exceptions.

## Deferred Scope

Do not implement these decisions before PA6. PA5 may enforce school-hours and Home entitlement boundaries, but it must continue treating Home access as an entitlement independent of payment-provider state.
