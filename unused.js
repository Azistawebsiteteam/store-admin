// azst_orders_tbl.azst_orders_id,
//       azst_orders_tbl.azst_orders_email,
//       azst_orders_tbl.azst_orders_financial_status,
//       azst_orders_tbl.azst_orders_paid_on,
//       azst_orders_tbl.azst_orders_fulfillment_status,
//       azst_orders_tbl.azst_orders_fulfilled_on,
//       azst_orders_tbl.azst_orders_currency,
//       azst_orders_tbl.azst_orders_subtotal,
//       azst_orders_tbl.azst_orders_shipping,
//       azst_orders_tbl.azst_orders_taxes,
//       azst_orders_tbl.azst_orders_total,
//       azst_orders_tbl.azst_orders_discount_code,
//       azst_orders_tbl.azst_orders_discount_amount,
//       azst_orders_tbl.azst_orders_shipping_method,
//       azst_orders_tbl.azst_orders_status,
//       azst_orders_tbl.azst_orders_created_on,
//       azst_orders_tbl.azst_orders_customer_id,
//       azst_orders_tbl.azst_orders_checkout_id,
//       azst_orders_tbl.azst_orders_cancelled_at,
//       azst_orders_tbl.azst_orders_payment_method,
//       azst_orders_tbl.azst_orders_payment_reference,
//       azst_orders_tbl.azst_orders_vendor,
//       azst_orders_tbl.azst_orders_vendor_code,
//       azst_orders_tbl.azst_orders_tags,
//       azst_orders_tbl.azst_orders_source,
//       azst_orders_tbl.azst_orders_billing_province_name,
//       azst_orders_tbl.azst_orders_shipping_province_name,
//       azst_orders_tbl.azst_orders_payment_id,
//       azst_orders_tbl.azst_orders_payment_references,
//  'price', azst_products.price,
//     'offer_price', azst_sku_variant_info.offer_price,
//   CONCAT(
//     '[',
//     GROUP_CONCAT(
//       JSON_OBJECT(
// 'product_title', azst_products.product_title,
// 'azst_order_product_id', azst_ordersummary_tbl.azst_order_product_id,
// 'azst_order_variant_id', azst_ordersummary_tbl.azst_order_variant_id,
// 'image_src', azst_products.image_src,
// 'price', azst_products.price,
// 'offer_price', azst_sku_variant_info.offer_price,
// 'option1', azst_sku_variant_info.option1,
// 'option2', azst_sku_variant_info.option2,
// 'option3', azst_sku_variant_info.option3,
// 'azst_order_qty', azst_ordersummary_tbl.azst_order_qty
//       )
//     ),
//     ']'
//   ) AS products_details

// azst_customer_id,
//   azst_customer_fname,
//   azst_customer_lname,
//   azst_customer_mobile,
//   azst_customer_email,
//   azst_customer_pwd,
//   azst_customer_hno,
//   azst_customer_area,
//   azst_customer_city,
//   azst_customer_district,
//   azst_customer_state,
//   azst_customer_country,
//   azst_customer_zip,
//   azst_customer_landmark,
//   azst_customer_acceptemail_marketing,
//   azst_customer_company,
//   azst_customer_address1,
//   azst_customer_address2,
//   azst_customer_acceptsms_marketing,
//   azst_customer_totalspent,
//   azst_customer_totalorders,
//   azst_customer_note,
//   azst_customer_taxexempts,
//   azst_customer_tags,
//   azst_customer_status,
//   azst_customer_createdon,
//   azst_customer_updatedon,
//   azst_customer_gender,
//   azst_customer_DOB;
//  azst_customer_updatedby,

// azst_orders_tbl_id,
//   azst_orders_id,
//   azst_orders_email,
//   azst_orders_financial_status,
//   azst_orders_paid_on,
//   azst_orders_fulfillment_status,
//   azst_orders_fulfilled_on,
//   azst_orders_currency,
//   azst_orders_subtotal,
//   azst_orders_shipping,
//   azst_orders_taxes,
//   azst_orders_total,
//   azst_orders_discount_code,
//   azst_orders_discount_amount,
//   azst_orders_shipping_method,
//   azst_orders_status,
//   azst_orders_created_on,
//   azst_orders_customer_id,
//   azst_orders_checkout_id,
//   azst_orders_cancelled_at,
//   azst_orders_payment_method,
//   azst_orders_payment_reference,
//   azst_orders_vendor,
//   azst_orders_vendor_code,
//   azst_orders_tags,
//   azst_orders_source,
//   azst_orders_billing_province_name,
//   azst_orders_shipping_province_name,
//   azst_orders_payment_id,
//   azst_orders_payment_references;