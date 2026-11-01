// `loggedUser` is the authenticated User model instance stamped onto the
// request by `middleware/authentication.ts`. `models/User.ts` is now a real
// TypeScript file exporting a Sequelize model factory, so reference its
// instance type instead of `any`.
declare global {
  namespace Express {
    interface Request {
      loggedUser?: InstanceType<
        ReturnType<typeof import("../models/User").default>
      >;
    }
  }
}

export {};
