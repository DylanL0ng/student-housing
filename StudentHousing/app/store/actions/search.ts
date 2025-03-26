export const enum actions {
  "UPDATE" = "UPDATE",
}
export interface state {
  people: [];
}

export interface action {
  type: actions;
  payload: any;
}

export const update = () => {
  return async (dispatch: any, getState: any) => {
    dispatch({ type: actions.UPDATE, payload: {} });
  };
};
