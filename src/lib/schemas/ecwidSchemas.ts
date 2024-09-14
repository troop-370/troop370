import { z } from 'zod';
import {
  discountCouponInfoSchema,
  discountInfoSchema,
  handlingFeeInfoSchema,
  orderItemSchema,
  personSchema,
  shippingOptionInfoSchema,
  taxesSchema,
} from '../../routes/(admin)/admin/ecommerce/ecwidSchemas';

export * from '../../routes/(admin)/admin/ecommerce/ecwidSchemas';

export const calculateOrderSchema = z
  .object({
    /**
     * Order subtotal
     */
    subtotal: z.number().optional(),
    /**
     * Order total cost
     */
    total: z.number().optional(),
    /**
     * Customer email address
     */
    email: z.string().optional(),
    /**
     * 	Tax total
     */
    tax: z.number().optional(),
    /**
     * Customer IP
     */
    ipAddress: z.string().optional(),
    /**
     * 	Discount applied to order using a coupon
     */
    couponDiscount: z.number().optional(),
    /**
     * Payment status, will always be returned as INCOMPLETE
     */
    paymentStatus: z.literal('INCOMPLETE').optional(),
    /**
     * Fulfilment status, will always be returned as AWAITING_PROCESSING
     */
    fulfillmentStatus: z.literal('AWAITING_PROCESSING').optional(),
    /**
     * Sum of discounts based on subtotal. Is included into the discount field
     */
    volumeDiscount: z.number().optional(),
    /**
     * Unique customer internal ID (if the order is placed by a registered user)
     */
    customerId: z.number().optional(),
    /**
     * Determines if the order is hidden (removed from the list). Applies to unfinished orders only.
     */
    hidden: z.boolean().optional(),
    /**
     * Sum of discounts based on customer group. Is included into the discount field
     */
    membershipBasedDiscount: z.number().optional(),
    /**
     * The sum of discount based on subtotal AND customer group. Is included into the discount field
     */
    totalAndMembershipBasedDiscount: z.number().optional(),
    /**
     * Information about applied surcharges
     */
    customSurcharges: z
      .array(
        z.object({
          /**
           * Surcharge id. If not specified default value: Custom Surcharge
           */
          id: z.string().optional(),
          /**
           * Surcharge value
           */
          value: z.number(),
          /**
           * Surcharge type. Can be ABSOLUTE or PERCENT
           */
          type: z.enum(['ABSOLUTE', 'PERCENT']),
          /**
           * Surcharge description. Empty if not specified
           */
          description: z.string().optional(),
          /**
           * Controls tax application for the surcharge. If not specified default value: false
           */
          taxable: z.boolean().optional(),
          /**
           * The calculated amount for this surcharge.
           */
          total: z.number(),
        })
      )
      .optional(),
    /**
     * The sum of all applied discounts except for the coupon discount. To get the total order discount, take the sum of couponDiscount and discount field values
     */
    discount: z.number().optional(),
    /**
     * Order total in USD
     */
    usdTotal: z.number().optional(),
    /**
     * The date/time of order placement, e.g 2014-06-06 18:57:19 +0000
     */
    createDate: z.string().optional(),
    /**
     * The date of order placement in UNIX Timestamp format, e.g 1427268654
     */
    createTimestamp: z.number().optional(),
    /**
     * Information about applied coupon
     */
    discountCoupon: discountCouponInfoSchema.optional(),
    /**
     * Order items
     */
    items: z.array(orderItemSchema).optional(),
    /**
     * Name and billing address of the customer
     */
    billingPerson: personSchema.optional(),
    /**
     * Name and address of the person entered in shipping information
     */
    shippingPerson: personSchema.optional(),
    /**
     * 	Information about selected shipping option
     */
    shippingOption: shippingOptionInfoSchema.optional(),
    /**
     * 	All calculated shipping methods for this order (excluding methods where minimumOrderSubtotal value is above the order subtotal)
     */
    availableShippingOptions: shippingOptionInfoSchema.array().optional(),
    /**
     * All calculated taxes for this order
     */
    availableTaxes: taxesSchema.array().optional(),
    /**
     * Handling fee details
     */
    handlingFee: handlingFeeInfoSchema.optional(),
    /**
     * Predicted information about the package to ship items in to customer
     */
    predictedPackage: z.array(z.unknown()).optional(),
    /**
     * Additional payment parameters entered by customer on checkout, e.g. PO number in "Purchase order" payments
     */
    paymentParams: z.record(z.string()).optional(),
    /**
     * Information about applied discounts (coupons are not included)
     */
    discountInfo: z.array(discountInfoSchema).optional(),
    /**
     * Taxes applied to shipping. null for old orders, [] for orders with taxes applied to subtotal only. Is calculated like: (shippingRate + handlingFee)*(taxValue/100)
     */
    taxesOnShipping: taxesSchema.array().optional(),
    /**
     * Order total before gift card was redeemed. Current value is in total field.
     */
    totalBeforeGiftCardRedemption: z.number().optional(),
    /**
     * Absolute amount of gift card discount amount used in this order. Since this is just cart calculation, the actual gift card amount won't be changed after this request.
     */
    giftCardRedemption: z.number().optional(),
  })
  .passthrough();

export const createOrderSchema = z.object({
  /**
   * @deprecated Use orderId instead
   *
   * If the order payment stauts is INCOMPLETE, this is the `internalId` of the order
   * because id and orderId are not created until the order is not marked as INCOMPLETE.
   */
  id: z.number(),
  orderId: z.string().optional(), // only included when the order is not incomplete
});
