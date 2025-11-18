import express from "express";
import { additionalCorsHeaders } from "./cors.config.js";

export const setupMiddlewares = (app) => {
  app.use(additionalCorsHeaders);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static("uploads"));
};