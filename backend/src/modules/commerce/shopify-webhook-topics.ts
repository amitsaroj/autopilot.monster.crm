import { EVENT_NAMES } from '../../events/event.constants';

export type ShopifyTopic =
  | 'carts/update'
  | 'checkouts/create'
  | 'checkouts/update'
  | 'orders/create'
  | 'orders/paid'
  | 'orders/fulfilled'
  | 'app/uninstalled';

export const SHOPIFY_TOPICS: Array<{
  topic: ShopifyTopic;
  event: string;
  fields: string[];
}> = [
  {
    topic: 'carts/update',
    event: EVENT_NAMES.SHOPIFY_CART_UPDATED,
    fields: ['id', 'updated_at', 'line_items'],
  },
  {
    topic: 'checkouts/create',
    event: EVENT_NAMES.SHOPIFY_CHECKOUT_CREATED,
    fields: ['updated_at', 'completed_at', 'currency', 'total_price', 'line_items'],
  },
  {
    topic: 'checkouts/update',
    event: EVENT_NAMES.SHOPIFY_CHECKOUT_UPDATED,
    fields: ['updated_at', 'completed_at', 'currency', 'total_price', 'line_items'],
  },
  {
    topic: 'orders/create',
    event: EVENT_NAMES.SHOPIFY_ORDER_CREATED,
    fields: [
      'id',
      'name',
      'currency',
      'total_price',
      'financial_status',
      'fulfillment_status',
      'created_at',
    ],
  },
  {
    topic: 'orders/paid',
    event: EVENT_NAMES.SHOPIFY_ORDER_PAID,
    fields: [
      'id',
      'name',
      'currency',
      'total_price',
      'financial_status',
      'fulfillment_status',
      'created_at',
    ],
  },
  {
    topic: 'orders/fulfilled',
    event: EVENT_NAMES.SHOPIFY_ORDER_FULFILLED,
    fields: [
      'id',
      'name',
      'currency',
      'total_price',
      'financial_status',
      'fulfillment_status',
      'created_at',
    ],
  },
  { topic: 'app/uninstalled', event: EVENT_NAMES.SHOPIFY_APP_UNINSTALLED, fields: [] },
];

export function topicEvent(topic: string): string | undefined {
  return SHOPIFY_TOPICS.find((subscription) => subscription.topic === topic)?.event;
}
