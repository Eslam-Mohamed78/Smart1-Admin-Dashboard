import mongoose from "mongoose";

// *************** Pagination ************ //
mongoose.Query.prototype.paginate = function (page) {
  if (!page) return this;
  page = page < 1 || isNaN(page) ? 1 : page;
  const limit = 2;
  const skip = limit * (page - 1);

  return this.skip(skip).limit(limit);
};

// *************** Filter ************ //
export const search = function (modelKeys, queryParams, userRole = false) {
  // query keys
  const queryKeys = Object.keys(queryParams);

  // matched keys
  const matchedKeys = queryKeys.filter((key) => modelKeys.includes(key));
  if (!matchedKeys.length && !userRole) return;
  if (!matchedKeys.length && userRole) return { role: { $ne: "admin" } };

  const options =
    matchedKeys.map((key) => {
      const option = {};
      option[key] = { $regex: queryParams[key], $options: "i" };
      return option;
    }) || "";

  return userRole ? { role: { $ne: "admin" }, $or: options } : { $or: options };
};
