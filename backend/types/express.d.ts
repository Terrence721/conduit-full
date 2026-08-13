// The models package (backend/models) hasn't been retrofitted to TypeScript
// yet - see the "dedicated retrofit pass" phase in todo.md - so there's no
// real User model type to reference here. loggedUser is typed `any` for now
// and should become the real User instance type once models/User.js -> .ts.
declare global {
  namespace Express {
    interface Request {
      loggedUser?: any;
    }
  }
}

export {};
