const Joi = require('joi');
const moment = require('moment');
const db = require('../../dbconfig');

const AppError = require('../../Utils/appError');
const catchAsync = require('../../Utils/catchAsync');

exports.isCollectionExist = catchAsync(async (req, res, next) => {
  const { collectionId } = req.body;
  if (!collectionId)
    return next(new AppError('Collection Id is Required', 400));
  const getCollection = `SELECT azst_collection_id,azst_collection_name 
                          FROM azst_collections_tbl
                          WHERE azst_collection_id = ${collectionId} AND azst_collection_status = 1`;
  const collection = await db(getCollection);
  if (collection.length === 0)
    return next(new AppError('No collection found', 404));
  req.collection = collection[0];
  next();
});

exports.collections = catchAsync(async (req, res, next) => {
  const collectiosrQuery = `SELECT azst_collection_id,azst_collection_name 
                       FROM azst_collections_tbl WHERE azst_collection_status = 1`;

  const collections = await db(collectiosrQuery);
  res.status(200).json(collections);
});

exports.getcollection = catchAsync(async (req, res, next) => {
  res.status(200).json(req.collection);
});

const collectionSchema = Joi.object({
  collectionName: Joi.string().min(1).required(),
});

exports.Addcollection = catchAsync(async (req, res, next) => {
  const { collectionName } = req.body;

  const { error } = collectionSchema.validate(req.body);
  if (error) return next(new AppError(error.message, 400));

  const today = moment().format('YYYY-MM-DD HH:mm:ss');

  const imnsertQuery =
    'INSERT INTO  azst_collections_tbl (azst_collection_name,createdon,updatedby) VALUES (?,?,?)';

  const values = [collectionName, today, req.empId];

  const result = await db(imnsertQuery, values);
  res.status(200).json({ azst_collection_id: result.insertId });
});

exports.updateCollection = catchAsync(async (req, res, next) => {
  const { collectionId, collectionName } = req.body;
  const { error } = collectionSchema.validate({ collectionName });
  if (error) return next(new AppError(error.message, 400));
  const updateQuery =
    'UPDATE azst_collections_tbl SET azst_collection_name=?, updatedby=? where azst_collection_id =? ';
  const values = [collectionName, req.empId, collectionId];

  await db(updateQuery, values);
  res.status(200).json({ message: 'Updated collection ' + collectionName });
});

exports.deleteCollection = catchAsync(async (req, res, next) => {
  const { collectionId } = req.body;
  const deletecollection =
    'UPDATE azst_collections_tbl SET azst_collection_status = 0, updatedby=? where azst_collection_id = ? ';
  const values = [req.empId, collectionId];

  await db(deletecollection, values);
  res.status(200).json({ message: 'collection deleted Successfully ' });
});