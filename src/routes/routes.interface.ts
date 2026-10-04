import { Router } from "express";

export interface IRouteModule {
  path: string;
  route: Router;
}
