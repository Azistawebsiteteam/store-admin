const db = require('../../Database/dbconfig');
const moment = require('moment');

const AppError = require('../../Utils/appError');
const catchAsync = require('../../Utils/catchAsync');

exports.getEligibleDiscounts = catchAsync(async (req, res, next) => {
  const date = moment().format('YYYY-MM-DD HH:mm:ss');
  const id = req.empId;

  // Query for azst_discount_tbl

  const query1 = `
    SELECT 
      azst_dsc_id AS discount_id,
      'discount' AS discount_use_type, 
      azst_dsc_title AS discount_title,
      azst_dsc_code AS discount_code,
      azst_dsc_mode AS discount_mode,
      azst_dsc_value AS discount_value,
      azst_dsc_apply_mode AS discount_apply_mode,
      azst_dsc_apply_id AS discount_apply_id,
      azst_dsc_prc_value AS discount_prc_value,
      azst_dsc_apply_qty AS discount_apply_qty,
      azst_dsc_usage_cnt AS max_usage_count,
      COUNT(azst_cus_dsc_mapping_tbl.azst_cdm_dsc_id) AS discount_used
    FROM
      azst_discount_tbl
    LEFT JOIN
      azst_cus_dsc_mapping_tbl
    ON
      azst_cus_dsc_mapping_tbl.azst_cdm_dsc_id = azst_discount_tbl.azst_dsc_id
      AND azst_cus_dsc_mapping_tbl.azst_cdm_cus_id = ?
    WHERE
      (azst_dsc_elg_cus = 'all' OR JSON_CONTAINS(azst_dsc_elg_cus, JSON_ARRAY(?)))
      AND azst_dsc_status = 1 
      AND ? BETWEEN azst_dsc_start_tm AND azst_dsc_end_tm
    GROUP BY
      azst_dsc_id,
      azst_dsc_title,
      azst_dsc_code,
      azst_dsc_mode,
      azst_dsc_value,
      azst_dsc_apply_mode,
      azst_dsc_apply_id,
      azst_dsc_prc_value,
      azst_dsc_apply_qty,
      max_usage_count
    HAVING
      discount_used < max_usage_count;
  `;

  // Query for azst_buy_x_get_y_discount_tbl
  const query2 = `
    SELECT 
      azst_x_y_dsc_id AS discount_id,
      'xydiscount' AS discount_use_type, 
      azst_x_y_dsc_title AS discount_title,
      azst_x_y_dsc_code AS discount_code,
      azst_x_y_dsc_applyto AS discount_applyto,
      azst_x_y_dsc_applid AS discount_applid,
      azst_x_y_dsc_buy_mode AS discount_buy_mode,
      azst_x_y_dsc_min_add_qty AS discount_min_add_qty,
      azst_x_y_dsc_apply_to AS discount_apply_to,
      azst_x_y_dsc_apply_id AS discount_apply_id,
      azst_x_y_dsc_min_prc_qty AS discount_min_prc_qty,
      azst_x_y_dsc_type AS discount_type,
      azst_x_y_dsc_value AS discount_value,
      azst_x_y_dsc_max_use AS max_usage_count,
      COUNT(azst_cus_dsc_mapping_tbl.azst_cdm_dsc_id) AS discount_used
    FROM
      azst_buy_x_get_y_discount_tbl
    LEFT JOIN
      azst_cus_dsc_mapping_tbl
    ON
      azst_cus_dsc_mapping_tbl.azst_cdm_dsc_id = azst_buy_x_get_y_discount_tbl.azst_x_y_dsc_id
      AND azst_cus_dsc_mapping_tbl.azst_cdm_cus_id = ?
    WHERE
      (azst_buy_x_get_y_discount_tbl.azst_x_y_dsc_elg_cus = 'all' OR JSON_CONTAINS(azst_buy_x_get_y_discount_tbl.azst_x_y_dsc_elg_cus, JSON_ARRAY(?)))
      AND azst_buy_x_get_y_discount_tbl.azst_x_y_dsc_status = 1
      AND ? BETWEEN azst_buy_x_get_y_discount_tbl.azst_x_y_dsc_start_time AND azst_buy_x_get_y_discount_tbl.azst_x_y_dsc_end_time
    GROUP BY
      azst_x_y_dsc_id,
      azst_x_y_dsc_title,
      azst_x_y_dsc_code,
      azst_x_y_dsc_applyto,
      azst_x_y_dsc_applid,
      azst_x_y_dsc_buy_mode,
      azst_x_y_dsc_min_add_qty,
      azst_x_y_dsc_apply_to,
      azst_x_y_dsc_apply_id,
      azst_x_y_dsc_min_prc_qty,
      azst_x_y_dsc_type,
      azst_x_y_dsc_value,
      max_usage_count
    HAVING
      discount_used < max_usage_count;
  `;

  // Execute both queries
  const [result1, result2] = await Promise.all([
    db(query1, [id, id, date]),
    db(query2, [id, id, date]),
  ]);

  // Merge results
  const mergedResults = [...result1, ...result2];

  res.status(200).json(mergedResults);
});

exports.applyDiscountByCode = catchAsync(async (req, res, next) => {
  const { discountCode, cartList } = req.body;
  const customerId = req.empId;

  req.body = { customerId, discountCode, discountType: 'Manual', cartList };
  next();
});
